export interface Notificacion {
    id: number;             // Identificador único
    usuario_id: string;      // Relación con el RUT del usuario (si el RUT es numérico, cambiar a number)
    mensaje: string;         // Contenido de la notificación
    fecha: string;           // Fecha en que se envió la notificación (formato 'YYYY-MM-DD')
    hora: string;            // Hora en que se envió la notificación (formato 'HH:mm:ss')
    tipo: string;            // Tipo de notificación (emergencia, advertencia, etc.)
}
