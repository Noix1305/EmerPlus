import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { Notificacion } from 'src/app/models/notificacion';

@Component({
  selector: 'app-notificacion-popover',
  templateUrl: './notificacion-popover.component.html',
  styleUrls: ['./notificacion-popover.component.scss'],
})
export class NotificacionPopoverComponent {

  @Input() notificaciones: Notificacion[] = [];

  constructor(
    private popoverController: PopoverController,
    private router: Router
  ) { }

  closePopover() {
    this.popoverController.dismiss();
  }

  verNotificacion(notificacion: Notificacion) {
    // Redirige a la página de ver notificación pasando la notificación completa
    this.router.navigate(['/ver-notificacion'], { state: { notificacion } });
    this.closePopover()
  }

}
