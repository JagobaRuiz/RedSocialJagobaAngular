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
        this.authService.obtenerToken().subscribe({
          next: (tokenRespuesta) => {
            if (tokenRespuesta) {
              this.router.navigate(['inicio']);
            }
          }
        });
        if (response.includes("incorrect")) {
          this.error = response;
        }

      },
      error: (error) => {
        this.error = "Error al iniciar sesión. Inténtalo mas tarde";
      },
      complete: () => {
      }
    })
  }
}
