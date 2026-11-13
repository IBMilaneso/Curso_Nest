import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Vehiculo } from './entities/vehiculo.entity.js';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto.js';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto.js';
import { VehiculoResponseDto } from './dto/vehiculo-response.dto.js';
import { VehiculoNoEncontradoException } from './exceptions/vehiculo-no-encontrado.exception.js';
import { VehiculoDuplicadoException } from './exceptions/vehiculo-duplicado.exception.js';
import { ClientesService } from '../clientes/clientes.service.js';

@Injectable()
export class VehiculosService {
  constructor(
    @InjectRepository(Vehiculo)
    private readonly vehiculoRepository: Repository<Vehiculo>,
    private readonly clientesService: ClientesService,
  ) {}

  async create(createVehiculoDto: CreateVehiculoDto): Promise<VehiculoResponseDto> {
    await this.clientesService.findOne(createVehiculoDto.clienteId);

    const existePlaca = await this.vehiculoRepository.findOne({ where: { placa: createVehiculoDto.placa } });
    if (existePlaca) {
      throw new VehiculoDuplicadoException(createVehiculoDto.placa);
    }

    const nuevoVehiculo = this.vehiculoRepository.create(createVehiculoDto);
    const vehiculoGuardado = await this.vehiculoRepository.save(nuevoVehiculo);

    return plainToInstance(VehiculoResponseDto, vehiculoGuardado);
  }

  async findAll(): Promise<VehiculoResponseDto[]> {
    const vehiculos = await this.vehiculoRepository.find({ relations: { cliente: true } });
    return plainToInstance(VehiculoResponseDto, vehiculos);
  }

  async findOne(id: number): Promise<VehiculoResponseDto> {
    const vehiculo = await this.vehiculoRepository.findOne({ where: { id }, relations: { cliente: true } });
    if (!vehiculo) {
      throw new VehiculoNoEncontradoException(id);
    }
    return plainToInstance(VehiculoResponseDto, vehiculo);
  }

  async update(id: number, updateVehiculoDto: UpdateVehiculoDto): Promise<VehiculoResponseDto> {
    const vehiculo = await this.vehiculoRepository.findOne({ where: { id } });
    if (!vehiculo) {
      throw new VehiculoNoEncontradoException(id);
    }

    if (updateVehiculoDto.clienteId) {
      await this.clientesService.findOne(updateVehiculoDto.clienteId);
    }

    if (updateVehiculoDto.placa) {
      const existePlaca = await this.vehiculoRepository.findOne({ where: { placa: updateVehiculoDto.placa, id: Not(id) } });
      if (existePlaca) {
        throw new VehiculoDuplicadoException(updateVehiculoDto.placa);
      }
    }

    const vehiculoActualizado = this.vehiculoRepository.merge(vehiculo, updateVehiculoDto);
    const resultado = await this.vehiculoRepository.save(vehiculoActualizado);

    return plainToInstance(VehiculoResponseDto, resultado);
  }

  async remove(id: number): Promise<void> {
    const vehiculo = await this.vehiculoRepository.findOne({ where: { id } });
    if (!vehiculo) {
      throw new VehiculoNoEncontradoException(id);
    }
    await this.vehiculoRepository.remove(vehiculo);
  }
}