import { IsOptional, IsString } from "class-validator";

export class TraerAsistenciasDTO {
    @IsString()
    fechaInicio: string;

    @IsString()
    fechaFin: string;

    @IsOptional()
    @IsString()
    rango?: string;
}

export interface AsistenciaDTO {
    id: string;
    cedula: string;
    nombre: string;
    obra: string;
    fechaEntrada: string;
    horaEntrada: string;
    fechaSalida: string;
    horaSalida: string;
    duracion: string;
    unicoRegistro:string;
    contratista: string;
    centroTrabajo: string;
    finalizado:boolean;
    idEntrada: string;
    idContratista: string;
    idObra:string;
    finDeSemanaOfestivo: boolean;
    cargo: string;
}
export interface CrearAsistenciaDTO {
    id: string;
    cedula: string;
    nombre: string;
    obra: string;
    fechaEntrada: string;
    horaEntrada: string;
    fechaSalida: string;
    horaSalida?: string;
    duracion?: string;
    unicoRegistro:string;
    contratista: string;
    centroTrabajo?: string;
    finalizado:boolean;
    idEntrada?: string;
    idContratista: string;
    idObra:string;
    finDeSemanaOfestivo?: boolean;
    cargo: string;
}