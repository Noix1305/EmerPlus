
export interface CrearUsuario {
  rut: string;
  password: string;
  correo: string;
  rol: [number]; // Puede ser un array
  estado: number;
}