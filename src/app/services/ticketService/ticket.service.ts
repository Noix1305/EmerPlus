import { Injectable } from '@angular/core';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { Ticket } from 'src/app/models/ticket';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { catchError, firstValueFrom, map, Observable, of, throwError } from 'rxjs';
import { EstadoTicket } from 'src/app/models/estadoTicket';
import { TicketPatch } from 'src/app/models/ticketPatch';
import { TipoTicket } from 'src/app/models/tituloTicket';
import { SatisfaccionTicket } from 'src/app/models/satisfaccionTicket';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  path: string = 'tickets';
  pathEstado: string = 'estados_ticket'
  pathTipos: string = 'tipos_problema_ticket';
  pathSatisfaccion: string = 'satisfaccion_ticket'


  constructor(
    private _apiConfig: ApiConfigService
  ) { }

  private ticketData: any;

  setTicketData(data: any) {
    this.ticketData = data;
  }

  getTicketData() {
    return this.ticketData;
  }

  clearTicketData() {
    this.ticketData = null;
  }

  enviarTicket(ticket: Ticket): Observable<HttpResponse<Ticket>> {
    return this._apiConfig.post(this.path, ticket);
  }

  async getTiposTickets(params?: HttpParams): Promise<Observable<HttpResponse<TipoTicket[]>>> {
    return this._apiConfig.get<TipoTicket[]>(this.pathTipos, params).pipe(
      catchError((error) => {
        console.error('Error al obtener tipos de tickets:', error);
        return throwError(() => new Error('Error al obtener tipos de tickets.'));
      }));
  }

  async getSatisfaccionTicket(params?: HttpParams): Promise<Observable<HttpResponse<SatisfaccionTicket[]>>> {
    return this._apiConfig.get<SatisfaccionTicket[]>(this.pathTipos, params).pipe(
      catchError((error) => {
        console.error('Error al obtener niveles de satisfaccion:', error);
        return throwError(() => new Error('Error al niveles de satisfaccion.'));
      }));
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

  modificarTicket(id: number, ticket: TicketPatch): Observable<HttpResponse<TicketPatch>> {
    const path = `${this.path}?id=eq.${id}`;
    return this._apiConfig.patch<TicketPatch>(path, ticket).pipe(
      map(response => {
        return new HttpResponse<TicketPatch>({
          body: response.body || null,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      })
    );
  }

}
