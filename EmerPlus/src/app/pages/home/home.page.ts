import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { LoginService } from 'src/app/services/loginService/login.service';
import { mostrarFormularioRegistro } from 'src/app/utils/formulario-registro';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  constructor(
    private _usuarioService: UsuarioService,
    private _loginService: LoginService,
  ) { }

  async ngOnInit() {
    await Preferences.clear();
  }

  async mostrarFormularioRegistro() {
    mostrarFormularioRegistro(this._usuarioService, this._loginService);
  }
}
