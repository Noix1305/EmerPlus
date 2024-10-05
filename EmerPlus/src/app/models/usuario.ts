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
  contactoEmergencia?: Contacto;
  correo?: string;
  rol: [number]; // Cada usuario puede tener múltiples roles
  estado:number;

}