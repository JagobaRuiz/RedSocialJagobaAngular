import { Component } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {map} from 'rxjs/operators';
import {AsyncPipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {Mensaje} from '../../models/mensaje.model';
import {MensajeService} from '../../services/mensaje.service';
import {Usuario} from '../../models/usuario.model';

@Component({
  selector: 'app-inicio',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    NgForOf,
    NgOptimizedImage,
    NgClass,
    NgIf
  ],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.scss'
})
export class InicioComponent {
  authToken$: Observable<string | null>;
  username$: Observable<string | null>;
  idUsuario$: Observable<number | null>;
  mensajes$: Observable<Mensaje[] | null>;
  formularioPublicarMensaje: FormGroup;

  constructor(private router: Router, private authService: AuthService, private mensajeService: MensajeService) {
    this.authToken$ = this.authService.authToken$;
    this.mensajes$ = this.mensajeService.obtenerMensajes();
    this.username$ = this.authToken$.pipe(
      map(token => token ? this.authService.obtenerNombreUsuarioDeToken(token) : null)
    );
    this.idUsuario$ = this.authToken$.pipe(
      map(token => token ? this.authService.obtenerIdUsuarioDeToken(token) : null)
    );

    this.formularioPublicarMensaje = new FormGroup({
      texto: new FormControl('', [Validators.required])
    });
  }

  publicarMensaje() {
    let idUsuario;
    this.idUsuario$.subscribe(id => {
      idUsuario = id;
    });

    if (idUsuario) {
      this.mensajeService.publicarMensaje(this.formularioPublicarMensaje.get('texto')?.value, idUsuario).subscribe({
        next: (mensaje: Mensaje) => {
          console.log("Mensaje publicado: ", mensaje);
        },
        error: (error) => {
          console.log("Error: ", error);
        }
      });
    }

  }

  obtenerTiempoVidaMensaje(fechaPublicacion: Date) {
    // console.log('fechaPublicacion: ', fechaPublicacion);
    return "dfdfhghgh"
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

  irDetalle(mensaje: Mensaje) {
    this.router.navigate(['mensaje/detalle'], { state: { data: mensaje } });
  }

}
