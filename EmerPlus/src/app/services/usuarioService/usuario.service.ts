import { Injectable } from '@angular/core';
import { ApiConfigService } from '../apiConfig/api-config.service';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { Usuario } from 'src/app/models/usuario';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  path = 'usuarios';

  constructor(private apiConfig: ApiConfigService) { }

  obtenerUsuarios() {
    const params = new HttpParams().set('select', '*')
    return this.apiConfig.get<Usuario[]>(this.path, params).pipe(
      map(response => {
        console.log(response)
        const datoFiltrado = response.body?.filter(usuario => usuario.regionid === 15)

        return new HttpResponse({
          body: datoFiltrado,
          headers: response.headers,
          status: response.status,
          statusText: response.statusText
        })
      })
    )
  }

  crearUsuario(usuario: Usuario): Observable<HttpResponse<Usuario>> {
    return this.apiConfig.post<Usuario>(this.path, usuario);

  }
}
