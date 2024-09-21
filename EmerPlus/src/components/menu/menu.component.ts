import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoginModalComponent } from '../log-in-modal/log-in-modal.component';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent {

  constructor(private modalController:ModalController) { }

  async openLoginModal() {
    const modal = await this.modalController.create({
      component: LoginModalComponent, // Componente del modal de login
    });
    await modal.present();
  }

}
