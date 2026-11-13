import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ClientesService } from './clientes.service.js';
import { CreateClienteDto } from './dto/create-cliente.dto.js';
import { UpdateClienteDto } from './dto/update-cliente.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolUsuario } from '../common/enums/rol-usuario.enum.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@Controller('clientes')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.RECEPCION)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClienteDto: CreateClienteDto) {
    const data = await this.clientesService.create(createClienteDto);
    return { data, message: 'Creado' };
  }

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.RECEPCION, RolUsuario.MECANICO)
  async findAll() {
    const data = await this.clientesService.findAll();
    return { data, message: 'Obtenido' };
  }

  @Get(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.RECEPCION, RolUsuario.MECANICO)
  async findOne(@Param('id', ParseIdPipe) id: number) {
    const data = await this.clientesService.findOne(id);
    return { data, message: 'Obtenido' };
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.RECEPCION)
  async update(@Param('id', ParseIdPipe) id: number, @Body() updateClienteDto: UpdateClienteDto) {
    const data = await this.clientesService.update(id, updateClienteDto);
    return { data, message: 'Actualizado' };
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIdPipe) id: number) {
    await this.clientesService.remove(id);
    return { data: null, message: 'Eliminado' };
  }
}