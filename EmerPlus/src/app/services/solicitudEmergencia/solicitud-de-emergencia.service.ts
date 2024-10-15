import { Injectable } from '@angular/core';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

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

  obtenerUltimaSolicitud(): Observable<SolicitudDeEmergencia | null> {
    return this.obtenerSolicitudes().pipe(
      map(response => {
        if (response && response.body) {
          this.solicitudes = response.body; // Asigna el cuerpo de la respuesta al array
          return this.solicitudes[this.solicitudes.length - 1] || null; // Devuelve el último elemento o null
        } else {
          console.warn('No se encontraron solicitudes.');
          return null; // Devuelve null si no hay solicitudes
        }
      }),
      catchError(error => {
        console.error('Error al obtener solicitudes:', error);
        return of(null); // Devuelve null en caso de error
      })
    );
  }

  // Método para obtener todas las solicitudes de emergencia (GET)
  obtenerSolicitudes(): Observable<HttpResponse<SolicitudDeEmergencia[]>> {
    return this._apiConfig.get<SolicitudDeEmergencia[]>(this.path);
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
