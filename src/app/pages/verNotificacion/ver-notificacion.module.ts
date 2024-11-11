import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { VerNotificacionPageRoutingModule } from './ver-notificacion-routing.module';

import { VerNotificacionPage } from './ver-notificacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    VerNotificacionPageRoutingModule
  ],
  declarations: [VerNotificacionPage]
})
export class VerNotificacionPageModule {}
