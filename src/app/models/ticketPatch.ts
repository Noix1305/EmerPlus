export interface TicketPatch {
    id:number;
    estado_id: number;
    asignado?:string;
    prioridad?: string;
    fecha_actualizacion: Date;
    resuelto_por?: string;
    satisfaccion_id?: number;
}