import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FormularioTicketPageRoutingModule } from './formulario-ticket-routing.module';

import { FormularioTicketPage } from './formulario-ticket.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    FormularioTicketPageRoutingModule
  ],
  declarations: [FormularioTicketPage]
})
export class FormularioTicketPageModule {}
