export interface SolicitudDeEmergencia {
    id?: number
    usuario_id: string;
    latitud: number;
    longitud: number;
    fecha: string;
    hora: string;
    tipo: string;
    estado: number;
    estadoDescripcion?: string;
    imageUrl?: string | null;
    entidad: number;
    asignacion?: string;
    comentario?: string;
}
