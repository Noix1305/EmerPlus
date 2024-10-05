import { HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Region } from 'src/app/models/region';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { firstValueFrom, map, Observable } from 'rxjs';
import { Comuna } from 'src/app/models/comuna';

@Injectable({
  providedIn: 'root'
})
export class RegionComunaService {
  pathRegion = 'regiones';
  pathComuna = 'comunas';

  regiones: Region[] = [];
  comunas: Comuna[] = [];

  constructor(private apiConfig: ApiConfigService) { }

  async obtenerRegiones(): Promise<Region[]> {
    const params = new HttpParams().set('select', '*');

    const regiones$ = this.apiConfig.get<Region[]>(this.pathRegion, params).pipe(
      map(response => {
        return response.body || []; // Devuelve el body o un array vacío si no hay
      })
    );

    try {
      // Usa firstValueFrom para esperar la respuesta
      const regiones = await firstValueFrom(regiones$);
      this.regiones = regiones; // Asigna las regiones a la propiedad
      return regiones; // Devuelve las regiones
    } catch (error) {
      console.error('Error al obtener regiones:', error);
      return []; // Devuelve un array vacío en caso de error
    }
  }

  async obtenerComunas(): Promise<Comuna[]> {
    const params = new HttpParams().set('select', '*');

    const comunas$ = this.apiConfig.get<Comuna[]>(this.pathComuna, params).pipe(
      map(response => {
        return response.body || []; // Devuelve el body o un array vacío si no hay
      })
    );

    try {
      // Usa firstValueFrom para esperar la respuesta
      const comunas = await firstValueFrom(comunas$);
      this.comunas = comunas; // Asigna las regiones a la propiedad
      return comunas; // Devuelve las regiones
    } catch (error) {
      console.error('Error al obtener regiones:', error);
      return []; // Devuelve un array vacío en caso de error
    }
  }

  getComunaPorRegion(idRegion: number): Observable<HttpResponse<Comuna[]>> {
    const params = new HttpParams().set('region_id', `eq.${idRegion}`);
    return this.apiConfig.get<Comuna[]>(this.pathComuna, params); // Cambia Comuna a Comuna[]
}


}
