import { Component, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

import { OverlayEventDetail } from '@ionic/core/components';
import { LoginService } from '../../services/loginService/login.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  @ViewChild(IonModal) modal!: IonModal;
  username: string = '';
  password: string = '';

  name!: string;
  message = 'Ingresar Credenciales';

  constructor(private _loginService: LoginService, private router: Router) { }

  cancel() {
    this.modal.dismiss(null, 'cancel');
  }

  confirm() {
    this.modal.dismiss(this.name, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      this.message = `Modal cerrado con confirmación, ${ev.detail.data}!`;
    }
  }

  mostrarUsuarios() {
    this._loginService.mostrarUsuarios();
  }

  onLogin() {
    const usuario = this._loginService.login(this.username, this.password);

    if (usuario) {
      // Si se encuentra el usuario, redirige y cierra el modal
      this.router.navigate(['user-info'], {
        state: {
          user: usuario
        }
      });
      this.modal.dismiss();
    } else {
      // Muestra un mensaje de error o maneja el caso de login fallido
      console.error('Credenciales incorrectas');
    }
  }
}
