import {Mensaje} from './mensaje.model';

export interface Usuario {
  id: number;
  nombre: string;
  username: string;
  email: string;
  password: string;
  mensajes?: Array<Mensaje>;
}
