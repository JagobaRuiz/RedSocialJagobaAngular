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

  obtenerMensajes() {
    return this.mensajes$;
  }

  publicarMensaje(texto: string, idUsuario: number, idRespuesta?: number) {
    //const fecha = Date.now();
    return this.http.post<Mensaje>(this.apiUrl, {texto, idUsuario}).pipe(
      tap(response => {
        const mensajesActuales = this.mensajesSubject.value;
        this.mensajesSubject.next([...mensajesActuales!, response]);
      })
    );

  }
}
