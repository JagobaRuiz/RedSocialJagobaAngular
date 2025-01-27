import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {UsuarioService} from '../services/usuario.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'RedSocialJagobaAngular';

  constructor(private usuarioService: UsuarioService) {
  }

  ngOnInit(): void {
    this.usuarioService.getUsuarios().subscribe(
      res => {
        console.log(res);
      }
    )
  }
}


