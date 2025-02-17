import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Mensaje} from '../models/mensaje.model';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';
import {tap} from 'rxjs/operators';
import {Usuario} from '../models/usuario.model';

@Injectable({
  providedIn: 'root'
})
export class MensajeService {
  private apiUrl = 'http://localhost:3000/mensajes';
  private mensajesSubject = new BehaviorSubject<Mensaje[] | null>(null);
  mensajes$: Observable<Mensaje[] | null> = this.mensajesSubject.asObservable();
  private respuestasSubject = new BehaviorSubject<Mensaje[] | null>(null);
  respuestas$: Observable<Mensaje[] | null> = this.respuestasSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.cargarMensajes();
  }

  private cargarMensajes() {
    this.http.get<{ data: Mensaje[] }>(this.apiUrl)
      .pipe(
        tap(response => this.mensajesSubject.next(response.data))
      )
      .subscribe();
  }

  cargarRespuestas(idMensaje: number) {
    this.http.get<{ data: Mensaje[] }>(this.apiUrl + '/' +idMensaje + '/respuestas')
      .pipe(
        tap(response => this.respuestasSubject.next(response.data))
      )
      .subscribe();
  }

  obtenerMensajes() {
    return this.mensajes$;
  }

  obtenerRespuestas() {
    return this.respuestas$;
  }

  publicarMensaje(texto: string, idUsuario: number, idRespuesta?: number): Observable<Mensaje> {
    return this.http.post<Mensaje>(this.apiUrl, {texto, idUsuario, idRespuesta}).pipe(
      tap(response => {
        const mensajesActuales = this.mensajesSubject.value;
        if (mensajesActuales) {
          mensajesActuales.unshift(response)
        }
        this.mensajesSubject.next(mensajesActuales);

        const respuestasActuales = this.respuestasSubject.value;

        if (respuestasActuales) {
          respuestasActuales.unshift(response);
        }
        this.mensajesSubject.next(respuestasActuales);


      })
    );
  }
}
