import { Rol } from "./rol";

export interface Usuario{
    rut: string;
    password: string
    rol: Rol[];
}


