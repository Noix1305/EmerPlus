import { Component, OnInit } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  constructor(private alertController: AlertController,) { }

  ngOnInit() {
  }

  carabineros(entidad:string) {
    // Lógica para realizar una llamada a emergencias
    this.mostrarAlerta(entidad);
  }

  bomberos(entidad:string) {
    // Lógica para realizar una llamada a emergencias
    this.mostrarAlerta(entidad);
  }

  ambulancia(entidad:string) {
    // Lógica para realizar una llamada a emergencias
    this.mostrarAlerta(entidad);
  }

  contactoEmergencia(entidad:string) {
    // Lógica para enviar una alerta al contacto de emergencia
    this.mostrarAlerta(entidad);
  }

  async mostrarAlerta(entidad: string) {
    const alert = await this.alertController.create({
      header: 'Notificación Enviada a ' + entidad,
      message: 'La Notificación ya fue enviada',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Cancelado');
          }
        }]
    })
    await alert.present();
  }

}
