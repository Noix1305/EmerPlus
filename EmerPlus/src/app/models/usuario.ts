import { Contacto } from "./contacto";
import { Rol } from "./rol";


export interface Usuario {
  rut: string;
  password: string;
  nombre?: string;
  pApellido?: string;
  sApellido?: string;
  telefono?: number;
  regionid?: number;
  comunaid?: number;
  contactoEmergencia?: Contacto;
  correo?: string;
  rol: Rol[]; // Cada usuario puede tener múltiples roles
  deleted_at: Date
}