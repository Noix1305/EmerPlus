import { Component, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

import { OverlayEventDetail } from '@ionic/core/components';
import { LoginService } from '../services/loginService/login.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  @ViewChild(IonModal) modal!: IonModal;

  constructor(private _loginService:LoginService) { }

  name!: string;
  message = 'Ingresar Credenciales';

  mostrarUsuarios(){
    this._loginService.mostrarUsuarios();
  }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.name, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Hello, ${ev.detail.data}!`;
    }
  }

}
