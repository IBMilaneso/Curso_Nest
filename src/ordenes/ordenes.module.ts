import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdenesService } from './ordenes.service.js';
import { OrdenesController } from './ordenes.controller.js';
import { Orden } from './entities/orden.entity.js';
import { OrdenDetalle } from './entities/orden-detalle.entity.js';
import { VehiculosModule } from '../vehiculos/vehiculos.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Orden, OrdenDetalle]), VehiculosModule],
  controllers: [OrdenesController],
  providers: [OrdenesService],
})
export class OrdenesModule {}