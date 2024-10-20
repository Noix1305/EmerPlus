import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { VerNotificacionPage } from './ver-notificacion.page';

const routes: Routes = [
  {
    path: '',
    component: VerNotificacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VerNotificacionPageRoutingModule {}
