import { Routes } from '@angular/router';
import {InicioComponent} from '../components/inicio/inicio.component';
import {LoginComponent} from '../components/login/login.component';
import {RegistroComponent} from '../components/registro/registro.component';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
 // { path: 'mensajes', component: MensajeListComponent },
 // { path: 'mensajes', component: MensajeListComponent },
];
