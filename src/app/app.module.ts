import { NgModule,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideHttpClient, withFetch, withInterceptors  } from '@angular/common/http';

import { ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { FormsModule } from '@angular/forms';

/* Parte del administrador */

import { AdminModule } from './admin/admin.module';
//footer y header
import { FooterComponent } from './shared/components/footer/footer.component';
import { HeaderComponent } from './shared/components/header/header.component';

//utilizar material
import { MaterialModule } from './material/material.module';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';

//Parte del Dialogos de Registro
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DialogContentExampleDialog } from './shared/directives/dialog-content/dialog-content.component';

//enviar al header
import { authInterceptor } from './core/interceptors/auth.interceptor';

//Partes de paquetes, paquetes personalizados, craer paquete y mis paquetes

import { InicioComponent } from './pages/inicio/inicio.component';
import { PredeterminadoModule } from './pages/paquetes/predeterminado.module';
import { Parte2Component } from './pages/paquetes-personalizados/parte2/parte2.component';
import { Parte3Component } from './pages/paquetes-personalizados/parte3/parte3.component';
import { Parte4Component } from './pages/paquetes-personalizados/parte4/parte4.component';
import { Parte5Component } from './pages/paquetes-personalizados/parte5/parte5.component';
import { PaquetesPersonalizadosComponent } from './pages/paquetes-personalizados/paquetes-personalizados.component';
import { MisPaquetesComponent } from './pages/mis-paquetes/mis-paquetes.component';

//Parte del login y registro
import { LoginComponent } from './pages/login/login.component';
import { RegistroService } from './core/services/auth.service';
import { RegistroComponent } from './pages/registro/registro.component';

//Recuperar contraseña
import { RecuperarPComponent } from './pages/correoRec/recuperarP.component';
import { ContraRecComponent } from './pages/contraRec/contraRec.component';

//Apis 

//API Facebook
import { FacebookComponent } from './pages/apis/facebook/facebook.component';
import { FacebookLoginProvider, SocialAuthServiceConfig, SocialLoginModule } from '@abacritt/angularx-social-login';
import { CoolFacebookButtonComponent } from '@angular-cool/social-login-buttons';

import { ClimaComponent } from './pages/apis/clima/clima.component'

//Api de Spotify
import { SpotifyComponent } from './pages/apis/spotify/spotify.component';
import { ReproductorComponent } from './pages/apis/reproductor/reproductor.component';

//Chatbot
import { ChatbotModule } from "./shared/components/chatbot/chatbot.module";
import { FoursquareComponent } from './pages/apis/foursquare/foursquare.component';




@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    FooterComponent,
    DialogContentExampleDialog,
    InicioComponent,
    Parte2Component,
    Parte3Component,
    Parte4Component,
    Parte5Component,
    PaquetesPersonalizadosComponent,
    MisPaquetesComponent,
    LoginComponent,
    RegistroComponent,
    RecuperarPComponent,
    ContraRecComponent,
    FacebookComponent,
    SpotifyComponent,
    ReproductorComponent,
    ClimaComponent,
    FoursquareComponent,
    
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ChatbotModule,
    CommonModule,
    HttpClientModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AdminModule,
    MaterialModule,
    MatDialogModule,
    MatCardModule,
    NgxMaterialTimepickerModule,
    FormsModule,
    PredeterminadoModule,
    SocialLoginModule,
    CoolFacebookButtonComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  providers: [
    provideHttpClient(withInterceptors([authInterceptor]), withFetch()),
    RegistroService,
    provideClientHydration(),
    provideAnimationsAsync(),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [
          {
            id: FacebookLoginProvider.PROVIDER_ID,
            provider: new FacebookLoginProvider('930121348970900')
          }
        ],
        onError: (err) => {
          console.error(err);
        }
      } as SocialAuthServiceConfig,
    }

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
