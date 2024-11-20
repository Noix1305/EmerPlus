import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { lastValueFrom } from 'rxjs';
import { Notificacion } from 'src/app/models/notificacion';
import { NotificacionPatch } from 'src/app/models/notificacionPatch';
import { NotificacionService } from 'src/app/services/notificacionService/notificacion.service';
import { ESTADO_LEIDA, NAV_NOTIFICACION, RUTA_DASHBOARD } from 'src/constantes';

@Component({
  selector: 'app-ver-notificacion',
  templateUrl: './ver-notificacion.page.html',
  styleUrls: ['./ver-notificacion.page.scss'],
})
export class VerNotificacionPage implements OnInit {

  notificacion: Notificacion | undefined;
  notificacionPatch: NotificacionPatch | undefined;
  estadoLeida: string = ESTADO_LEIDA;

  constructor(
    private router: Router,
    private _notificacionService: NotificacionService
  ) { }

  async ngOnInit() {
    const navigation = this.router.getCurrentNavigation();

    if (navigation && navigation.extras.state) {
      this.notificacion = navigation.extras.state[NAV_NOTIFICACION];

    } else {
      console.error('No se encontró la notificación.');
      // Puedes redirigir al usuario a otra página si la notificación no se encuentra
      this.router.navigate([RUTA_DASHBOARD]); // Ajusta la ruta según sea necesario
    }
  }

  async volver() {
    this.router.navigate([RUTA_DASHBOARD]);
  }
  realizarAccion() {
    this.crearNotificacionLeida();

  }

  async crearNotificacionLeida() {
    this.notificacionPatch = {
      id: this.notificacion?.id,
      estado: this.estadoLeida
    } as NotificacionPatch;

    try {
      // Convierte el Observable en una Promise
      const response = await lastValueFrom(this._notificacionService.modificarNotificacion(this.notificacionPatch.id, this.notificacionPatch));

      const statusCode = response.status;
      console.log('Código de respuesta:', statusCode);
      console.log('Notificación modificada con éxito:', response.body);
      this.notificacion && (this.notificacion.estado = this.estadoLeida);

      // Redirige al dashboard después de la actualización exitosa
    } catch (error) {
      console.error('Error al modificar la notificación:', error);
    }
  }

}
