import { Component } from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgIf} from "@angular/common";
import {UsuarioService} from '../../services/usuario.service';

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

  constructor(private usuarioService: UsuarioService) {
    this.formularioLogin = new FormGroup({
      usernameOrEmail: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required])
    });
  }

  iniciarSesion() {
    this.usuarioService.loginConUsername(this.formularioLogin.get("usernameOrEmail")?.value, this.formularioLogin.get("password")?.value).subscribe({
      next: (response) => {
        this.error="";
        console.log('Usuario logeado: ', response);
      },
      error: (error) => {
        console.log(error);
        if (error.error.error === "Usuario no encontrado") {
         this.error = error.error.error;
        } else {
          this.error = "Error en el login";
        }
        console.log(error.error.errorMessage);
        console.log("Mensaje error: ", this.error);
      },
      complete: () => {
        console.log('Request complete');
      }
    });
  }


}
