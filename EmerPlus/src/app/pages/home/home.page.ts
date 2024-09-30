import { Component, ViewChild } from '@angular/core';
import { IonSelect, ModalController } from '@ionic/angular';
import { LoginService } from '../../services/loginService/login.service';
import { RegistroModalComponent } from '../../../components/registro-modal/registro-modal.component';
import { LoginModalComponent } from 'src/components/log-in-modal/log-in-modal.component';
import { Region } from 'src/app/models/region';
import { Comuna } from 'src/app/models/comuna';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  placeholderVisible: boolean = true;

  constructor(private _loginService: LoginService, private modalController: ModalController) { }

  regiones: any[] = [];
  comunas: any[] = [];
  selectedRegion: any;
  selectedComuna: any;

  @ViewChild('regionSelect') regionSelect!: IonSelect;
  @ViewChild('comunaSelect') comunaSelect!: IonSelect;

  async ngOnInit() {
    try {
      const data = await this._loginService.getData();
      this.regiones = data || []; // Asegura que regiones siempre sea un array
    } catch (error) {
      console.error('Error al obtener las regiones:', error);
      this.regiones = [];
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
