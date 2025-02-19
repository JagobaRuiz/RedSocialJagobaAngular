import { Component, OnInit } from '@angular/core';
import {FormGroup, FormControl, Validators, ReactiveFormsModule} from '@angular/forms';
import { NgIf } from '@angular/common';
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
    NgIf
  ],
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  formularioActualizarPerfil!: FormGroup;
  error: string = "";
  usuarioActual!: Usuario;
  authToken$: Observable<string | null>;
  idUsuario$: Observable<number | null>;
  idUsuario!: number;

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
          email: new FormControl(this.usuarioActual.email!, [Validators.required, Validators.email]),
          password: new FormControl(null, [Validators.required/*, Validators.minLength(8)*/]),
          imagen: new FormControl('')
        });
      });
  }

  comprobarImagen(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.formularioActualizarPerfil.patchValue({
        imagen: file
      });
    }
  }

  actualizar() {
    this.usuarioActual.nombre = this.formularioActualizarPerfil.get('nombre')?.value;
    this.usuarioActual.username = this.formularioActualizarPerfil.get('username')?.value;
    this.usuarioActual.email = this.formularioActualizarPerfil.get('email')?.value;
    this.usuarioActual.password = this.formularioActualizarPerfil.get('password')?.value;

    this.usuarioService.actualizarUsuario(this.usuarioActual).subscribe({
      next: (usuarioActualizado) => {
        console.log("usuario actualizado: ", usuarioActualizado);
      }
    })
  }
}
