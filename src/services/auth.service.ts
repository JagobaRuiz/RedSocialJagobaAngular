import {Injectable, Injector} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import {BehaviorSubject, Observable, of} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';
import {SesionService} from './sesion.service';
import {UsuarioService} from './usuario.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private authTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);
  public authToken$: Observable<string | null> = this.authTokenSubject.asObservable();
  // Lo que hace es que cada vez que se le pase al authTokenSubject un valor con .next('valor') se actualiza el valor de
  //authToken$, que está a la escucha.

  constructor(private http: HttpClient, private router: Router, private sesionService: SesionService, private injector: Injector,) {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.authTokenSubject.next(token);
    }
  }

  private get usuarioService() {
    return this.injector.get(UsuarioService); // Obtener AuthService solo cuando sea necesario
  }

  iniciarSesion(username: string, password: string): Observable<string> {
    return this.http.post<{ token: string }>(this.apiUrl + "/login_username", { username, password }).pipe(
      tap(response => {
        localStorage.setItem('authToken', response.token);
        this.authTokenSubject.next(response.token);
        this.sesionService.monitorearSesion();
      }),
      map(() => "login correcto"),
      catchError((error: HttpErrorResponse) => {
        console.error('Error al iniciar sesión:', error);
        return of(error.error.error);
      })
    );
  }

  cerrarSesion(): void {
    localStorage.removeItem('authToken');
    this.usuarioService.borrarUrlImagen();
    this.authTokenSubject.next(null);
    this.sesionService.pararMonitoreoSesion();
  }

  tokenEsValido(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return false;
    }
    const tokenDesencriptado = this.desencriptarToken(token);
    return tokenDesencriptado && tokenDesencriptado.exp > Date.now() / 1000;
  }

  obtenerToken(): Observable<string | null> {
    return this.authToken$;
  }

  obtenerIdUsuarioDeToken(token: string): number {
    const tokenDesencriptado = this.desencriptarToken(token);
    return tokenDesencriptado.idUsuario;
  }

  obtenerNombreUsuarioDeToken(token: string): string {
    const tokenDesencriptado = this.desencriptarToken(token);
    return tokenDesencriptado.username;
  }

  desencriptarToken(token: string): any {
    try {
      return jwtDecode(token);
    } catch (error: any) {
      return null;
    }
  }

  actualizarToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.authTokenSubject.next(token);
  }
}
