import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
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
    // const formData: FormData = new FormData();
    // console.log(foto);
    // if (foto) {
    //   formData.append('foto', foto);
    //   for (let key of formData.entries()) {
    //     console.log(key[0] + ', ' + key[1]);
    //   }
    // }

    // const headers = new HttpHeaders();
    // headers.append('Content-Type', 'multipart/form-data');
    return this.http.post<Usuario>(this.apiUrl, {nombre, username, email, password}, /*{ headers: headers }*/);
  }

  gestionarFotoPerfil(formData: FormData): Observable<string> {
    return this.http.post<string>(this.apiUrl + '/gestionar_foto_perfil', formData, /*{ headers: headers }*/);
  }

  actualizarUsuario(idUsuario: number, nombre: string, username: string, password?: string): Observable<UsuarioActualizado> {
    return this.http.put<UsuarioActualizado>(this.apiUrl + "/actualizar", {idUsuario, nombre, username, password}).pipe(
      tap(res => {
        console.log(res);
        localStorage.removeItem('authToken');
        localStorage.setItem('authToken', res.token);
        this.authService.actualizarToken(res.token);
      }
    ));
  }
}
