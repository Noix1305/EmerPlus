import { Rol } from "./rol";


export interface Usuario {
  rut: string;
  password: string;
  nombre?:string;
  pApellido?: string;
  sApellido?: string;
  telefono?: number;
  region?:string;
  comuna?:string;
  contactoEmergencia?:number;
  rol: Rol[]; // Cada usuario puede tener múltiples roles
}