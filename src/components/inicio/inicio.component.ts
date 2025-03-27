import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {Router} from '@angular/router';
import {AuthService} from '../../services/auth.service';
import {map} from 'rxjs/operators';
import {AsyncPipe, NgClass, NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {Mensaje} from '../../models/mensaje.model';
import {MensajeService} from '../../services/mensaje.service';
import {Usuario} from '../../models/usuario.model';
import {format} from 'date-fns';
import {UsuarioService} from '../../services/usuario.service';

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
export class InicioComponent implements OnInit {
  authToken$: Observable<string | null>;
  username$: Observable<string | null>;
  idUsuario$: Observable<number | null>;
  mensajes$!: Observable<Mensaje[] | null>;
  formularioPublicarMensaje: FormGroup;
  urlImagen: string = '';

  constructor(private router: Router, private authService: AuthService, private mensajeService: MensajeService, private usuarioService: UsuarioService) {
    this.authToken$ = this.authService.authToken$;
    this.mensajes$ = this.mensajeService.obtenerMensajes();
    this.username$ = this.authToken$.pipe(
      map(token => token ? this.authService.obtenerNombreUsuarioDeToken(token) : null)
    );
    this.idUsuario$ = this.authToken$.pipe(
      map(token => token ? this.authService.obtenerIdUsuarioDeToken(token) : null)
    );

    this.formularioPublicarMensaje = new FormGroup({
      texto: new FormControl(null, [Validators.required])
    })
  }

  ngOnInit(): void {
    this.usuarioService.urlImagen$.subscribe((nuevaUrl) => {
      if (nuevaUrl) {
        this.urlImagen = nuevaUrl;
      }
      // else {
      //   this.urlImagen = 'http://localhost:3000/profile_images/';
      // }
    });
  }

  publicarMensaje() {
    let idUsuario;
    this.idUsuario$.subscribe(id => {
      idUsuario = id;
    });

    if (idUsuario) {
      this.mensajeService.publicarMensaje(this.formularioPublicarMensaje.get('texto')?.value, idUsuario).subscribe({
        next: (mensaje: Mensaje) => {},
        error: (error) => {}
      });
    }

  }

  obtenerTiempoVidaMensaje(fechaPublicacion: Date): string {
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

  gestionarLike(mensaje: Mensaje) {
    this.mensajeService.gestionarLike(mensaje, this.idUsuario$);
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
