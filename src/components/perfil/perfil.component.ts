import { Component, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import {AsyncPipe, NgIf, NgOptimizedImage} from '@angular/common';
import { Usuario } from '../../models/usuario.model';
import { UsuarioService } from '../../services/usuario.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  imports: [
    ReactiveFormsModule,
    NgIf,
    NgOptimizedImage
  ],
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  formularioActualizarPerfil!: FormGroup;
  error: string = "";
  mensaje: string = "";
  usuarioActual!: Usuario;
  authToken$: Observable<string | null>;
  idUsuario$: Observable<number | null>;
  idUsuario!: number;
  foto!: File;
  ultimaActualizacion: number = Date.now();

  constructor(private usuarioService: UsuarioService, private router: Router, private authService: AuthService) {
    this.authToken$ = this.authService.authToken$;
    this.idUsuario$ = this.authService.authToken$.pipe(
      map(token => token ? this.authService.obtenerIdUsuarioDeToken(token) : null)
    );
  }

  ngOnInit() {
    this.idUsuario$.pipe(
        switchMap(id => {
          this.idUsuario = id!;
          return this.usuarioService.getUsuarioPorId(this.idUsuario);
        })
      ).subscribe(usuario => {
        this.usuarioActual = usuario;
        this.formularioActualizarPerfil = new FormGroup({
          nombre: new FormControl(this.usuarioActual.nombre!, [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z\\s]+$')]),
          username: new FormControl(this.usuarioActual.username!, [Validators.required, Validators.maxLength(20)]),
          // email: new FormControl(this.usuarioActual.email!, [Validators.required, Validators.email]),
          password: new FormControl(null, [this.agregarRequerido]),
          imagen: new FormControl(''),
          noCambiarPassword: new FormControl(false)
        });
      this.formularioActualizarPerfil.get('noCambiarPassword')?.valueChanges.subscribe(checked => {
        const passwordControl = this.formularioActualizarPerfil.get('password');
        if (checked) {
          passwordControl?.enable();
        } else {
          passwordControl?.disable();
        }
      });

      // Deshabilitar inicialmente el campo username si el checkbox no está marcado
      if (!this.formularioActualizarPerfil.get('noCambiarPassword')?.value) {
        this.formularioActualizarPerfil.get('password')?.disable();
      }

      });
  }

  agregarRequerido(control: AbstractControl): ValidationErrors | null {
    if (control.disabled) {
      return null;
    }
    return Validators.required(control);
  }

  comprobarImagen(event: any): void {
    if (event.target.files.length > 0) {
      this.foto = event.target.files[0];
    }
  }

  actualizar() {
    this.usuarioActual.nombre = this.formularioActualizarPerfil.get('nombre')?.value;
    this.usuarioActual.username = this.formularioActualizarPerfil.get('username')?.value;
    this.usuarioActual.password = this.formularioActualizarPerfil.get('password')?.value;

    this.usuarioService.actualizarUsuario(this.usuarioActual.id, this.formularioActualizarPerfil.get('nombre')?.value, this.formularioActualizarPerfil.get('username')?.value, this.formularioActualizarPerfil.get('password')?.value).subscribe({
      next: (usuarioActualizado) => {
        if (this.foto) {
          const formData = new FormData();
          formData.append('idUsuario', this.usuarioActual.id.toString());
          formData.append('foto', this.foto, this.foto.name);

          this.usuarioService.gestionarFotoPerfil(formData).subscribe({
            next: (response) => {
              const nuevaUrl = 'http://localhost:3000/profile_images/' + this.usuarioActual.id +'.jpg?nocache=' +Date.now();
              this.usuarioService.actualizarImagen(nuevaUrl); // Notifica el cambio de imagen
              this.actualizarImagen();
              this.mensaje = "Perfil actualizado correctamente.";
            }
          })
        }
        this.mensaje = "Perfil actualizado correctamente.";
      },
      error: (error) => {
        if (error.error?.error?.errno === 19){
            this.error = "Nombre de usuario repetido o no disponible";
        } else {
          this.error = "Error al actualizar el perfil";
        }
      }
    })
  }

  obtenerUrlImagen(): string {
    return 'http://localhost:3000/profile_images/' + this.idUsuario+ '.jpg?nocache=' + this.ultimaActualizacion;
  }

  actualizarImagen(): void {
    this.ultimaActualizacion = Date.now();
  }
}
