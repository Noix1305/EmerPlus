import { Injectable } from '@angular/core';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { Ticket } from 'src/app/models/ticket';
import { HttpResponse } from '@angular/common/http';
import {  Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  path: string = 'tickets';

  constructor(
    private _apiConfig: ApiConfigService
  ) { }

  enviarTicket(ticket: Ticket): Observable<HttpResponse<Ticket>> {
    return this._apiConfig.post(this.path, ticket);
  }


}
