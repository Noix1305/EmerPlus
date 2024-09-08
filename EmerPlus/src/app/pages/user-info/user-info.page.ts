import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Usuario } from 'src/app/models/usuario';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.page.html',
  styleUrls: ['./user-info.page.scss'],
})
export class UserInfoPage {
  usuario: Usuario | undefined;

  constructor(private router: Router) {}

  ngOnInit() {
    // Accede al state pasado desde el LoginComponent
    console.info(this.router.getCurrentNavigation())
    this.usuario = this.router.getCurrentNavigation()?.extras?.state?.['usuario']

    if (this.usuario) {
      console.log('Usuario logueado:', this.usuario);
    } else {
      console.error('No se recibió ningún usuario.');
    }
  }

  // Función para cerrar el modal de contacto
  closeModal(modal: IonModal) {
    if (modal) {
      modal.dismiss(null, 'cancel');
    } else {
      console.error('El modal no está disponible para cerrar.');
    }
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      console.log('Modal cerrado con confirmación');
    }
  }
}
