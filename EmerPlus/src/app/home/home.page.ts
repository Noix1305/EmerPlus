import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoginModalComponent } from '../login-modal/login-modal.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {

  constructor(private modalController: ModalController) {}

  async openLoginModal() {
    const modal = await this.modalController.create({
      component: LoginModalComponent
    });
    return await modal.present();
  }
}
