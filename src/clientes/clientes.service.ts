import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Cliente } from './entities/cliente.entity.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';
import { ClienteResponseDto } from './dto/cliente-response.dto.js';
import { ClienteNoEncontradoException } from './exceptions/cliente-no-encontrado.exception.js';
import { ClienteDuplicadoException } from './exceptions/cliente-duplicado.exception.js';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepository: Repository<Cliente>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<ClienteResponseDto> {
    const existeCorreo = await this.clienteRepository.findOne({ where: { correo: createClienteDto.correo } });
    if (existeCorreo) {
      throw new ClienteDuplicadoException('correo');
    }

    if (createClienteDto.rfc) {
      const existeRfc = await this.clienteRepository.findOne({ where: { rfc: createClienteDto.rfc } });
      if (existeRfc) {
        throw new ClienteDuplicadoException('RFC');
      }
    }

    const nuevoCliente = this.clienteRepository.create(createClienteDto);
    const clienteGuardado = await this.clienteRepository.save(nuevoCliente);

    return plainToInstance(ClienteResponseDto, clienteGuardado);
  }

  async findAll(): Promise<ClienteResponseDto[]> {
    const clientes = await this.clienteRepository.find({
      where: { activo: true },
      order: { nombre: 'ASC' },
    });

    return plainToInstance(ClienteResponseDto, clientes);
  }

  async findOne(id: number): Promise<ClienteResponseDto> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new ClienteNoEncontradoException(id);
    }

    return plainToInstance(ClienteResponseDto, cliente);
  }

  async update(id: number, updateClienteDto: UpdateClienteDto): Promise<ClienteResponseDto> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new ClienteNoEncontradoException(id);
    }

    if (updateClienteDto.correo) {
      const existeCorreo = await this.clienteRepository.findOne({ where: { correo: updateClienteDto.correo, id: Not(id) } });
      if (existeCorreo) {
        throw new ClienteDuplicadoException('correo');
      }
    }

    if (updateClienteDto.rfc) {
      const existeRfc = await this.clienteRepository.findOne({ where: { rfc: updateClienteDto.rfc, id: Not(id) } });
      if (existeRfc) {
        throw new ClienteDuplicadoException('RFC');
      }
    }

    const clienteActualizado = this.clienteRepository.merge(cliente, updateClienteDto);
    const resultado = await this.clienteRepository.save(clienteActualizado);

    return plainToInstance(ClienteResponseDto, resultado);
  }

  async remove(id: number): Promise<void> {
    const cliente = await this.clienteRepository.findOne({ where: { id } });
    if (!cliente) {
      throw new ClienteNoEncontradoException(id);
    }

    cliente.activo = false;
    await this.clienteRepository.save(cliente);
  }
}