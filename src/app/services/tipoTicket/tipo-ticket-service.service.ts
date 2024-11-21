import { HttpParams, HttpResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { TipoTicket } from 'src/app/models/tituloTicket';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TipoTicketService {

  path: string = 'tipos_problema_ticket';
  constructor(private apiConfig: ApiConfigService) { }

  async getTiposTickets(params?: HttpParams): Promise<Observable<HttpResponse<TipoTicket[]>>> {
    return this.apiConfig.get<TipoTicket[]>(this.path, params).pipe(
      catchError((error) => {
        console.error('Error al obtener usuarios por rol:', error);
        return throwError(() => new Error('Error al obtener usuarios por rol.'));
      }));
  }

}
