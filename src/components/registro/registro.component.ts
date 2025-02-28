import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Usuario} from '../../models/usuario.model';
import {CommonModule} from '@angular/common';
import {UsuarioService} from '../../services/usuario.service';
import {Router} from '@angular/router';

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
  foto!: File;
  email: string = "";
  error: string = "";


  constructor(private usuarioService: UsuarioService, private router: Router) {
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
  Después obtiene el archivo seleccionado y si hay mas de uno solo se quedará con el primero, ya que en algunos casos el selector permite
  más de una imagen, pero solo podemos tener una imagen de perfil.
  */

  comprobarImagen(event: any): void {
   if (event.target.files.length > 0) {
      this.foto = event.target.files[0];
    }
  }

  registrar() {
    if (this.formularioRegistro.valid) {
      this.error="";
      this.nombre = this.formularioRegistro.get("nombre")?.value;
      this.username = this.formularioRegistro.get("username")?.value;
      this.password = this.formularioRegistro.get("password")?.value;
      this.email = this.formularioRegistro.get("email")?.value;

      this.usuarioService.addUsuario(this.nombre, this.username, this.email, this.password).subscribe({
        next: (response) => {
          const formDataFoto = new FormData();
          formDataFoto.append('idUsuario', response.id.toString());
          if (this.foto) {
            formDataFoto.append('foto', this.foto, this.foto.name);
          }
          this.usuarioService.gestionarFotoPerfil(formDataFoto).subscribe({
            next: (response) => {
              this.router.navigate(['login']);
            }
          });
        },
        error: (error) => {
          if (error.error.error.errno === 19){
                  if (error.error.errorMessage.includes("email")) {
                    this.error = "Email repetido o no disponible";
                  } else if (error.error.errorMessage.includes("username")) {
                    this.error = "Nombre de usuario repetido o no disponible";
                  }
                }
        },
        complete: () => {
        }
      });
    }
  }
}
