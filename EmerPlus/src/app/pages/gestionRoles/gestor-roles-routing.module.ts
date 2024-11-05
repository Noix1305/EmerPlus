import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GestorRolesPage } from './gestor-roles.page';

const routes: Routes = [
  {
    path: '',
    component: GestorRolesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GestorRolesPageRoutingModule {}
