import { Injectable } from '@angular/core';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { SolicitudDeEmergencia } from 'src/app/models/solicituddemergencia';
import { Observable } from 'rxjs';
import { HttpResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SolicitudDeEmergenciaService {

  private path = 'solicitudemergencia';

  constructor(private apiConfig: ApiConfigService) { }

  // Método para enviar una nueva solicitud de emergencia (POST)
  enviarSolicitud(solicitud: SolicitudDeEmergencia): Observable<HttpResponse<SolicitudDeEmergencia>> {
    return this.apiConfig.post<SolicitudDeEmergencia>(this.path, solicitud);
  }

  // Método para obtener todas las solicitudes de emergencia (GET)
  obtenerSolicitudes(): Observable<HttpResponse<SolicitudDeEmergencia[]>> {
    return this.apiConfig.get<SolicitudDeEmergencia[]>(this.path);
  }

  // Método para actualizar una solicitud de emergencia (PATCH)
  actualizarSolicitud(id: number, solicitud: Partial<SolicitudDeEmergencia>): Observable<HttpResponse<SolicitudDeEmergencia>> {
    const updatePath = `${this.path}/${id}`;
    return this.apiConfig.patch<SolicitudDeEmergencia>(updatePath, solicitud);
  }

  // Método para eliminar una solicitud de emergencia (DELETE)
  eliminarSolicitud(id: number): Observable<HttpResponse<void>> {
    const deletePath = `${this.path}/${id}`;
    return this.apiConfig.delete<void>(deletePath);
  }
}
