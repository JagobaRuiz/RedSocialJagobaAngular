import {Component, OnInit} from '@angular/core';
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
import {UsuarioService} from '../../services/usuario.service';
import {PickerModule} from '@ctrl/ngx-emoji-mart';


@Component({
  selector: 'app-detalle-mensaje',
  imports: [
    NgOptimizedImage,
    AsyncPipe,
    NgIf,
    FormsModule,
    ReactiveFormsModule,
    NgForOf,
    NgClass,
    PickerModule
  ],
  templateUrl: './detalle-mensaje.component.html',
  styleUrl: './detalle-mensaje.component.scss'
})
export class DetalleMensajeComponent implements OnInit {
  authToken$: Observable<string | null>;
  username$: Observable<string | null>;
  idUsuario$: Observable<number | null>;
  mensaje: Mensaje;
  formularioResponder: FormGroup;
  respuestas$: Observable<Mensaje[] | null>;
  urlImagen: string = '';
  abrirSelectorEmojis: boolean = false;
  adjuntoSeleccionado: File[] | null = null;
  tamanoMaximoMultimedia = 5 * 1024 * 1024; // 5 MB
  botonEnviarDeshabilitado: boolean = true;
  urlVistaPrevia!: string [] | null;

  constructor(private router: Router, private authService: AuthService, private mensajeService: MensajeService, private usuarioService: UsuarioService) {
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
      texto: new FormControl(null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]),
      multimedia: new FormControl(null),
    });
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

  responder() {
    let idUsuario;
    this.idUsuario$.subscribe(id => {
      idUsuario = id;
    });

    if (idUsuario) {
      this.mensajeService.publicarMensaje(this.formularioResponder.get('texto')?.value, idUsuario, this.adjuntoSeleccionado, this.mensaje.id).subscribe({
        next: (mensaje: Mensaje) => {
          this.mensajeService.cargarRespuestas(this.mensaje.id);
          this.formularioResponder.get('texto')?.setValue(null);
          this.formularioResponder.get('multimedia')?.setValue(null);
          this.urlVistaPrevia = null;
          this.adjuntoSeleccionado = null;
        },
        error: (error) => {}
      });
    }
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

  irDetalle(mensaje: Mensaje) {
    this.router.navigate(['mensaje/detalle'], { state: { data: mensaje } });
  }

  gestionarLike(mensaje: Mensaje) {
    this.mensajeService.gestionarLike(this.mensaje, this.idUsuario$, true);
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

  seleccionarEmoji(event: any) {
    if(this.formularioResponder.get('texto')?.value) {
      this.formularioResponder.get('texto')?.setValue(this.formularioResponder.get('texto')?.value + event.emoji.native);
    } else {
      this.formularioResponder.get('texto')?.setValue(event.emoji.native);
    }
  }

  abrirSelector() {
    if (!this.abrirSelectorEmojis) {
      this.abrirSelectorEmojis = true;
    } else {
      this.abrirSelectorEmojis = false;
    }
  }

  gestionarArchivoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    console.log(input);
    if (input.files) {
      const files = Array.from(input.files); // Convierte FileList a Array<File>
      console.log(files);

      // Almacena los archivos en una propiedad separada (no en el input directamente)
      this.adjuntoSeleccionado = files; // Una nueva propiedad para manejar los archivos

      // Valida el tamaño de los archivos seleccionados
      const archivosInvalidos = files.filter((file: File) => file.size > this.tamanoMaximoMultimedia);
      if (archivosInvalidos.length > 0) {
        this.formularioResponder.get('multimedia')?.setErrors({ maxSizeExceeded: true });
      } else {
        this.formularioResponder.get('multimedia')?.setErrors(null);
      }
      this.gestionarBotonResponder();

      // Crear vistas previas si es necesario
      this.urlVistaPrevia = [];

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.urlVistaPrevia?.push(e.target.result); // Añadir la URL de vista previa al array
          console.log(this.urlVistaPrevia); // Mostrar las vistas previas mientras se generan
        };
        reader.readAsDataURL(file);
      });
    }
  }

  vistaPreviaEsImagen(url: string): boolean {
    return url.startsWith('data:image/');
  }

  // Validar si el archivo es un video
  vistaPreviaIsVideo(url: string): boolean {
    return url.startsWith('data:video/');
  }

  esImagen(url: string): boolean {
    return url.match(/\.(jpeg|jpg|png|gif)$/i) !== null;
  }

  // Validar si la URL es un video
  esVideo(url: string): boolean {
    return url.match(/\.(mp4)$/i) !== null;
  }

  gestionarBotonResponder() {
    if (this.formularioResponder.get('texto')?.errors || this.formularioResponder.get('multimedia')?.errors) {
      this.botonEnviarDeshabilitado = true;
    } else {
      this.botonEnviarDeshabilitado = false;
    }
  }

  eliminarFicheroSeleccionado(index: number): void {
    this.adjuntoSeleccionado?.splice(index, 1);
    this.urlVistaPrevia?.splice(index, 1);
    // console.log('Archivos restantes:', this.selectedFiles);
  }


}

