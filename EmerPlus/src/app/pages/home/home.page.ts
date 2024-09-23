import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoginService } from '../../services/loginService/login.service';
import { RegistroModalComponent } from '../../../components/registro-modal/registro-modal.component';
import { LoginModalComponent } from 'src/components/log-in-modal/log-in-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  placeholderVisible: boolean = true;

  constructor(private _loginService: LoginService, private modalController: ModalController) { }

  // Abrir el modal de registro



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
