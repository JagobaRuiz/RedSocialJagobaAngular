import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import { Usuario } from './usuario.model';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private apiUrl = 'http://localhost:3000/usuarios';

  constructor(private http: HttpClient) { }

  getUsuarios(): Observable<any[]> {
    //console.log(this.http.get<any[]>(this.apiUrl));
    return this.http.get<any[]>(this.apiUrl);
  }

  // addUsuario(usuario: Usuario): Observable<Usuario> {
  //   return this.http.post<Usuario>(this.apiUrl, usuario);
  // }
}
