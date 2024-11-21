import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { FormularioTicketPage } from './formulario-ticket.page';

const routes: Routes = [
  {
    path: '',
    component: FormularioTicketPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FormularioTicketPageRoutingModule {}
