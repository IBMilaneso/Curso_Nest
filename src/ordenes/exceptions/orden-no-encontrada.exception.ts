import { NotFoundException } from '@nestjs/common';

export class OrdenNoEncontradaException extends NotFoundException {
  constructor(id: number) {
    super(`Orden de servicio con id ${id} no encontrada`);
  }
}