import {Usuario} from './usuario.model';

export interface UsuarioActualizado {
  usuario: Partial<Usuario>;
  token: string;

}
