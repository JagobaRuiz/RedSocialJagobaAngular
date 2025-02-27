import { Component } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf} from "@angular/common";
import {UsuarioService} from '../../services/usuario.service';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
    imports: [
        FormsModule,
        NgIf,
        ReactiveFormsModule
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  formularioLogin: FormGroup;
  error: string = "";

  constructor(private usuarioService: UsuarioService, private authService: AuthService, private router: Router,) {
    this.formularioLogin = new FormGroup({
      usernameOrEmail: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  iniciarSesion() {
    this.authService.iniciarSesion(this.formularioLogin.get("usernameOrEmail")?.value, this.formularioLogin.get("password")?.value).subscribe({
      next: (response) => {
        this.error = "";
        console.log("Ha iniciado sesión: ", response);
        console.log("Token: ", this.authService.obtenerToken());
        var token='';
        this.authService.obtenerToken().subscribe({
          next: (tokenRespuesta) => {
            if (tokenRespuesta) {
              token = tokenRespuesta;
              this.router.navigate(['inicio']);
            }
          }
        });
        if (token) {
          console.log("IdUsuario: ", this.authService.obtenerIdUsuarioDeToken(token));
          console.log("Username: ", this.authService.obtenerNombreUsuarioDeToken(token));
        }
        if (response.includes("incorrect")) {
          this.error = response;
        }

      },
      error: (error) => {
        this.error = "Error al iniciar sesión. Inténtalo mas tarde";
        console.log("Error: ", error);
      },
      complete: () => {
        console.log("Completado")
      }
    })
    // this.usuarioService.loginConUsername(this.formularioLogin.get("usernameOrEmail")?.value, this.formularioLogin.get("password")?.value).subscribe({
    //   next: (response) => {
    //     this.error="";
    //     console.log('Usuario logeado: ', response);
    //   },
    //   error: (error) => {
    //     console.log(error);
    //     if (error.error.error === "Usuario no encontrado") {
    //      this.error = error.error.error;
    //     } else {
    //       this.error = "Error en el login";
    //     }
    //     console.log(error.error.errorMessage);
    //     console.log("Mensaje error: ", this.error);
    //   },
    //   complete: () => {
    //     console.log('Request complete');
    //   }
    // });
  }


}
