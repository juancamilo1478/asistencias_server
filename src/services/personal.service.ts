import { Injectable } from '@nestjs/common';
import { drive_v3, google, sheets_v4 } from 'googleapis';
import { env } from '../config/env.js';
import { PersonalDto } from '../dto/personal_dto.js';

@Injectable()
export class PersonalService {
    private readonly sheets: sheets_v4.Sheets;
    private readonly drive: drive_v3.Drive;
    constructor() {
        const auth = new google.auth.GoogleAuth({
            keyFile:
                process.env.GOOGLE_APPLICATION_CREDENTIALS ??
                'src/llaves/google.json',
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets.readonly',
                'https://www.googleapis.com/auth/drive.readonly',
            ],
        });

        this.sheets = google.sheets({ version: 'v4', auth });
        this.drive = google.drive({ version: 'v3', auth });
    }

    async obtenerDatos(rango = 'A:Z'): Promise<PersonalDto[]> {
        try {
            const spreadsheetId = env.GOOGLE_SHEET_ID;
            const worksheet = env.WORKSHEET;
            if (!spreadsheetId) {
                throw new Error('La variable de entorno GOOGLE_SHEET_ID no está configurada.');
            }

            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${worksheet}!${rango}`,
            });
            // Convertir los datos obtenidos a PersonalDto[][]
            const datos = response.data.values?.slice(1) ?? [];
            return await this.convertirADto(datos);
        }
        catch (error) {
            console.error('Error al obtener los datos:', error);
            throw error;
        }
    }

    async convertirADto(filas: unknown[][]): Promise<PersonalDto[]> {
        return Promise.all(filas.map(async (fila) => ({
            id: Number(fila[0]),
            cedula: String(fila[1]),
            nombre: String(fila[2]),
            foto: await this.convertirFoto(String(fila[3])),
        })));
    }
    /**
     * @requerimiento se necesita chekear si la foto esta en lh3 si lo esta dejar normal 
     * @requerimiento2 se necesita convertir las url de appsheet a lh3
     */
    private async convertirFoto(foto: string): Promise<string> {
        if (foto.includes('lh3.googleusercontent.com')) {
            return foto;
        }

        let fileName: string | null;
        try {
            fileName = new URL(foto).searchParams.get('fileName');
            if (!fileName) return foto;
        } catch {
            fileName = foto.split(/[?#]/, 1)[0];
        }

        if (!fileName) return foto;

        const ruta = decodeURIComponent(fileName);
        const nombre = ruta.split(/[\\/]/).filter(Boolean).pop();
        if (!nombre) return foto;

        // Limpiamos posibles espacios en blanco accidentales en el nombre
        const nombreLimpio = nombre.trim();
        console.log('Buscando archivo en Drive:', nombreLimpio);

        const folderId = env.FOLDER_DRIVE_FOTOS;

        try {
            // OPCIÓN 1: Búsqueda flexible usando 'contains' por si hay variaciones en el nombre
            let response = await this.drive.files.list({
                q: `'${folderId}' in parents and name contains '${nombreLimpio}' and trashed = false`,
                fields: 'files(id, name, mimeType, parents)',
                pageSize: 5,
                supportsAllDrives: true,
                includeItemsFromAllDrives: true,
            });

            let archivo = response.data.files?.[0];

            // OPCIÓN 2 de emergencia: Si aún así no aparece, listemos los elementos de la carpeta
            // para imprimir qué hay dentro y detectar si el folderId es correcto o el nombre difiere.
            if (!archivo?.id) {
                console.log(`[AVISO] No se encontró por nombre exacto/parcial. Listando contenido de la carpeta ${folderId}:`);
                const listResponse = await this.drive.files.list({
                    q: `'${folderId}' in parents and trashed = false`,
                    fields: 'files(id, name)',
                    pageSize: 20,
                    supportsAllDrives: true,
                    includeItemsFromAllDrives: true,
                });

                console.log('Archivos reales encontrados en la carpeta:', listResponse.data.files);
                return foto;
            }

            console.log(`¡Archivo encontrado! ID: ${archivo.id} (${archivo.name})`);
            return `https://lh3.googleusercontent.com/d/${archivo.id}`;

        } catch (error) {
            console.error('Error crítico al buscar la foto en Google Drive:', error);
            return foto;
        }
    }

}