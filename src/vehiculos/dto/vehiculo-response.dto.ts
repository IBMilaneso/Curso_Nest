import { Exclude, Expose, Type } from 'class-transformer';
import { ClienteResponseDto } from '../../clientes/dto/cliente-response.dto.js';

@Exclude()
export class VehiculoResponseDto {
  @Expose()
  id: number;

  @Expose()
  placa: string;

  @Expose()
  marca: string;

  @Expose()
  modelo: string;

  @Expose()
  anio: number;

  @Expose()
  color: string | null;

  @Expose()
  clienteId: number;

  @Expose()
  @Type(() => ClienteResponseDto)
  cliente: ClienteResponseDto;
}