import { NotFoundException } from '@nestjs/common';

export class VehiculoNoEncontradoException extends NotFoundException {
  constructor(id: number) {
    super(`Vehículo con id ${id} no encontrado`);
  }
}