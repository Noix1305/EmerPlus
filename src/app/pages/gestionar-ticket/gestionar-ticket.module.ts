import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestionarTicketPageRoutingModule } from './gestionar-ticket-routing.module';

import { GestionarTicketPage } from './gestionar-ticket.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestionarTicketPageRoutingModule
  ],
  declarations: [GestionarTicketPage]
})
export class GestionarTicketPageModule {}
