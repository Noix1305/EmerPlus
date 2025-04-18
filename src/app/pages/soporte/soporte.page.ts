import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, ModalController, PickerController } from '@ionic/angular';
import { ModalInfoComponent } from 'src/app/components/modal-info/modal-info.component';
import { Usuario } from 'src/app/models/usuario';
import { UsuarioService } from 'src/app/services/usuarioService/usuario.service';
import { MENSAJE_CARGANDO } from 'src/constantes';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-soporte',
  templateUrl: './soporte.page.html',
  styleUrls: ['./soporte.page.scss'],
})
export class SoportePage implements OnInit {

  usuario: Usuario | null = null;
  rolUsuario: number = 0;

  constructor(
    private loadingController: LoadingController,
    private router: Router,
    private modalController: ModalController,
    private _usuarioService: UsuarioService
  ) { }

  async ngOnInit() {

    const loading = await this.loadingController.create({
      message: MENSAJE_CARGANDO,
    });

    await loading.present();
    await this._usuarioService.cargarUsuario();
    this.usuario = this._usuarioService.getUsuario();

    if (this.usuario) {
      this.rolUsuario = this.usuario.rol[0];
    }

    loading.dismiss();
  }

  async abrirInformacionTicket() {
    const modal = await this.modalController.create({
      component: ModalInfoComponent,  // Asegúrate de pasar el componente aquí, no la plantilla
    });
    return await modal.present();
  }

  public navegacion(nav: string) {
    this.router.navigate(['/' + nav]);
  }

  async cerrarModalInformacion() {
    await this.modalController.dismiss();
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
