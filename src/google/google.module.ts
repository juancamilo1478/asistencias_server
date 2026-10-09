import { Module } from '@nestjs/common';
import { googleProviders } from './google.providers.js';
 
// modulo usado para conectarse con los servicios de google fotos google drive ,etc con un bot en espesifico se usa llave de auth
@Module({
    providers: googleProviders,
    exports: googleProviders,
    // GoogleCalendarModule, // This line seems incorrect as there is no such module imported. It should be removed or replaced with the correct module if it exists.
})
export class GoogleModule {}