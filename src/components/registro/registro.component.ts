import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario.model';
import {CommonModule} from '@angular/common';
import {UsuarioService} from '../../services/usuario.service';

@Component({
  selector: 'app-registro',
  imports: [
    ReactiveFormsModule,
    CommonModule
  ],
  standalone: true,
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.scss'
})
export class RegistroComponent implements OnInit {
  formularioRegistro: FormGroup;
  nombre: string = "";
  username: string = "";
  password: string = "";
  email: string = "";
  error: string = "";
  // usuarioNuevo: Usuario = {
  //   email: '',
  //   password: '',
  //   nombre: '',
  //   username: '',
  //   id: 0,
  //
  // };

  constructor(private usuarioService: UsuarioService) {
    this.formularioRegistro = new FormGroup({
      nombre: new FormControl('', [Validators.required, Validators.maxLength(15), Validators.pattern('^[a-zA-Z\\s]+$')]),
      username: new FormControl('', [Validators.required, Validators.maxLength(20)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      imagen: new FormControl('')
    });
  }

  ngOnInit(): void {

  }

  /*Ésta función se activa cuando se selecciona un archivo. Lo que hace es verificar si se ha seleccionado un archivo.
  Después obtiene el archivo seleccionado y si hay mas de uno solo se quedará con el primero, ya que el selector permite
  más de una imagen, pero solo podemos tener una imagen de perfil.
  La función se usará básicamente para controlar que el usuario solo elige una foto de perfil.
  */

  comprobarImagen(event: any): void {
   /* if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.formularioRegistro.patchValue({
        imagen: file
      });
    }*/
  }

  registrar() {
    if (this.formularioRegistro.valid) {
      this.error="";
      this.nombre = this.formularioRegistro.get("nombre")?.value;
      this.username = this.formularioRegistro.get("username")?.value;
      this.password = this.formularioRegistro.get("password")?.value;
      this.email = this.formularioRegistro.get("email")?.value;

      this.usuarioService.addUsuario(this.nombre, this.username, this.email, this.password).subscribe(
        response => {
          console.log("usuario Registrado: ", response);
        },
        error => {
          if (error.error.error.errno === 19){
            if (error.error.errorMessage.includes("email")) {
              this.error = "Email repetido o no disponible";
            } else if (error.error.errorMessage.includes("username")) {
              this.error = "Nombre de usuario repetido o no disponible";
            }

          }
          console.log(error.error.errorMessage);
          console.log("Mensaje error: ", this.error);
        });
      }

      console.log("Imagen: ", this.formularioRegistro.get("imagen"));
    }
}
