import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Preferences } from '@capacitor/preferences';
import { LoadingController } from '@ionic/angular';
import { Usuario } from 'src/app/models/usuario';
import { EncriptadorService } from 'src/app/services/encriptador/encriptador.service';
import { KEY_USER_INFO, MENSAJE_CARGANDO, NAV_USUARIO, SWAL_ERROR } from 'src/constantes';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-soporte',
  templateUrl: './soporte.page.html',
  styleUrls: ['./soporte.page.scss'],
})
export class SoportePage implements OnInit {

  usuario: Usuario | undefined;
  rolUsuario: number = 0;
  mostrarModal: boolean = false;

  constructor(
    private _encriptadorService: EncriptadorService,
    private loadingController: LoadingController,
    private router: Router
  ) { }

  async ngOnInit() {

    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });

    await loading.present();

    this.usuario = this.router.getCurrentNavigation()?.extras?.state?.[NAV_USUARIO];

    if (!this.usuario) {
      const { value } = await Preferences.get({ key: KEY_USER_INFO });

      if (value) {
        try {
          // Desencriptar el valor usando el servicio de desencriptación
          const decryptedData = this._encriptadorService.decrypt(value);

          if (decryptedData) {
            this.usuario = JSON.parse(decryptedData) as Usuario; // Convierte el JSON desencriptado a Usuario
            this.rolUsuario = this.usuario.rol[0];
          } else {
            console.error('Error al desencriptar los datos');
            this.mostrarSwal(SWAL_ERROR, 'Error', 'Hubo un problema al cargar los datos del usuario.');
          }
        } catch (error) {
          console.error('Error al parsear JSON o desencriptar:', error);
          this.mostrarSwal(SWAL_ERROR, 'Error', 'Hubo un problema al cargar los datos del usuario.');
        }
      } else {
        console.log('No se encontró el usuario en Preferences.');
      }
    } else {
      console.log('Usuario obtenido desde la navegación:', this.usuario);
    }

    loading.dismiss();
  }

  // Método para abrir el modal
  abrirInformacionTicket() {
    this.mostrarModal = true;
  }

  // Método para cerrar el modal
  cerrarModal() {
    this.mostrarModal = false;
  }

  async mostrarSwal(icon: SweetAlertIcon, tittle: string, text: string) {
    await Swal.fire({
      icon: icon,
      title: tittle,
      text: text,
      heightAuto: false
    });
  }

}
