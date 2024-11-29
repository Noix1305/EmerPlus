import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { LoginService } from 'src/app/services/loginService/login.service';
import { mostrarFormularioRegistro } from 'src/app/utils/formulario-registro';
import { LoadingController } from '@ionic/angular';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';
import { KEY_USER_INFO, MENSAJE_CARGANDO, RUTA_LOGIN } from 'src/constantes';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  user: any = {};

  constructor(
    private _usuarioService: UsuarioService,
    private loadingController: LoadingController,
    private _encriptadorService: EncriptadorService,
    private router: Router

  ) { }

  async ngOnInit() {
  }

  async mostrarFormularioRegistro() {
    mostrarFormularioRegistro(this._usuarioService, this._encriptadorService);
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
      duration: 500,
    });
    await loading.present();
  }

  public navLogin() {
    this.router.navigate([RUTA_LOGIN]);
  }
}
