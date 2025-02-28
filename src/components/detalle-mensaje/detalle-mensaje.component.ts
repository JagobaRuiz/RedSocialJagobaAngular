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
    this.mensajeService.cargarRespuestas(this.mensaje.id);
    this.respuestas$ = this.mensajeService.obtenerRespuestas();
    this.authToken$ = this.authService.authToken$;
    this.username$ = this.authToken$.pipe(
      map(token => token ? this.authService.obtenerNombreUsuarioDeToken(token) : null)
    );
    this.idUsuario$ = this.authToken$.pipe(
      map(token => token ? this.authService.obtenerIdUsuarioDeToken(token) : null)
    );
    this.formularioResponder = new FormGroup({
      texto: new FormControl('', [Validators.required])
    });
  }

  responder() {
    let idUsuario;
    this.idUsuario$.subscribe(id => {
      idUsuario = id;
    });

    if (idUsuario) {
      this.mensajeService.publicarMensaje(this.formularioResponder.get('texto')?.value, idUsuario, this.mensaje.id).subscribe({
        next: (mensaje: Mensaje) => {
          this.mensajeService.cargarRespuestas(this.mensaje.id);
        },
        error: (error) => {}
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
          next: (like) => {}
        })
      } else {
        this.mensajeService.quitarLike(idUsuario, mensaje.id).subscribe({
          next: (like) => {}
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

