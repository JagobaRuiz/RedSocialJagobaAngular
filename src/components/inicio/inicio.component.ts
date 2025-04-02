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
import {PickerModule} from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-inicio',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    AsyncPipe,
    NgForOf,
    NgOptimizedImage,
    NgClass,
    NgIf,
    PickerModule
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
  abrirSelectorEmojis: boolean = false;
  urlVistaPrevia!: string [] | null;
  adjuntoSelecciondo: File[] | null = null;
  tamanoMaximoMultimedia = 5 * 1024 * 1024; // 5 MB
  botonEnviarDeshabilitado: boolean = true;

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
      texto: new FormControl(null, [Validators.required, Validators.pattern(/^(?!\s*$).+/)]),
      multimedia: new FormControl (null)
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

    const formData = new FormData();
    formData.append('texto', this.formularioPublicarMensaje.get('texto')?.value); // Agregar texto
    // formData.append('idUsuario', idUsuario);
    const files = this.adjuntoSelecciondo;
    files?.forEach((file: File) => {
      console.log('file', file);
      formData.append('multimedia', file, file.name); // Agregar cada archivo
    });

    if (idUsuario) {
      this.mensajeService.publicarMensaje(this.formularioPublicarMensaje.get('texto')?.value, idUsuario, this.adjuntoSelecciondo).subscribe({
        next: (mensaje: Mensaje) => {
          this.formularioPublicarMensaje.get('texto')?.setValue(null);
          this.formularioPublicarMensaje.get('multimedia')?.setValue(null);
          this.urlVistaPrevia = null;
          this.adjuntoSelecciondo = null;
        },
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

  seleccionarEmoji(event: any) {
    if(this.formularioPublicarMensaje.get('texto')?.value) {
      this.formularioPublicarMensaje.get('texto')?.setValue(this.formularioPublicarMensaje.get('texto')?.value + event.emoji.native);
    } else {
      this.formularioPublicarMensaje.get('texto')?.setValue(event.emoji.native);
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
      this.adjuntoSelecciondo = files; // Una nueva propiedad para manejar los archivos

      // Valida el tamaño de los archivos seleccionados
      const archivosInvalidos = files.filter((file: File) => file.size > this.tamanoMaximoMultimedia);
      if (archivosInvalidos.length > 0) {
        this.formularioPublicarMensaje.get('multimedia')?.setErrors({ maxSizeExceeded: true });
      } else {
        this.formularioPublicarMensaje.get('multimedia')?.setErrors(null);
      }
      this.gestionarBotonPublicarMensaje();

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

  // Validar si el archivo es una imagen
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

  gestionarBotonPublicarMensaje() {
    if (this.formularioPublicarMensaje.get('texto')?.errors || this.formularioPublicarMensaje.get('multimedia')?.errors) {
      this.botonEnviarDeshabilitado = true;
    } else {
      this.botonEnviarDeshabilitado = false;
    }
  }

  eliminarFicheroSeleccionado(index: number): void {
    this.adjuntoSelecciondo?.splice(index, 1);
    this.urlVistaPrevia?.splice(index, 1);
    // console.log('Archivos restantes:', this.selectedFiles);
  }
}
