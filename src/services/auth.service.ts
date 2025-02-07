import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import { Router } from '@angular/router';
import {BehaviorSubject, Observable, of} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000';
  private authTokenSubject = new BehaviorSubject<string | null>(null);
  authToken$: Observable<string | null> = this.authTokenSubject.asObservable();
  // Lo que hace es que cada vez que se le pase al authTokenSubject un valor con .next('valor') se actualiza el valor de
  //authToken$, que está a la escucha.

  constructor(private http: HttpClient, private router: Router) {
    const token = localStorage.getItem('authToken');
    if (token) {
      this.authTokenSubject.next(token);
    }
  }

  iniciarSesion(username: string, password: string): Observable<string> {
    return this.http.post<{ token: string }>(this.apiUrl + "/login_username", { username, password }).pipe(
      tap(response => {
        console.log(response);
        localStorage.setItem('authToken', response.token);
        this.authTokenSubject.next(response.token);
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
    this.authTokenSubject.next(null);
    this.router.navigate(['/login']);
  }

  estaLogeado(): Observable<boolean> {
    return this.authToken$.pipe(map(token => !!token)); //Recibimos el token y lo transformamos en booleano según si hay token o no
   // return !!localStorage.getItem('authToken');
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
      console.error('Token no válido:', error.message);
      return null;
    }
  }
}
