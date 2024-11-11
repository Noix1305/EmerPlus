import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EstadoSolicitud } from 'src/app/models/estadoSolicitud';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { firstValueFrom, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstadoSolicitudService {
  path = 'estadosolicitud'

  estados: EstadoSolicitud[] = [];

  constructor(private _apiConfig: ApiConfigService) { }

  async obtenerEstadoSolcitudes(): Promise<EstadoSolicitud[]> {
    const params = new HttpParams().set('select', '*');

    const estados$ = this._apiConfig.get<EstadoSolicitud[]>(this.path, params).pipe(
      map(response => {
        return response.body || []; // Devuelve el body o un array vacío si no hay
      })
    );

    try {
      // Usa firstValueFrom para esperar la respuesta
      const estados = await firstValueFrom(estados$);
      this.estados = estados; // Asigna los estados a la propiedad
      return estados; // Devuelve los estados
    } catch (error) {
      console.error(error);
      return []; // Devuelve un array vacío en caso de error
    }
  }

  async obtenerEstadoPorId(id: number): Promise<EstadoSolicitud | undefined> {
    const estados = await this.obtenerEstadoSolcitudes(); // Obtiene todos los estados
    return estados.find(estados => estados.id === id); // Retorna el estados con el ID proporcionado
  }

  // Método para obtener la descripción de un estados
  async obtenerNombreRol(id: number): Promise<string | undefined> {
    const estado = await this.obtenerEstadoPorId(id); // Obtiene el estados por ID

    return estado ? estado.descripcion : undefined; // Devuelve la descripción (descripcion) si lo encuentra
  }
}
