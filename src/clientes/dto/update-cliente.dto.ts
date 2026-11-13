import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateClienteDto } from './create-cliente.dto.js';

export class UpdateClienteDto extends PartialType(CreateClienteDto) {
  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}