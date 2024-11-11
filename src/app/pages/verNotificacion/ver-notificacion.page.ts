import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Notificacion } from 'src/app/models/notificacion';

@Component({
  selector: 'app-ver-notificacion',
  templateUrl: './ver-notificacion.page.html',
  styleUrls: ['./ver-notificacion.page.scss'],
})
export class VerNotificacionPage implements OnInit {

  notificacion: Notificacion | undefined;

  constructor(private router: Router) {}

  ngOnInit() {
    const navigation = this.router.getCurrentNavigation();

    if (navigation && navigation.extras.state) {
      this.notificacion = navigation.extras.state['notificacion'];
    } else {
      console.error('No se encontró la notificación.');
      // Puedes redirigir al usuario a otra página si la notificación no se encuentra
      this.router.navigate(['/dashboard']); // Ajusta la ruta según sea necesario
    }
  }

  volver() {
    this.router.navigate(['/dashboard']); // Ajusta la ruta según sea necesario
  }

  realizarAccion() {
    // Implementa la acción que quieras realizar con la notificación
    console.log('Acción realizada para la notificación', this.notificacion);
  }

}
