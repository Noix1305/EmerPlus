import { Component, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

import { OverlayEventDetail } from '@ionic/core/components';
import { LoginService } from '../services/loginService/login.service';
import { Usuario } from '../models/usuario';
import { Router } from '@angular/router';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  @ViewChild(IonModal) modal!: IonModal;

  user: Usuario = {
    rut: "",
    password: "",
    rol: []
  }

  constructor(private _loginService: LoginService, private router: Router) { }

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.user = navigation.extras.state['user'];
      console.info("Navigate: " + this.user);
    }
    
  }

  name!: string;
  message = 'Ingresar Credenciales';

  mostrarUsuarios() {
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

  login() {
    const user = this._loginService.encontrar_usuario(this.user.rut, this.user.password);
    if (user) {
      console.info("Usuario existe");

      // Actualiza el objeto userLogin con el tipo de usuario obtenido


      this.router.navigate(['home'], {
        state: {
          user: this.user,
        }
      });
      // Aquí debería mostrar el tipo de usuario correcto
    } else {
      console.error("Usuario no existe");
    }
  }

}
