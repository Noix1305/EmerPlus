import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { BasesConocimientoPage } from './bases-conocimiento.page';

const routes: Routes = [
  {
    path: '',
    component: BasesConocimientoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BasesConocimientoPageRoutingModule {}
