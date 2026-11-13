import { IsString, IsNotEmpty, IsInt, IsOptional, MaxLength, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateVehiculoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  placa: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  marca: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  modelo: string;

  @IsInt()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  anio: number;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  color?: string;

  @IsInt()
  clienteId: number;
}