import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { HomePage } from './home.page';
import { HomePageRoutingModule } from './home-routing.module';
import { MenuComponent } from 'src/components/menu/menu.component';
import { RegistroModalComponent } from 'src/components/registro-modal/registro-modal.component';
import { LoginModalComponent } from 'src/components/log-in-modal/log-in-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [
    HomePage,
    MenuComponent,
    RegistroModalComponent,
    LoginModalComponent
  ]
})
export class HomePageModule { }
