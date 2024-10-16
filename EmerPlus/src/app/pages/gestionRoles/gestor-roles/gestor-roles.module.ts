import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestorRolesPageRoutingModule } from './gestor-roles-routing.module';

import { GestorRolesPage } from './gestor-roles.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestorRolesPageRoutingModule
  ],
  declarations: [GestorRolesPage]
})
export class GestorRolesPageModule {}
