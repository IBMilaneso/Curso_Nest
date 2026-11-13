import { Controller, Get, Post, Body, Patch, Param, HttpCode, HttpStatus, UseGuards } from '@nestjs/common';
import { OrdenesService } from './ordenes.service.js';
import { CreateOrdenDto } from './dto/create-orden.dto.js';
import { UpdateOrdenDto } from './dto/update-orden.dto.js';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js';
import { RolesGuard } from '../common/guards/roles.guard.js';
import { Roles } from '../common/decorators/roles.decorator.js';
import { RolUsuario } from '../common/enums/rol-usuario.enum.js';
import { ParseIdPipe } from '../common/pipes/parse-id.pipe.js';

@Controller('ordenes')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class OrdenesController {
  constructor(private readonly ordenesService: OrdenesService) {}

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.RECEPCION)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createOrdenDto: CreateOrdenDto) {
    const data = await this.ordenesService.create(createOrdenDto);
    return { data, message: 'Orden generada' };
  }

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.RECEPCION, RolUsuario.MECANICO)
  async findAll() {
    const data = await this.ordenesService.findAll();
    return { data, message: 'Órdenes obtenidas' };
  }

  @Get(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.RECEPCION, RolUsuario.MECANICO)
  async findOne(@Param('id', ParseIdPipe) id: number) {
    const data = await this.ordenesService.findOne(id);
    return { data, message: 'Orden obtenida' };
  }

  @Patch(':id/estatus')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.MECANICO)
  async updateEstatus(@Param('id', ParseIdPipe) id: number, @Body() updateOrdenDto: UpdateOrdenDto) {
    const data = await this.ordenesService.update(id, updateOrdenDto);
    return { data, message: 'Estatus actualizado' };
  }
}