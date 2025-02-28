import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {UsuarioService} from '../services/usuario.service';
import {HeaderComponent} from '../components/header/header.component';
import {FooterComponent} from '../components/footer/footer.component';
import {BrowserModule} from '@angular/platform-browser';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {AlertaComponent} from '../components/alerta/alerta.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ReactiveFormsModule, CommonModule, AlertaComponent],
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'RedSocialJagobaAngular';
  haySesionIniciada;

  constructor(private authService: AuthService) {
    if (!this.authService.tokenEsValido()) {
      this.authService.cerrarSesion();
      console.log('Sesión (en teoría) cerrada');
      this.haySesionIniciada = false;
    } else {
      this.haySesionIniciada = true;
    }
  }

  ngOnInit(): void {
    // this.usuarioService.getUsuarios().subscribe(
    //   res => {
    //     console.log(res);
    //   }
    // )
    //
    // this.usuarioService.getUsuarioPorId(1).subscribe(
    //   res => {
    //     console.log(res);
    //   }
    // )
  }
}


