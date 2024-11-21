import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { FooterComponent } from './components/footer/footer.component';
import { ModalInfoComponent } from './components/modal-info/modal-info.component';

@NgModule({
  declarations: [AppComponent, FooterComponent, ModalInfoComponent],
  imports: [BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatSelectModule,   // Asegúrate de agregarlo aquí
    MatOptionModule,
    MatDialogModule,  // Asegúrate de agregarlo aquí
    MatMenuModule,  // Asegúrate de agregarlo aquí
    MatIconModule,
  ],

  exports: [BrowserAnimationsModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatSelectModule,   // Asegúrate de agregarlo aquí
    MatOptionModule,
    MatDialogModule,  // Asegúrate de agregarlo aquí
    MatMenuModule,  // Asegúrate de agregarlo aquí
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatSelectModule,   // Asegúrate de agregarlo aquí
    MatOptionModule,
    MatDialogModule,  // Asegúrate de agregarlo aquí
    MatMenuModule,  // Asegúrate de agregarlo aquí
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideHttpClient(withInterceptorsFromDi()), provideAnimationsAsync()],
  bootstrap: [AppComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppModule { }
