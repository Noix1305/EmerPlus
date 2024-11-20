import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionarSolicitudPageRoutingModule } from './gestionar-solicitud-routing.module';

import { GestionarSolicitudPage } from './gestionar-solicitud.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionarSolicitudPageRoutingModule
  ],
  declarations: [GestionarSolicitudPage]
})
export class GestionarSolicitudPageModule {}
