import { Component } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { LoginService } from 'src/app/services/loginService/login.service';
import { mostrarFormularioRegistro } from 'src/app/utils/formulario-registro';
import { LoadingController } from '@ionic/angular';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  constructor(
    private _usuarioService: UsuarioService,
    private loadingController: LoadingController,
    private _encriptadorService: EncriptadorService

  ) { }

  async ngOnInit() {
    await Preferences.clear();
    await this.presentLoading();
  }

  async mostrarFormularioRegistro() {
    mostrarFormularioRegistro(this._usuarioService, this._encriptadorService);
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cargando...',
      duration: 1000,
    });
    await loading.present();
  }
}
