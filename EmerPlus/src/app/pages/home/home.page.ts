import { Component, ViewChild } from '@angular/core';
import { IonSelect, ModalController } from '@ionic/angular';
import { LoginService } from '../../services/loginService/login.service';
import { RegistroModalComponent } from '../../../components/registro-modal/registro-modal.component';
import { LoginModalComponent } from 'src/components/log-in-modal/log-in-modal.component';
import { firstValueFrom, Observable } from 'rxjs';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { Usuario } from 'src/app/models/usuario';
import { RolService } from 'src/app/services/rolService/rol.service';
import { Rol } from 'src/app/models/rol';
import { HttpParams, HttpResponse } from '@angular/common/http';
import { ApiConfigService } from 'src/app/services/apiConfig/api-config.service';
import { RegionComunaService } from 'src/app/services/region_comuna/region-comuna.service';
import { Region } from 'src/app/models/region';
import { Comuna } from 'src/app/models/comuna';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  placeholderVisible: boolean = true;
  usuarios: Usuario[] = [];

  constructor(private apiConfig: ApiConfigService,
    private _loginService: LoginService,
    private modalController: ModalController,
    private _usuarioService: UsuarioService,
    private _regComService:RegionComunaService) { }

  regiones: Region[] = [];
  comunas: Comuna[] = [];
  selectedRegion: any;
  selectedComuna: any;
  rut: any;

  roles: Rol[] = [];
  rolDetails: Rol | undefined;
  descripcion: string | undefined;

  usuario: Usuario = {
    rut: '',
    password: '',
    estado: 0,
    rol: [0]
  };

  @ViewChild('regionSelect') regionSelect!: IonSelect;
  @ViewChild('comunaSelect') comunaSelect!: IonSelect;

  async ngOnInit() {
    this.regiones = await this._regComService.obtenerRegiones();
    console.log(this.regiones)

    this.comunas = await this._regComService.obtenerComunas();
    console.log(this.comunas)
  }

  async crearUsuario(nuevoUsuario: Usuario) {
    try {
      console.log(nuevoUsuario);
      const response = await firstValueFrom(this._usuarioService.crearUsuario(nuevoUsuario));
      if (response.status) {

      }
    }
    catch (error) {
      console.error(error)
    }
  }

  async openRegistroModal() {
    const modal = await this.modalController.create({
      component: RegistroModalComponent,
    });
    return await modal.present();
  }

  // Abrir el modal de login
  async openLoginModal() {
    const modal = await this.modalController.create({
      component: LoginModalComponent,
    });
    return await modal.present();
  }

  // Mostrar usuarios del servicio de login
  mostrarUsuarios() {
    this._loginService.mostrarUsuarios();
  }

  // Método de cierre para cualquier modal
  async closeModal(modal: HTMLIonModalElement) {
    if (modal) {
      await modal.dismiss();
    } else {
      console.error('El modal no está disponible para cerrar.');
    }
  }

  async presentLoginModal() {
    const modal = await this.modalController.create({
      component: LoginModalComponent,
      componentProps: {
        openRegistroModal: this.openRegistroModal.bind(this) // Asegúrate de que esta función está enlazada
      }
    });
    return await modal.present();
  }
}
