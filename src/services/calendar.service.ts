import { Inject, Injectable, Logger } from "@nestjs/common";
import { GOOGLE_CALENDAR } from "../google/google.providers.js";
import { calendar_v3 } from "googleapis";

@Injectable()
export class CalendarServices {


    private readonly CALENDARIO_FESTIVOS_ID =
        'c_850384203ea54932befee08b52017e798053f983e93a8fe3e49d6eb639cbbea6@group.calendar.google.com';

    constructor(
        @Inject(GOOGLE_CALENDAR)
        private readonly googleCalendar: calendar_v3.Calendar,
    ) { }

    /**
     * Verifica si una fecha dada es domingo o festivo en Colombia
     * @param fecha Fecha a consultar (string ISO, Date o timestamp)
     */
    async esDomingoOFestivoColombia(fecha: String | string): Promise<boolean> {
        const [dia, mes, año] = fecha.split('/').map(Number);

        const date = new Date(año, mes - 1, dia);
        // 1. Domingo
        if (date.getDay() === 0) {
            return true;
        }
        // 2. Rango de inicio y fin del día en ISO String
        const inicio = new Date(date);
        inicio.setHours(0, 0, 0, 0);
        const fin = new Date(date);
        fin.setHours(23, 59, 59, 999);
        try {
            // 3. Consulta de eventos a la API de Google Calendar
            const response = await this.googleCalendar.events.list({
                calendarId: this.CALENDARIO_FESTIVOS_ID,
                timeMin: inicio.toISOString(),
                timeMax: fin.toISOString(),
                singleEvents: true,
            });

            const eventos = response.data.items ?? [];

            if (eventos.length > 0) {
                return true;
            }

            return false;
        } catch (error) {

            throw error;
        }
    }

}