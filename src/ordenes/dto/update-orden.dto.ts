import { IsEnum, IsOptional } from 'class-validator';
import { EstatusOrden } from '../../common/enums/estatus-orden.enum.js';

export class UpdateOrdenDto {
  @IsOptional()
  @IsEnum(EstatusOrden)
  estatus?: EstatusOrden;
}