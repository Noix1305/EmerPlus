import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AgregarUsuarioAdminPage } from './agregar-usuario-admin.page';

const routes: Routes = [
  {
    path: '',
    component: AgregarUsuarioAdminPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AgregarUsuarioAdminPageRoutingModule {}
