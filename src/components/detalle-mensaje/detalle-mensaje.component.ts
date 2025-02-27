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

  obtenerTiempoVida(fechaPublicacion: Date): string {
   return this.mensajeService.obtenerTiempoVida(fechaPublicacion);
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

