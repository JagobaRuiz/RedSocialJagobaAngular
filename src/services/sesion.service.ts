import {Injectable, Injector} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import {AlertaService} from './alerta.service';

@Injectable({
  providedIn: 'root'
})
export class SesionService {
  private intervalo = 1000; // Comprobar cada segundo
  private idIntervalo: any;
   // Inyectar el Injector en lugar de AuthService directamente

  constructor(private injector: Injector, private router: Router, private alertaService: AlertaService) {}

  private get authService() {
    return this.injector.get(AuthService); // Obtener AuthService solo cuando sea necesario
  }

  monitorearSesion(): void {
    this.idIntervalo = setInterval(() => {
      if (!this.authService.tokenEsValido()) {
        this.authService.cerrarSesion();
        this.alertaService.mostrarAlerta('La sesión ha caducado. Debes volver a iniciar sesión.');
        if (this.router.url === '/perfil') {
          this.router.navigate(['/login']);
        }
        clearInterval(this.idIntervalo);
      }
    }, this.intervalo);
  }

  pararMonitoreoSesion(): void {
    clearInterval(this.idIntervalo);
  }
}
