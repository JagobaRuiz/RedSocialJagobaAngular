import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private alertaSubject = new Subject<string>();
  alerta$ = this.alertaSubject.asObservable();

  mostrarAlerta(message: string): void {
    this.alertaSubject.next(message);
  }
}
