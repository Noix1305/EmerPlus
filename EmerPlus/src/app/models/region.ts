import { Comuna } from "./comuna";

export interface Region {
    id: number;
    nombre: string;
    comunas: Comuna[];
  }