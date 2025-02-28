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

  ngOnInit(): void {
  }
}


