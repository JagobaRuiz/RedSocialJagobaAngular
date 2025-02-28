import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {CommonModule} from '@angular/common';
import {Observable, Subscription} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  // username: string ='';
  haySesionIniciada: boolean;
  authToken$: Observable<string | null>;
  username$: Observable<string | null>;
  private subscription!: Subscription;

  constructor(private router: Router, private authService: AuthService) {
   this.authToken$ = this.authService.authToken$;
   this.username$ = this.authToken$.pipe(
      map(token => token ? this.authService.obtenerNombreUsuarioDeToken(token) : null) // obtiene el token y
      //el pipe lo encadena con el map para transformarlo y preguntar en la condición ternaria si el token tiene valor y
      // si lo tiene llama al metodo obtenerNombreUsuarioDeToken y sino devuelve null
    );
   if (!this.authService.tokenEsValido()) {
     this.authService.cerrarSesion();
     console.log('Sesión (en teoría) cerrada');
     this.haySesionIniciada = false;
   } else {
     this.haySesionIniciada = true;
   }
  }

  ngOnInit(): void {
    this.subscription = this.authToken$.subscribe(token => {
      // this.haySesionIniciada = !!token;
      this.username$ = this.authToken$.pipe(
        map(token => token ? this.authService.obtenerNombreUsuarioDeToken(token) : null)
      );
    });
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

  irPerfil() {
    this.router.navigate(['perfil']);
  }

  cerrarSesion() {
    this.authService.cerrarSesion();
    console.log("Token después de cerrar sesión: ", this.authService.obtenerToken());
  }
}
