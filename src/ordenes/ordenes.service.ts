import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Orden } from './entities/orden.entity.js';
import { OrdenDetalle } from './entities/orden-detalle.entity.js';
import { CreateOrdenDto } from './dto/create-orden.dto.js';
import { UpdateOrdenDto } from './dto/update-orden.dto.js';
import { OrdenResponseDto } from './dto/orden-response.dto.js';
import { OrdenNoEncontradaException } from './exceptions/orden-no-encontrada.exception.js';
import { VehiculosService } from '../vehiculos/vehiculos.service.js';

@Injectable()
export class OrdenesService {
  constructor(
    @InjectRepository(Orden)
    private readonly ordenRepository: Repository<Orden>,
    private readonly vehiculosService: VehiculosService,
  ) {}

  async create(createOrdenDto: CreateOrdenDto): Promise<OrdenResponseDto> {
    await this.vehiculosService.findOne(createOrdenDto.vehiculoId);

    const totalCalculado = createOrdenDto.servicios.reduce((acc, s) => acc + s.costo, 0);

    const detalles = createOrdenDto.servicios.map(s => {
      const detalle = new OrdenDetalle();
      detalle.descripcion = s.descripcion;
      detalle.costo = s.costo;
      return detalle;
    });

    const nuevaOrden = this.ordenRepository.create({
      vehiculoId: createOrdenDto.vehiculoId,
      total: totalCalculado,
      detalles,
    });

    const ordenGuardada = await this.ordenRepository.save(nuevaOrden);
    return this.findOne(ordenGuardada.id);
  }

  async findAll(): Promise<OrdenResponseDto[]> {
    const ordenes = await this.ordenRepository.find({
      relations: { vehiculo: true, detalles: true },
      order: { fechaIngreso: 'DESC' },
    });
    return plainToInstance(OrdenResponseDto, ordenes);
  }

  async findOne(id: number): Promise<OrdenResponseDto> {
    const orden = await this.ordenRepository.findOne({
      where: { id },
      relations: { vehiculo: true, detalles: true },
    });

    if (!orden) {
      throw new OrdenNoEncontradaException(id);
    }
    return plainToInstance(OrdenResponseDto, orden);
  }

  async update(id: number, updateOrdenDto: UpdateOrdenDto): Promise<OrdenResponseDto> {
    const orden = await this.ordenRepository.findOne({ where: { id } });
    
    if (!orden) {
      throw new OrdenNoEncontradaException(id);
    }

    if (updateOrdenDto.estatus) {
      orden.estatus = updateOrdenDto.estatus;
    }

    await this.ordenRepository.save(orden);
    return this.findOne(id);
  }
}