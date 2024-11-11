import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UserInfoPageRoutingModule } from './user-info-routing.module';

import { UserInfoPage } from './user-info.page';
import { CambiarPassComponent } from 'src/app/components/cambiar-pass/cambiar-pass.component';
import { MatCardModule } from '@angular/material/card'; // Asegúrate de importar MatCardModule
import { MatButtonModule } from '@angular/material/button'; // Importa MatButtonModule
import { MatListModule } from '@angular/material/list'; // Importa MatListModule
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';  // Importa MatSelectModule
import { MatDialogModule } from '@angular/material/dialog';  // Importa MatDialogModule
import { MatMenuModule } from '@angular/material/menu';  // Importa MatMenuModule
import { MatIconModule } from '@angular/material/icon';  // Importa MatIconModule









@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UserInfoPageRoutingModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatSelectModule,   // Asegúrate de agregarlo aquí
    MatOptionModule,
    MatDialogModule,  // Asegúrate de agregarlo aquí
    MatMenuModule,  // Asegúrate de agregarlo aquí
    MatIconModule


  ],
  declarations: [
    UserInfoPage,
    CambiarPassComponent
  ]
})
export class UserInfoPageModule { }
