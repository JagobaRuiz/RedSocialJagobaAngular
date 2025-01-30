import {Component, OnInit} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {UsuarioService} from '../services/usuario.service';
import {HeaderComponent} from '../components/header/header.component';
import {FooterComponent} from '../components/footer/footer.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
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

    this.usuarioService.getUsuarioPorId(1).subscribe(
      res => {
        console.log(res);
      }
    )
  }
}


