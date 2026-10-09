import { Inject, Injectable } from '@nestjs/common';
import { drive_v3, google, sheets_v4 } from 'googleapis';
import { env } from '../config/env.js';
import { PersonalDto } from '../dto/personal_dto.js';
import { GOOGLE_SHEETS, GOOGLE_DRIVE } from '../google/google.providers.js';
import { Respuesta } from '../common/respuestas.js';

@Injectable()
export class PersonalService {
 
    constructor(
        @Inject(GOOGLE_SHEETS)
        private readonly sheets: sheets_v4.Sheets,

        @Inject(GOOGLE_DRIVE)
        private readonly drive: drive_v3.Drive,
    ) {

    }


    /**
     * @worksheet Personal
     */
    async obtenerDatos(rango = 'A:Z'): Promise<Respuesta<PersonalDto[]>> {
        try {
            const spreadsheetId = env.GOOGLE_SHEET_ID;
            const worksheet ='Personal';
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${worksheet}!${rango}`,
            });
            // Convertir los datos obtenidos a PersonalDto[][]
            const datos = response.data.values?.slice(1) ?? [];
            return {
                success: true,
                data: await this.convertirADto(datos),
                message: 'Datos obtenidos correctamente',
            };
        }
        catch (error) {
            console.error('Error al obtener los datos:', error);
            return {
                success: false,
                message: 'Error al obtener los datos',
            };
        }
    }

    async convertirADto(filas: unknown[][]): Promise<PersonalDto[]> {
        return Promise.all(
            filas
                .filter(fila =>
                    fila.some(valor =>
                        valor !== null &&
                        valor !== undefined &&
                        valor !== ""
                    )
                )
                .map(async (fila) => ({

                    id: String(fila[1] ?? ""),
                    cedula: String(fila[2] ?? ""),
                    nombre: String(fila[3] ?? ""),
                    telefono: String(fila[4] ?? ""),
                    direccion: String(fila[5] ?? ""),
                    foto: await this.convertirFoto(String(fila[6] ?? "")),
                    obra: String(fila[7] ?? ""),
                    contratista: String(fila[8] ?? ""),
                    idObra: String(fila[9] ?? ""),
                    idContratista: String(fila[10] ?? ""),
                    cargo:String(fila[11] ?? "")
                }))
        );
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

            
            return `https://lh3.googleusercontent.com/d/${archivo.id}`;

        } catch (error) {
            console.error('Error crítico al buscar la foto en Google Drive:', error);
            return foto;
        }
    }

}