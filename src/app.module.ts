import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { PersonalService } from './services/personal.service.js';
import { PersonalController } from './controller/personal.controller.js';
import { GoogleModule } from './google/google.module.js';
import { AsistenciasController } from './controller/asistencias.controller.js';
import { AsistenciaServices } from './services/asistencia.service.js';
import { CalendarServices } from './services/calendar.service.js';
import { CalendarioController } from './controller/domingoFestivo.controller.js';
export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    GoogleModule
  ],
  // fecha no se usa solo test
  controllers: [PersonalController, AsistenciasController, CalendarioController],
  providers: [PersonalService, AsistenciaServices,CalendarServices],
})
export class AppModule { }
