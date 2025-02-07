import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Usuario} from '../models/usuario.model';
// import { UsuarioModel } from './usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient) { }

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

  loginConUsername(username: string, password: string): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl + "/login_username", {username, password});
  }
}
