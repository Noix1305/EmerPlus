import { HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Contacto } from 'src/app/models/contacto';
import { ApiConfigService } from '../apiConfig/api-config.service';

@Injectable({
  providedIn: 'root'
})
export class ContactosemergenciaService {
  path = 'contactos';

  constructor(private _apiConfig: ApiConfigService) { }

  crearContacto(contacto: Contacto): Observable<HttpResponse<Contacto>> {
    return this._apiConfig.post(this.path, contacto);
  }

  getContactoPorParametro(parametro: string, valor: string): Observable<HttpResponse<[Contacto]>> {
    const params = new HttpParams().set(parametro, `eq.${valor}`);
    return this._apiConfig.get<[Contacto]>(this.path, params).pipe(
      catchError((error) => {
        console.error('Error al obtener contacto:', error);
        return throwError(() => new Error('Error al obtener contacto.'));
      })
    );
}

}
