import { Exclude, Expose, Type } from 'class-transformer';
import { EstatusOrden } from '../../common/enums/estatus-orden.enum.js';
import { VehiculoResponseDto } from '../../vehiculos/dto/vehiculo-response.dto.js';

@Exclude()
export class OrdenDetalleResponseDto {
  @Expose()
  id: number;

  @Expose()
  descripcion: string;

  @Expose()
  costo: number;
}

@Exclude()
export class OrdenResponseDto {
  @Expose()
  id: number;

  @Expose()
  estatus: EstatusOrden;

  @Expose()
  total: number;

  @Expose()
  fechaIngreso: Date;

  @Expose()
  @Type(() => VehiculoResponseDto)
  vehiculo: VehiculoResponseDto;

  @Expose()
  @Type(() => OrdenDetalleResponseDto)
  detalles: OrdenDetalleResponseDto[];
}