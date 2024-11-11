import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardPageRoutingModule } from './dashboard-routing.module';

import { DashboardPage } from './dashboard.page';
import { NotificacionPopoverComponent } from 'src/app/components/notificacionPopover/notificacion-popover/notificacion-popover.component';
import { MatCardModule } from '@angular/material/card'; // Asegúrate de importar MatCardModule
import { MatButtonModule } from '@angular/material/button'; // Importa MatButtonModule
import { MatListModule } from '@angular/material/list'; // Importa MatListModule
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';  // Importa MatSelectModule
import { MatDialogModule } from '@angular/material/dialog';  // Importa MatDialogModule
import { MatMenuModule } from '@angular/material/menu';  // Importa MatMenuModule
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardPageRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatSelectModule,   // Asegúrate de agregarlo aquí
    MatOptionModule,
    MatDialogModule,  // Asegúrate de agregarlo aquí
    MatMenuModule,  // Asegúrate de agregarlo aquí
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    MatBadgeModule

  ],
  declarations: [
    DashboardPage,
    NotificacionPopoverComponent
  ]
})
export class DashboardPageModule { }
