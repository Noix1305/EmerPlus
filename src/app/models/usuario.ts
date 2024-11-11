import { Contacto } from "./contacto";

export interface Usuario {
  rut: string;
  password: string;
  nombre?: string;
  papellido?: string;
  sapellido?: string;
  telefono?: number;
  regionid?: number;
  comunaid?: number;
  contactoEmergencia?: Contacto; // Esta propiedad es opcional
  correo?: string;
  rol: [number]; // Puede ser un array
  rolNombre?:string;
  estado: number;
}
