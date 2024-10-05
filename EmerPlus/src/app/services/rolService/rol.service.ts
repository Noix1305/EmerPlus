import { Injectable } from '@angular/core';
import { Rol } from 'src/app/models/rol';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { firstValueFrom, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RolService {
  path = 'roles';
  roles: Rol[] = [];

  constructor(private apiConfig: ApiConfigService) { }

  // Método para obtener todos los roles desde Supabase
  async obtenerRoles(): Promise<Rol[]> {
    const params = new HttpParams().set('select', '*');

    const roles$ = this.apiConfig.get<Rol[]>(this.path, params).pipe(
      map(response => {
        return response.body || []; // Devuelve el body o un array vacío si no hay
      })
    );

    try {
      // Usa firstValueFrom para esperar la respuesta
      const roles = await firstValueFrom(roles$);
      this.roles = roles; // Asigna los roles a la propiedad
      return roles; // Devuelve los roles
    } catch (error) {
      console.error(error);
      return []; // Devuelve un array vacío en caso de error
    }
  }

  // Método para obtener un rol por ID
  async obtenerRolPorId(id: number): Promise<Rol | undefined> {
    const roles = await this.obtenerRoles(); // Obtiene todos los roles
    return roles.find(rol => rol.id === id); // Retorna el rol con el ID proporcionado
}

  // Método para obtener la descripción de un rol
  async obtenerNombreRol(id: number): Promise<string | undefined> {
    const rol = await this.obtenerRolPorId(id); // Obtiene el rol por ID

    return rol ? rol.nombre : undefined; // Devuelve la descripción (nombre) si lo encuentra
  }
}
