import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionarTicketPage } from './gestionar-ticket.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarTicketPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionarTicketPageRoutingModule {}
