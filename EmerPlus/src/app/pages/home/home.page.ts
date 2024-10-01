import { Component, ViewChild } from '@angular/core';
import { IonSelect, ModalController } from '@ionic/angular';
import { LoginService } from '../../services/loginService/login.service';
import { RegistroModalComponent } from '../../../components/registro-modal/registro-modal.component';
import { LoginModalComponent } from 'src/components/log-in-modal/log-in-modal.component';
import { firstValueFrom } from 'rxjs';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { Usuario } from 'src/app/models/usuario';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  placeholderVisible: boolean = true;
  usuarios: Usuario[] = [];

  constructor(private _loginService: LoginService, private modalController: ModalController, private _usuarioService: UsuarioService) { }

  regiones: any[] = [];
  comunas: any[] = [];
  selectedRegion: any;
  selectedComuna: any;

  @ViewChild('regionSelect') regionSelect!: IonSelect;
  @ViewChild('comunaSelect') comunaSelect!: IonSelect;

  async ngOnInit() {

    this.obtenerUsuarios();

    try {
      const data = await this._loginService.getData();
      this.regiones = data || []; // Asegura que regiones siempre sea un array
    } catch (error) {
      console.error('Error al obtener las regiones:', error);
      this.regiones = [];
    }
  }

  async obtenerUsuarios() {
    try {
      const response = await firstValueFrom(this._usuarioService.obtenerUsuarios())
      console.info(response)
      this.usuarios = response.body || [];
    }
    catch (error) {
      console.error(error)
    }
  }

  async crearUsuario(nuevoUsuario: Usuario) {
    try {
      console.log(nuevoUsuario);
      const response = await firstValueFrom(this._usuarioService.crearUsuario(nuevoUsuario));
      if(response.status){
        
      }
    }
    catch (error) {
      console.error(error)
    }
  }

  // Método para manejar la selección de la región
  async onRegionChange() {
    if (this.selectedRegion) {
      const regionId = this.selectedRegion.id;
      const regionData = this.regiones.find(region => region.id === regionId);
      this.comunas = regionData ? regionData.comunas : [];
      this.selectedComuna = null;

      // Forzar un cambio visual para simular el cierre
      this.regionSelect.interface = 'popover';  // Cambiar temporalmente la interfaz
      setTimeout(() => {
        this.regionSelect.interface = 'action-sheet';  // Restablecer la interfaz
      }, 100);
    } else {
      this.comunas = [];
      this.selectedComuna = null;
    }
  }

  async onComunaChange() {
    if (this.selectedComuna) {
      // Forzar un cambio visual para simular el cierre
      this.comunaSelect.interface = 'popover';
      setTimeout(() => {
        this.comunaSelect.interface = 'action-sheet';
      }, 100);
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
