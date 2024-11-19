import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestionarSolicitudPage } from './gestionar-solicitud.page';

const routes: Routes = [
  {
    path: '',
    component: GestionarSolicitudPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestionarSolicitudPageRoutingModule {}
