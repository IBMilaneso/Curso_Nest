import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ClienteResponseDto {
  @Expose()
  id: number;

  @Expose()
  nombre: string;

  @Expose()
  telefono: string;

  @Expose()
  correo: string;

  @Expose()
  rfc: string | null;

  @Expose()
  direccion: string | null;

  @Expose()
  activo: boolean;

  @Expose()
  fechaRegistro: Date;
}