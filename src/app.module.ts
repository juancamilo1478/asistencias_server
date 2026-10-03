import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import { PersonalService } from './services/personal.service.js';
import { PersonalController } from './controller/personal.controller.js';
export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // Distributed tracing, auto-correlated logs, request/job metrics, error
    // telemetry, alarms, and more — out of the box. Sign up at https://observe.nestjs.com

  ],
  controllers: [PersonalController],
  providers: [PersonalService],
})
export class AppModule { }
