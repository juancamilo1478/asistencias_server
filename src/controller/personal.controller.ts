import { Controller, Get, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PersonalService } from '../services/personal.service.js';
@ApiTags('Personal')
@Controller()
export class PersonalController {
  constructor(private readonly personalService: PersonalService) {}

  @Post()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  async createPersonal()  {
    return this.personalService.obtenerDatos()  ;
  }
}
