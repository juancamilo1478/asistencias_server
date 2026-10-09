import { Controller, Get, Query } from "@nestjs/common";
import { CalendarServices } from "../services/calendar.service.js";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";

@ApiTags('calendario')
// comentado por el momento pruebas sin auth
//@ApiBearerAuth()
//@UseGuards(SupabaseAuthGuard)
@Controller('calendario')
export class CalendarioController {
    constructor(private readonly calendarioService: CalendarServices) { }

    @Get()
    @ApiQuery({ name: 'fecha', required: true, description: 'Fecha obligatoria' })
    @ApiOperation({ summary: 'Verifica si una fecha es domingo o festivo en Colombia' })
    @ApiResponse({ status: 200, description: 'Devuelve true si la fecha es domingo o festivo, false en caso contrario' })
    async mirarSiEsFestivo(
        @Query('fecha') fecha: string,
    ) {
        try {

            return this.calendarioService.esDomingoOFestivoColombia(fecha);
        } catch (error) {
            console.error(error);
            throw error;
        }

    }
}
