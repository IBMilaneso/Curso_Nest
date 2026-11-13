import { IsInt, IsNotEmpty, IsArray, ValidateNested, IsString, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class ServicioDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  costo: number;
}

export class CreateOrdenDto {
  @IsInt()
  vehiculoId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServicioDto)
  servicios: ServicioDto[];
}