import { ConflictException } from '@nestjs/common';

export class ClienteDuplicadoException extends ConflictException {
  constructor(campo: string) {
    super(`Cliente duplicado por ${campo}`);
  }
}