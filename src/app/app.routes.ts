import { Routes } from '@angular/router';
import {InicioComponent} from '../components/inicio/inicio.component';
import {LoginComponent} from '../components/login/login.component';
import {RegistroComponent} from '../components/registro/registro.component';
import {DetalleMensajeComponent} from '../components/detalle-mensaje/detalle-mensaje.component';
import {PerfilComponent} from '../components/perfil/perfil.component';

export const routes: Routes = [
  { path: '', redirectTo: '/inicio', pathMatch: 'full' },
  { path: 'inicio', component: InicioComponent },
  { path: 'login', component: LoginComponent },
  { path: 'registro', component: RegistroComponent },
 { path: 'mensaje/detalle', component: DetalleMensajeComponent },
 { path: 'perfil', component: PerfilComponent },
];
