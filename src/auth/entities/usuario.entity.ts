import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { RolUsuario } from '../../common/enums/rol-usuario.enum.js';

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn({ name: 'id_usuario', type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  correo: string;

  @Column({ type: 'varchar', length: 255 })
  passwordHash: string;

  @Column({ type: 'varchar', length: 50, default: RolUsuario.RECEPCION })
  rol: RolUsuario;

  @Column({ type: 'bit', default: true })
  activo: boolean;
}