import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Usuario } from './entities/usuario.entity.js';
import { LoginDto } from './dto/login.dto.js';
// import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<{ accessToken: string }> {
    const usuario = await this.usuarioRepository.findOne({
      where: { correo: loginDto.correo, activo: true },
    });

    if (!usuario) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // const isMatch = await bcrypt.compare(loginDto.password, usuario.passwordHash);
    const isMatch = loginDto.password === usuario.passwordHash;
    
    if (!isMatch) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { sub: usuario.id, correo: usuario.correo, rol: usuario.rol };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}