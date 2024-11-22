import { Injectable } from '@angular/core';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { Ticket } from 'src/app/models/ticket';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { catchError, firstValueFrom, map, Observable, of } from 'rxjs';
import { EstadoTicket } from 'src/app/models/estadoTicket';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  path: string = 'tickets';
  pathEstado: string = 'estados_ticket'

  constructor(
    private _apiConfig: ApiConfigService
  ) { }

  enviarTicket(ticket: Ticket): Observable<HttpResponse<Ticket>> {
    return this._apiConfig.post(this.path, ticket);
  }

  obtenerTickets(): Observable<Ticket[]> {
    const params = new HttpParams().set('select', '*');

    return this._apiConfig.get<Ticket[]>(this.path, params).pipe(
      map(response => response.body || []), // Devuelve el body o un array vacío si no hay
      catchError((error) => {
        console.error('Error al obtener tickets:', error);
        return of([]); // Devuelve un array vacío en caso de error
      })
    );
  }

  obtenerEstadosTickets(): Observable<EstadoTicket[]> {
    const params = new HttpParams().set('select', '*');

    return this._apiConfig.get<EstadoTicket[]>(this.pathEstado, params).pipe(
      map(response => response.body || []), // Devuelve el body o un array vacío si no hay
      catchError((error) => {
        console.error('Error al obtener estados tickets:', error);
        return of([]); // Devuelve un array vacío en caso de error
      })
    );
  }

}
