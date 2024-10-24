import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RegistroModalComponent } from '../../components/registro-modal/registro-modal.component';
import { Usuario } from 'src/app/models/usuario';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  placeholderVisible: boolean = true;
  usuarios: Usuario[] = [];

  constructor(
    private modalController: ModalController,
  ) { }

  async ngOnInit() {
    await Preferences.remove({ key: 'userInfo' });
  }

  async openRegistroModal() {
    const modal = await this.modalController.create({
      component: RegistroModalComponent,
    });
    return await modal.present();
  }

  // Método de cierre para cualquier modal
  async closeModal(modal: HTMLIonModalElement) {
    if (modal) {
      await modal.dismiss();
    } else {
      console.error('El modal no está disponible para cerrar.');
    }
  }

}
