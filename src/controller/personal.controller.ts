import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiHeader } from '@nestjs/swagger';
import { PersonalService } from '../services/personal.service.js';
import { SupabaseAuthGuard } from '../auth/supabase_auth.guard.js';
@ApiTags('personal')
@ApiBearerAuth()
@UseGuards(SupabaseAuthGuard)
@Controller('personal')
export class PersonalController {
  constructor(private readonly personalService: PersonalService) { }

  @Get()
  @ApiHeader({
    name: 'x-access-token',
    required: false,
    description: 'access_token de Supabase (sin "Bearer")',
  })
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  async createPersonal() {
    try {
      return this.personalService.obtenerDatos();
    } catch (error) {
      console.error(error);
      throw error;
    }

  }
}
