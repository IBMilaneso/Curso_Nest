import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { VehiculosService } from './vehiculos.service.js';
import { CreateVehiculoDto } from './dto/create-vehiculo.dto.js';
import { UpdateVehiculoDto } from './dto/update-vehiculo.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolUsuario } from '../common/enums/rol-usuario.enum.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@Controller('vehiculos')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class VehiculosController {
  constructor(private readonly vehiculosService: VehiculosService) {}

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.RECEPCION)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createVehiculoDto: CreateVehiculoDto) {
    const data = await this.vehiculosService.create(createVehiculoDto);
    return { data, message: 'Vehículo registrado exitosamente' };
  }

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.RECEPCION, RolUsuario.MECANICO)
  async findAll() {
    const data = await this.vehiculosService.findAll();
    return { data, message: 'Vehículos obtenidos' };
  }

  @Get(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.RECEPCION, RolUsuario.MECANICO)
  async findOne(@Param('id', ParseIdPipe) id: number) {
    const data = await this.vehiculosService.findOne(id);
    return { data, message: 'Vehículo obtenido' };
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.RECEPCION)
  async update(@Param('id', ParseIdPipe) id: number, @Body() updateVehiculoDto: UpdateVehiculoDto) {
    const data = await this.vehiculosService.update(id, updateVehiculoDto);
    return { data, message: 'Vehículo actualizado' };
  }

  @Delete(':id')
  @Roles(RolUsuario.ADMINISTRADOR)
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIdPipe) id: number) {
    await this.vehiculosService.remove(id);
    return { data: null, message: 'Vehículo eliminado' };
  }
}