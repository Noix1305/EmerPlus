import { Rol } from "./rol";


export interface Usuario {
    username: string;
    password: string;
    rol: Rol[]; // Cada usuario puede tener múltiples roles
  }