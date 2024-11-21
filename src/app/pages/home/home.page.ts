import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { LoginService } from 'src/app/services/loginService/login.service';
import { mostrarFormularioRegistro } from 'src/app/utils/formulario-registro';
import { LoadingController } from '@ionic/angular';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';
import { KEY_USER_INFO, MENSAJE_CARGANDO } from 'src/constantes';


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
    private _encriptadorService: EncriptadorService

  ) { }

  async ngOnInit() {
    await Preferences.clear();

    const rol = [0];

    // Asignar el array de roles al objeto user
    this.user.rol = rol;

    // Encriptar y guardar el objeto en Preferences
    const userString = JSON.stringify(this.user);

    // Encriptar el string usando el servicio EncriptadorService
    const encryptedUser = this._encriptadorService.encrypt(userString);

    // Guardar el objeto encriptado en Preferences
    await Preferences.set({
      key: KEY_USER_INFO,
      value: encryptedUser // Guardamos el valor encriptado
    });

    await this.presentLoading();
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
}
