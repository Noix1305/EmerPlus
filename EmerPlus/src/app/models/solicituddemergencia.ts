export interface SolicitudDeEmergencia {
    id?: number
    usuario_id: string;      // ID o RUT del usuario (si el RUT es alfanumérico, puede ser string)
    latitud: number;         // Latitud de la ubicación en la emergencia (double en SQL se convierte a number en TypeScript)
    longitud: number;        // Longitud de la ubicación en la emergencia
    fecha: string;           // Fecha de la emergencia (ISO string o 'YYYY-MM-DD')
    hora: string;            // Hora de la emergencia (HH:mm:ss formato de cadena)
    tipo: string;            // Tipo de emergencia
    estado: number;
    estadoDescripcion?: string;
    image_url?: string;
}
