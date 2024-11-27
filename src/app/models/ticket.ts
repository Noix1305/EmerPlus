export interface Ticket {
    id?: number;
    usuario_id: string;
    nombreUsuario: string;
    correo?: string;
    descripcion: string;
    estado_id: number;
    prioridad?: string;
    fecha_creacion: Date;
    fecha_actualizacion: Date;
    fecha_cierre?: Date;
    resuelto_por?: string;
    comentarios: string;
    tipo_problema_id:number;
    satisfaccion_id?: number;
    asignado?:string
    showStars?:boolean;
}