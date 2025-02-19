import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Usuario} from '../models/usuario.model';
import {tap} from 'rxjs/operators';
import {AuthService} from './auth.service';
import {UsuarioActualizado} from '../models/usuario-actualizado.model';
// import { UsuarioModel } from './usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient, private authService: AuthService) { }

  getUsuarios(): Observable<Usuario[]> {
    //console.log(this.http.get<any[]>(this.apiUrl));
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  getUsuarioPorId(id: number): Observable<Usuario> {
    //console.log(this.http.get<any[]>(this.apiUrl));
    return this.http.get<Usuario>(this.apiUrl + "/" + id);
  }

  addUsuario(nombre: string, username: string, email: string, password: string): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, {nombre, username, email, password});
  }

  actualizarUsuario(usuario: Usuario): Observable<UsuarioActualizado> {
    return this.http.post<UsuarioActualizado>(this.apiUrl + "/actualizar", usuario).pipe(
      tap(res => {
        console.log(res);
        localStorage.removeItem('authToken');
        localStorage.setItem('authToken', res.token);
        this.authService.actualizarToken(res.token);
      }
    ));
  }
}
