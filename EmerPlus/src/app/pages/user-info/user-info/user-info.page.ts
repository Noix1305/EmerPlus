import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, IonModal } from '@ionic/angular';
import { OverlayEventDetail } from '@ionic/core/components';
import { Usuario } from 'src/app/models/usuario';
import { RolService } from 'src/app/services/rolService/rol.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.page.html',
  styleUrls: ['./user-info.page.scss'],
})
export class UserInfoPage {
  @ViewChild('modalContacto', { static: false }) modalContacto!: IonModal;
  usuario: Usuario | undefined;
  rolUsuario: string | undefined;

  constructor(private router: Router, private _rolService: RolService, private alertController: AlertController) { }

  ngOnInit() {
    // Accede al state pasado desde el LoginComponent
    console.info(this.router.getCurrentNavigation())
    this.usuario = this.router.getCurrentNavigation()?.extras?.state?.['usuario']
    const idsRoles = this.usuario?.rol.map(rol => rol.id) || [];

    // Obtener los roles desde el servicio basado en los IDs
    const roles = this._rolService.getRolByIds(idsRoles);

    // Concatenar los nombres de los roles
    if (roles && roles.length > 0) {
      this.rolUsuario = roles.map(rol => rol.nombre).join(', ');
      console.log("Roles Usuarios: " + this.rolUsuario)
    } else {
      this.rolUsuario = undefined; // o algún valor por defecto si no se encuentran roles
    }


    if (this.usuario) {
      console.log('Usuario logueado:', this.usuario);
    } else {
      console.error('No se recibió ningún usuario.');
    }
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<string>>;
    if (ev.detail.role === 'confirm') {
      console.log('Modal cerrado con confirmación');
    }
  }

  async mostrarContacto() {
    if (this.usuario?.contactoEmergencia) {
      await this.modalContacto.present();
    } else {
      const alert = await this.alertController.create({
        header: 'Sin Contacto de Emergencia',
        message: 'No se ha registrado información de contacto de emergencia.',
        buttons: ['OK']
      });

      await alert.present();
    }
  }

  closeModal() {
    this.modalContacto.dismiss();
  }
}