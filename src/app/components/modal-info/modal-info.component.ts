import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-info',
  templateUrl: './modal-info.component.html',
  styleUrls: ['./modal-info.component.scss'],
})
export class ModalInfoComponent  implements OnInit {

  constructor(private modalController: ModalController) {}

  // Método para cerrar el modal
  closeModal() {
    this.modalController.dismiss();
  }

  ngOnInit() {}

}
