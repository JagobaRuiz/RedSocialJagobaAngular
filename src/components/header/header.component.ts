import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private router: Router) {
  }

  irInicio() {
    this.router.navigate(['inicio']);
  }

  irLogin() {
    this.router.navigate(['login']);
  }

  irRegistro() {
    this.router.navigate(['registro']);
  }

  cerrarSesion() {
    console.log('cerrarSesion');
  }
}
