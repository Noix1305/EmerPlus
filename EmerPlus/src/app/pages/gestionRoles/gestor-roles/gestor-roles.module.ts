import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GestorRolesPageRoutingModule } from './gestor-roles-routing.module';

import { GestorRolesPage } from './gestor-roles.page';
import { ModificarRolModalComponent } from 'src/app/components/modificarRol/modificar-rol-modal/modificar-rol-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GestorRolesPageRoutingModule
  ],
  declarations: [GestorRolesPage, ModificarRolModalComponent]
})
export class GestorRolesPageModule { }
