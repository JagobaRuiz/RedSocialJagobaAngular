import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {Mensaje} from '../../models/mensaje.model';
import {AuthService} from '../../services/auth.service';
import {MensajeService} from '../../services/mensaje.service';
import {AsyncPipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario.model';
import {format} from 'date-fns';

@Component({
  selector: 'app-detalle-mensaje',
  imports: [
    NgOptimizedImage,
    AsyncPipe,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgForOf,
    NgClass
  ],
  templateUrl: './detalle-mensaje.component.html',
  styleUrl: './detalle-mensaje.component.scss'
})
export class DetalleMensajeComponent {
  authToken$: Observable<string | null>;
  username$: Observable<string | null>;
  idUsuario$: Observable<number | null>;
  mensaje: Mensaje;
  formularioResponder: FormGroup;
  respuestas$: Observable<Mensaje[] | null>;

  constructor(private router: Router, private authService: AuthService, private mensajeService: MensajeService) {
    const navigation = this.router.getCurrentNavigation();
    this.mensaje = navigation?.extras?.state?.['data'];
    console.log("mensaje", this.mensaje);
    this.mensajeService.cargarRespuestas(this.mensaje.id);
    this.respuestas$ = this.mensajeService.obtenerRespuestas();
    this.authToken$ = this.authService.authToken$;
    //this.mensajeConRespuestas$ = this.mensajeService.obtenerMensajes();
    this.username$ = this.authToken$.pipe(
      map(token => token ? this.authService.obtenerNombreUsuarioDeToken(token) : null)
    );
    this.idUsuario$ = this.authToken$.pipe(
      map(token => token ? this.authService.obtenerIdUsuarioDeToken(token) : null)
    );
    this.formularioResponder = new FormGroup({
      texto: new FormControl('', [Validators.required])
    });
    // this.respuestas$ = this.mensajeService.respuestas$;
  }

  responder() {
    let idUsuario;
    this.idUsuario$.subscribe(id => {
      idUsuario = id;
    });

    if (idUsuario) {
      this.mensajeService.publicarMensaje(this.formularioResponder.get('texto')?.value, idUsuario, this.mensaje.id).subscribe({
        next: (mensaje: Mensaje) => {
          console.log("Mensaje publicado: ", mensaje);
          this.mensajeService.cargarRespuestas(this.mensaje.id);
        },
        error: (error) => {
          console.log("Error: ", error);
        }
      });
    }
  }

  obtenerTiempoVida(fechaPublicacion: Date) {
    fechaPublicacion = new Date(fechaPublicacion);
    const fechaPublicacionMilis = fechaPublicacion.getTime();
    const tiempoDeVidaMilis = Date.now() - fechaPublicacionMilis;
    const segundos = Math.floor((tiempoDeVidaMilis / 1000) % 60);
    const minutos = Math.floor((tiempoDeVidaMilis / (1000 * 60)) % 60);
    const horas =  Math.floor((tiempoDeVidaMilis / (1000 * 60 * 60)) % 24);
    const dias = Math.floor(tiempoDeVidaMilis / (1000 * 60 * 60 * 24));

    // console.log('Segundos:' + segundos+'\nMinutos: ' + minutos +'\nHoras: ' + horas +'\nDías: '+ dias);

    const tiempoDeVidaFormateado = format(tiempoDeVidaMilis, 'dd MMM yy');

    if (segundos <= 59 && minutos === 0 && horas === 0 && dias === 0 ) {
      return segundos + 's';
    } else if (minutos <= 59 && horas === 0 && dias === 0) {
      return minutos + 'm';
    } else if (horas <= 59 && dias === 0) {
      return horas + 'h';
    } else if (dias <= 6) {
      return dias + 'd';
    } else {
      return tiempoDeVidaFormateado;
    }
  }

  irDetalle(mensaje: Mensaje) {
    this.router.navigate(['mensaje/detalle'], { state: { data: mensaje } });
  }

  gestionarLike(mensaje: Mensaje) {
    let idUsuario: number | null = null;
    let leHaDadoLike: boolean = false;
    this.idUsuario$.subscribe(id => {
      idUsuario = id;
    });
    if (idUsuario) {
      mensaje.lesGusta?.forEach((like: Usuario) => {
        if (like.id === idUsuario) {
          leHaDadoLike = true;
        }
      });

      if (!leHaDadoLike) {
        this.mensajeService.darLike(idUsuario, mensaje.id).subscribe({
          next: (like) => {
            console.log("Like: ", like);
          }
        })
      } else {
        this.mensajeService.quitarLike(idUsuario, mensaje.id).subscribe({
          next: (like) => {
            console.log("Like borrado: ", like);
          }
        })
      }

    }
  }

  leHaDadoLikeElUsuarioLogueado(likesDelMensaje: Usuario[] | null) {
    let leHaDadoLike = false;
    this.idUsuario$.subscribe(idUsuario => {
      likesDelMensaje?.forEach((like: Usuario) => {
        if (like.id === idUsuario) {
          leHaDadoLike = true;
        }
      })
    });
    return leHaDadoLike;
  }

}

