import {Component, OnInit} from '@angular/core';
import {AlertaService} from '../../services/alerta.service';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-alerta',
  imports: [
    NgIf
  ],
  templateUrl: './alerta.component.html',
  styleUrl: './alerta.component.scss'
})
export class AlertaComponent implements OnInit {
  mensaje: string = '';

  constructor(private alertaService: AlertaService) {}

  ngOnInit() {
    this.alertaService.alerta$.subscribe((mensaje) => {
      this.mensaje = mensaje;

      // Ocultar la notificación después de 5 segundos
      setTimeout(() => {
        this.mensaje = '';
      }, 5000);
    });
  }


}
