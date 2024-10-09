import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
})
export class DashboardPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  makeEmergencyCall() {
    // Lógica para realizar una llamada a emergencias
    alert("Llamando al número de emergencias...");
  }

  sendAlertToContact() {
    // Lógica para enviar una alerta al contacto de emergencia
    alert("Alerta enviada a tu contacto de emergencia.");
  }

}
