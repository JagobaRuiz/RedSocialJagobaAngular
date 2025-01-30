import { Routes } from '@angular/router';
import {InicioComponent} from '../components/inicio/inicio.component';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: InicioComponent },
  // { path: 'usuarios', component: UsuarioListComponent },
 // { path: 'mensajes', component: MensajeListComponent },
 // { path: 'mensajes', component: MensajeListComponent },
 // { path: 'mensajes', component: MensajeListComponent },
];
