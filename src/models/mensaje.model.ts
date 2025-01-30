import {Usuario} from './usuario.model';

export interface Mensaje {
  id: number;
  texto: string;
  usuario: Usuario;
  lesGusta?: Array<Usuario>;
  fecha: Date;
  respuestaDe?: Mensaje;
  respuestas?: Array<Mensaje>;

}
