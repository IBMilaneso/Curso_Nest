import { IsString, IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(150)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^[0-9]{10,15}$/)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  telefono: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(100)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  correo: string;

  @IsOptional()
  @IsString()
  @MaxLength(13)
  @Matches(/^[A-ZÑ&]{3,4}[0-9]{6}[A-Z0-9]{3}$/)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  rfc?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  direccion?: string;
}