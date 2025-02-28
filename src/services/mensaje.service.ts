import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {Mensaje} from '../models/mensaje.model';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Router} from '@angular/router';
import {tap} from 'rxjs/operators';
import {Usuario} from '../models/usuario.model';
import {Like} from '../models/like.model';
import {format} from 'date-fns';

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

   cargarMensajes() {
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
    let headers = new HttpHeaders({
      'Authorization' : 'Bearer '+ localStorage.getItem('authToken')
    });

    return this.http.post<Mensaje>(this.apiUrl, {texto, idUsuario, idRespuesta}, {headers: headers}).pipe(
      tap(response => {
        const mensajesActuales = this.mensajesSubject.value
        if (mensajesActuales) {
          mensajesActuales.unshift(response);
          this.mensajesSubject.next(mensajesActuales);
        }

        if (idRespuesta) {
          const respuestasActuales = this.respuestasSubject.value;

          if (respuestasActuales) {
            respuestasActuales.unshift(response);
          }
          this.mensajesSubject.next(respuestasActuales);
        }

      })
    );
  }

  darLike(idUsuario: number, idMensaje: number, vieneDeRespuestas?: boolean): Observable<Like> {
    let headers = new HttpHeaders({
      'Authorization' : 'Bearer '+ localStorage.getItem('authToken')
    });

    return this.http.post<Like>(this.apiUrl + '/likes/dar', {idUsuario, idMensaje}, {headers: headers}).pipe(
      tap(response => {
        if (vieneDeRespuestas) {
          this.cargarRespuestas(idMensaje);
        } else {
          this.cargarMensajes();
        }
      })
    )

  }

  quitarLike(idUsuario: number, idMensaje: number, vieneDeRespuestas?: boolean): Observable<Like> {
    let headers = new HttpHeaders({
      'Authorization' : 'Bearer '+ localStorage.getItem('authToken')
    });
    return this.http.post<Like>(this.apiUrl + '/likes/quitar', {idUsuario, idMensaje}, {headers: headers}).pipe(
      tap(response => {
        if (vieneDeRespuestas) {
          this.cargarRespuestas(idMensaje);
        } else {
          this.cargarMensajes();
        }
      })
    )

  }

  obtenerTiempoVida(fechaPublicacion: Date): string {
    fechaPublicacion = new Date(fechaPublicacion);
    const fechaPublicacionMilis = fechaPublicacion.getTime();
    const tiempoDeVidaMilis = Date.now() - fechaPublicacionMilis;
    const segundos = Math.floor((tiempoDeVidaMilis / 1000) % 60);
    const minutos = Math.floor((tiempoDeVidaMilis / (1000 * 60)) % 60);
    const horas =  Math.floor((tiempoDeVidaMilis / (1000 * 60 * 60)) % 24);
    const dias = Math.floor(tiempoDeVidaMilis / (1000 * 60 * 60 * 24));

    const fechaPublicacionFormateada = format(fechaPublicacion, 'dd MMM yy');

    if (segundos <= 59 && minutos === 0 && horas === 0 && dias === 0 ) {
      return segundos + 's';
    } else if (minutos <= 59 && horas === 0 && dias === 0) {
      return minutos + 'm';
    } else if (horas <= 59 && dias === 0) {
      return horas + 'h';
    } else if (dias <= 6) {
      return dias + 'd';
    } else {
      return fechaPublicacionFormateada;
    }
  }


  gestionarLike(mensaje: Mensaje, idUsuario$: Observable<number | null>) {
    let idUsuario: number | null = null;
    let leHaDadoLike: boolean = false;
    idUsuario$.subscribe(id => {
      idUsuario = id;
    });
    if (idUsuario) {
      mensaje.lesGusta?.forEach((like: Usuario) => {
        if (like.id === idUsuario) {
          leHaDadoLike = true;
        }
      });

      if (!leHaDadoLike) {
        this.darLike(idUsuario, mensaje.id).subscribe({
          next: (like) => {
          }
        })
      } else {
        this.quitarLike(idUsuario, mensaje.id).subscribe({
          next: (like) => {
          }
        })
      }

    }
  }

}
