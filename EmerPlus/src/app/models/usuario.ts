import { Rol } from "./rol";

export interface Usuario{
    username: string;
    password: string
    rol: Rol[];
}