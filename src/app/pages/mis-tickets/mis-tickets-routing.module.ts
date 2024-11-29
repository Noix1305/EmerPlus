import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MisTicketsPage } from './mis-tickets.page';

const routes: Routes = [
  {
    path: '',
    component: MisTicketsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MisTicketsPageRoutingModule {}
