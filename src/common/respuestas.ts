export interface Respuesta<T> {
    success: boolean;
    data?: T;
    message?: string;
}