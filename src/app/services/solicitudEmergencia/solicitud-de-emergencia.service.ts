import { Injectable } from '@angular/core';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { catchError, firstValueFrom, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { SolicitudPatch } from 'src/app/models/solicitudPatch';

@Injectable({
  providedIn: 'root'
})
export class SolicitudDeEmergenciaService {

  private path = 'solicitudemergencia';

  solicitudes: SolicitudDeEmergencia[] = [];

  constructor(private _apiConfig: ApiConfigService) { }

  // Método para enviar una nueva solicitud de emergencia (POST)
  enviarSolicitud(solicitud: SolicitudDeEmergencia): Observable<HttpResponse<SolicitudDeEmergencia>> {
    return this._apiConfig.post<SolicitudDeEmergencia>(this.path, solicitud).pipe(
      catchError(this.handleError)
    );
  }

  async obtenerUltimaSolicitud(): Promise<SolicitudDeEmergencia | null> {
    try {
      const solicitudes = await this.obtenerSolicitudes(); // Espera a que se resuelva la promesa
      if (solicitudes.length > 0) {
        return solicitudes[solicitudes.length - 1]; // Devuelve la última solicitud
      } else {
        console.warn('No se encontraron solicitudes.');
        return null; // Devuelve null si no hay solicitudes
      }
    } catch (error) {
      console.error('Error al obtener la última solicitud:', error);
      return null; // Devuelve null en caso de error
    }
  }


  async obtenerSolicitudes(): Promise<SolicitudDeEmergencia[]> {
    const params = new HttpParams().set('select', '*');

    const solicitudes$ = this._apiConfig.get<SolicitudDeEmergencia[]>(this.path, params).pipe(
      map(response => {
        return response.body || []; // Devuelve el body o un array vacío si no hay
      })
    );

    try {
      // Usa firstValueFrom para esperar la respuesta
      const solicitudes = await firstValueFrom(solicitudes$);
      this.solicitudes = solicitudes; // Asigna las regiones a la propiedad
      return solicitudes; // Devuelve las regiones
    } catch (error) {
      console.error('Error al obtener regiones:', error);
      return []; // Devuelve un array vacío en caso de error
    }
  }

  modificarSolicitud(id: number, notificacion: SolicitudPatch): Observable<HttpResponse<SolicitudPatch>> {
    const path = `${this.path}?id=eq.${id}`;
    return this._apiConfig.patch<SolicitudPatch>(path, notificacion).pipe(
      map(response => {
        return new HttpResponse<SolicitudPatch>({
          body: response.body || null,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      })
    );
  }

  async obtenerSolicitudesPorRol(rolUsuario: number): Promise<SolicitudDeEmergencia[]> {
    const params = new HttpParams().set('select', '*');

    const solicitudes$ = this._apiConfig.get<SolicitudDeEmergencia[]>(this.path, params).pipe(
      map(response => {
        return response.body || []; // Devuelve el body o un array vacío si no hay
      })
    );

    try {
      // Usa firstValueFrom para esperar la respuesta
      const solicitudes = await firstValueFrom(solicitudes$);

      // Filtrar las solicitudes según el rol del usuario
      const solicitudesFiltradas = this.filtrarSolicitudesPorRol(solicitudes, rolUsuario);

      this.solicitudes = solicitudesFiltradas; // Asigna las solicitudes filtradas a la propiedad
      return solicitudesFiltradas; // Devuelve las solicitudes filtradas
    } catch (error) {
      console.error('Error al obtener solicitudes:', error);
      return []; // Devuelve un array vacío en caso de error
    }
  }

  // Función auxiliar para filtrar solicitudes según el rol
  private filtrarSolicitudesPorRol(solicitudes: SolicitudDeEmergencia[], rolUsuario: number): SolicitudDeEmergencia[] {
    switch (rolUsuario) {
      case 1: // Rol de Administrador
        return solicitudes; // Administrador puede ver todas las solicitudes

      case 3: // Rol de Bomberos
        return solicitudes.filter(solicitud => solicitud.entidad === 3); // Filtrar por entidad 'Fuego' para Bomberos

      case 4: // Rol de Policía
        return solicitudes.filter(solicitud => solicitud.entidad === 4); // Filtrar por entidad 'Seguridad' para Policía

      case 5: // Rol de Ambulancia
        return solicitudes.filter(solicitud => solicitud.entidad === 5); // Filtrar por entidad 'Medico' para Ambulancia

      default:
        return []; // Si el rol no coincide, devolver un array vacío o manejar de otra forma
    }
  }


  // Método para actualizar una solicitud de emergencia (PATCH)
  actualizarSolicitud(id: number, solicitud: Partial<SolicitudDeEmergencia>): Observable<HttpResponse<SolicitudDeEmergencia>> {
    const updatePath = `${this.path}/${id}`;
    return this._apiConfig.patch<SolicitudDeEmergencia>(updatePath, solicitud);
  }

  // Método para eliminar una solicitud de emergencia (DELETE)
  eliminarSolicitud(id: number): Observable<HttpResponse<void>> {
    const deletePath = `${this.path}/${id}`;
    return this._apiConfig.delete<void>(deletePath);
  }

  private handleError(error: HttpErrorResponse) {
    // Aquí puedes manejar el error según tus necesidades
    let errorMessage = 'Ocurrió un error desconocido.';
    if (error.error instanceof ErrorEvent) {
      // Errores del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Errores del lado del servidor
      errorMessage = `Código de error: ${error.status}, Mensaje: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage)); // Devuelve un observable con un error
  }

}
