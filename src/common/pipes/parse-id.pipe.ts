import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class ParseIdPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const val = Number(value);
    if (!Number.isInteger(val) || val <= 0) {
      throw new BadRequestException('Identificador inválido');
    }
    return val;
  }
}