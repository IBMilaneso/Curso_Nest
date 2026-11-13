import { ConflictException } from '@nestjs/common';

export class VehiculoDuplicadoException extends ConflictException {
  constructor(placa: string) {
    super(`Ya existe un vehículo registrado con la placa ${placa}`);
  }
}