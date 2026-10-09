import { BadRequestException, Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, } from '@nestjs/swagger';

import { AsistenciaServices } from '../services/asistencia.service.js';
import { CrearAsistenciaDTO, TraerAsistenciasDTO } from '../dto/asistencias_dto.js';


@ApiTags('asistencias')
// comentado por el momento pruebas sin auth
//@ApiBearerAuth()
//@UseGuards(SupabaseAuthGuard)
@Controller('asistencias')
export class AsistenciasController {
    constructor(

        private readonly asistenciaService: AsistenciaServices,
    ) { }

    @Post('sincronizar')
  
    async sincronizar(
        @Body() body: CrearAsistenciaDTO[] | { data: CrearAsistenciaDTO[] },
    ): Promise<any> {
        try {
            const data = Array.isArray(body) ? body : body?.data;
            if (!Array.isArray(data)) {
                throw new BadRequestException('El cuerpo debe ser un arreglo o { data: [...] } (JSON con Content-Type application/json)');
            }
            console.log('Sincronizando asistencias:', data.length);

            return await this.asistenciaService.sincronizarAsistencias(data);
        } catch (error) {
            console.error(error);
            throw error;
        }
    }


    @Get()
    // @ApiHeader({
    //   name: 'x-access-token',
    //   required: false,
    //   description: 'access_token de Supabase (sin "Bearer")',
    // })
    @ApiOperation({ summary: 'Obtener las asistencias rango' })
    @ApiResponse({ status: 200, description: 'Lista de asistencias' })
    @ApiQuery({ name: 'fechaInicio', required: true, description: 'Fecha de inicio del rango' })
    @ApiQuery({ name: 'fechaFin', required: true, description: 'Fecha de fin del rango' })
    @ApiQuery({ name: 'rango', required: false, description: 'Rango opcional' })
    async traerAsistencias(
        @Query() query: TraerAsistenciasDTO,
    ): Promise<any> {
        {
            try {
                const { fechaInicio, fechaFin } = query;
                console.log('Fecha inicio:', fechaInicio, 'Fecha fin:', fechaFin);
                return this.asistenciaService.darAsistenciasDia(fechaInicio, fechaFin);
            } catch (error) {
                console.error(error);
                throw error;
            }

        }
    }
   
}
