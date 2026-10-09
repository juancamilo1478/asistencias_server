import { Inject, Injectable } from "@nestjs/common";
import { GOOGLE_DRIVE, GOOGLE_SHEETS } from "../google/google.providers.js";
import { drive_v3, sheets_v4 } from "googleapis";
import { env } from "process";
import { AsistenciaDTO, CrearAsistenciaDTO } from "../dto/asistencias_dto.js";
import { Respuesta } from "../common/respuestas.js";
import { CalendarServices } from "./calendar.service.js";


@Injectable()
export class AsistenciaServices {

    constructor(
        @Inject(GOOGLE_SHEETS)
        private readonly sheets: sheets_v4.Sheets,

        @Inject(GOOGLE_DRIVE)
        private readonly drive: drive_v3.Drive,

        @Inject(CalendarServices)
        private readonly calendarioServicios: CalendarServices,

    ) {

    }
    async darAsistenciasDia(fechaInicio: string, fechaFin: string, rango = 'A:Z'): Promise<Respuesta<AsistenciaDTO[]>> {
        // Implement your method logic here
        try {

            const spreadsheetId = env.GOOGLE_SHEET_ID;
            const worksheet = 'Asistencia';
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${worksheet}!${rango}`,
            });
            const datos = response.data.values?.slice(1) ?? [];
            // Your logic to fetch and process attendance for the given day
            return {
                success: true,
                data: await this.convertirAsistenciaIdentidad(fechaInicio, fechaFin, datos)
            };
        } catch (error) {
            console.error("Error fetching attendance for the day:", error);
            return {
                success: false,
                data: [],
                message: "Error fetching attendance for the day"
            };
        }
    }
    async convertirAsistenciaIdentidad(
        fechaInicio: string,
        fechaFin: string,
        filas: unknown[][]
    ): Promise<AsistenciaDTO[]> {

        const convertirFecha = (fecha: string): Date | null => {
            if (!fecha || !fecha.trim()) {
                return null;
            }

            const [dia, mes, año] = fecha
                .trim()
                .split("/")
                .map(Number);

            if (!dia || !mes || !año) {
                return null;
            }

            const resultado = new Date(año, mes - 1, dia);
            resultado.setHours(0, 0, 0, 0);

            return resultado;
        };

        const inicio = convertirFecha(fechaInicio);
        const fin = convertirFecha(fechaFin);

        if (!inicio || !fin) {
            throw new Error("Las fechas de inicio o fin no son válidas");
        }

        fin.setHours(23, 59, 59, 999);

        return filas
            .filter(fila =>
                fila.some(valor =>
                    valor !== null &&
                    valor !== undefined &&
                    valor !== ""
                )
            )
            .map(fila => {

                const valorFecha = String(fila[5] ?? "").trim();

                // Si NO tiene fecha, no lo eliminamos
                if (!valorFecha) {
                    return {
                        id: String(fila[1] ?? ""),
                        cedula: String(fila[2] ?? ""),
                        nombre: String(fila[3] ?? ""),
                        obra: String(fila[4] ?? ""),
                        fechaEntrada: "",
                        horaEntrada: String(fila[6] ?? ""),
                        fechaSalida: String(fila[7] ?? ""),
                        horaSalida: String(fila[8] ?? ""),
                        duracion: String(fila[9] ?? ""),
                        unicoRegistro: String(fila[10] ?? ""),
                        contratista: String(fila[11] ?? ""),
                        centroTrabajo: String(fila[12] ?? ""),
                        finalizado: Boolean(fila[13] ?? false),
                        idEntrada: String(fila[14] ?? ""),
                        idContratista: String(fila[15] ?? ""),
                        idObra: String(fila[16] ?? ""),
                        finDeSemanaOfestivo: Boolean(fila[17] ?? false),
                        cargo: String(fila[18] ?? "")
                    };
                }

                const fechadato = convertirFecha(valorFecha);

                // Fecha con formato incorrecto
                if (!fechadato) {
                    return null;
                }

                // Fecha fuera del rango
                if (
                    fechadato < inicio ||
                    fechadato > fin
                ) {
                    return null;
                }

                return {
                    id: String(fila[1] ?? ""),
                    cedula: String(fila[2] ?? ""),
                    nombre: String(fila[3] ?? ""),
                    obra: String(fila[4] ?? ""),
                    fechaEntrada: String(fila[5] ?? ""),
                    horaEntrada: String(fila[6] ?? ""),
                    fechaSalida: String(fila[7] ?? ""),
                    horaSalida: String(fila[8] ?? ""),
                    duracion: String(fila[9] ?? ""),
                    unicoRegistro: String(fila[10] ?? ""),
                    contratista: String(fila[11] ?? ""),
                    centroTrabajo: String(fila[12] ?? ""),
                    finalizado: Boolean(fila[13] ?? false),
                    idEntrada: String(fila[14] ?? ""),
                    idContratista: String(fila[15] ?? ""),
                    idObra: String(fila[16] ?? ""),
                    finDeSemanaOfestivo: Boolean(fila[17] ?? false),
                    cargo: String(fila[18] ?? "")
                };
            })
            .filter(
                (fila): fila is AsistenciaDTO =>
                    fila !== null
            );
    }

    async sincronizarAsistencias(data: CrearAsistenciaDTO[], rango = 'A:Z'): Promise<any> {
        try {
            const updates: {
                range: string;
                values: string[][];
            }[] = [];
            const spreadsheetId = env.GOOGLE_SHEET_ID;
            const worksheet = 'Asistencia';
            const response = await this.sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${worksheet}!${rango}`,
            });
            const datos = response.data.values?.slice(1) ?? [];
            // convertir a libro 
            let libroAsistencias: Record<string, any> = {};
            const filasActualizar: any[] = [];
            const filasAgregar: any[] = [];
            datos.forEach((fila, index) => {
                const id = String(fila[1] ?? "");
                if (!id) {
                    return;
                }
                if (!libroAsistencias[id]) {
                    libroAsistencias[id] = {
                        fila: index + 2, // +2 porque quitaste el encabezado con slice(1)
                        id: String(fila[1] ?? ""),
                        cedula: String(fila[2] ?? ""),
                        nombre: String(fila[3] ?? ""),
                        obra: String(fila[4] ?? ""),
                        fechaEntrada: String(fila[5] ?? ""),
                        horaEntrada: String(fila[6] ?? ""),
                        fechaSalida: String(fila[7] ?? ""),
                        horaSalida: String(fila[8] ?? ""),
                        duracion: String(fila[9] ?? ""),
                        unicoRegistro: String(fila[10] ?? ""),
                        contratista: String(fila[11] ?? ""),
                        centroTrabajo: String(fila[12] ?? ""),
                        finalizado: String(fila[13] ?? "").toLowerCase() === "true",
                        idEntrada: String(fila[14] ?? ""),
                        idContratista: String(fila[15] ?? ""),
                        idObra: String(fila[16] ?? ""),
                        finDeSemanaOfestivo: String(fila[17] ?? "").toLowerCase() === "true",
                        cargo: String(fila[18] ?? "")
                    };
                }
            });
            // recorremos los datos a actualizar 
            const siguienteFila = (response.data.values?.length ?? 1) + 1;
            const definidos = (obj: Record<string, any>) =>
                Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined && v !== null));
            const vistos = new Set<string>();
            for (const asistencia of data) {
                const id = String(asistencia.id ?? "");
                if (!id) {
                    continue;
                }
                if (libroAsistencias[id]) {
                    

                    // acumulamos para que duplicados en el mismo lote no se pisen
                    libroAsistencias[id] = { ...libroAsistencias[id], ...definidos(asistencia) };
                    if (!vistos.has(id)) {
                        vistos.add(id);
                        filasActualizar.push({ id });
                    }
                } else {
                    libroAsistencias[id] = { ...definidos(asistencia), fila: siguienteFila + filasAgregar.length };
                    vistos.add(id);
                    filasAgregar.push({ id });
                }
            }
            const aFilaActualizar = filasActualizar.map(({ id }) => ({ fila: libroAsistencias[id].fila, asistencia: libroAsistencias[id] }));
            filasActualizar.length = 0;
            filasActualizar.push(...aFilaActualizar);
            const nuevas = filasAgregar.map(({ id }) => libroAsistencias[id]);
            filasAgregar.length = 0;
            filasAgregar.push(...nuevas);
            // columnas A:S (19 valores): A y B llevan el mismo id
            const armarFila = async (asistencia: any): Promise<string[]> => {
                const finDeSemanaOfestivo = asistencia.finDeSemanaOfestivo
                    ?? (asistencia.fechaEntrada
                        ? await this.calendarioServicios.esDomingoOFestivoColombia(asistencia.fechaEntrada)
                        : false);
                return [
                    asistencia.id,
                    asistencia.id,
                    asistencia.cedula,
                    asistencia.nombre,
                    asistencia.obra,
                    asistencia.fechaEntrada,
                    asistencia.horaEntrada,
                    asistencia.fechaSalida,
                    asistencia.horaSalida,
                    asistencia.duracion,
                    asistencia.unicoRegistro,
                    asistencia.contratista,
                    asistencia.centroTrabajo,
                    asistencia.finalizado,
                    asistencia.idEntrada,
                    asistencia.idContratista,
                    asistencia.idObra,
                    finDeSemanaOfestivo,
                    asistencia.cargo
                ].map(valor => String(valor ?? ""));
            };

            for (const { fila, asistencia } of filasActualizar) {
                updates.push({
                    range: `${worksheet}!A${fila}:S${fila}`,
                    values: [await armarFila(asistencia)]
                });
            }

            const filasNuevas: string[][] = [];
            for (const asistencia of filasAgregar) {
                filasNuevas.push(await armarFila(asistencia));
            }

            if (updates.length > 0) {
                await this.sheets.spreadsheets.values.batchUpdate({
                    spreadsheetId,
                    requestBody: {
                        valueInputOption: 'USER_ENTERED',
                        data: updates,
                    },
                });
            }

            // append inserta filas nuevas; escribir fuera del grid con update falla
            if (filasNuevas.length > 0) {
                await this.sheets.spreadsheets.values.append({
                    spreadsheetId,
                    range: `${worksheet}!A:S`,
                    valueInputOption: 'USER_ENTERED',
                    insertDataOption: 'INSERT_ROWS',
                    requestBody: { values: filasNuevas },
                });
            }

            return {
                success: true,
                actualizados: filasActualizar.length,
                creados: filasAgregar.length,
            };
        } catch (error) {
            console.error(error);
            throw error;
        }
    }
}