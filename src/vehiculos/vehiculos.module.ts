import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VehiculosService } from './vehiculos.service.js';
import { VehiculosController } from './vehiculos.controller.js';
import { Vehiculo } from './entities/vehiculo.entity.js';
import { ClientesModule } from '../clientes/clientes.module.js';

@Module({
  imports: [TypeOrmModule.forFeature([Vehiculo]), ClientesModule],
  controllers: [VehiculosController],
  providers: [VehiculosService],
  exports: [VehiculosService],
})
export class VehiculosModule {}