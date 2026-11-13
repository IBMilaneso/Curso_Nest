import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity.js';

@Entity({ name: 'clientes' })
export class Cliente {
  @PrimaryGeneratedColumn({ name: 'id_cliente', type: 'int' })
  id: number;

  @Column({ name: 'nombre', type: 'varchar', length: 150 })
  nombre: string;

  @Column({ name: 'telefono', type: 'varchar', length: 20 })
  telefono: string;

  @Column({ name: 'correo', type: 'varchar', length: 100, unique: true })
  correo: string;

  @Column({ name: 'rfc', type: 'varchar', length: 13, unique: true, nullable: true })
  rfc: string | null;

  @Column({ name: 'direccion', type: 'varchar', length: 255, nullable: true })
  direccion: string | null;

  @Column({ name: 'activo', type: 'bit', default: true })
  activo: boolean;

  @CreateDateColumn({ name: 'fecha_registro', type: 'datetime2' })
  fechaRegistro: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'datetime2' })
  fechaActualizacion: Date;

  @OneToMany(() => Vehiculo, (vehiculo) => vehiculo.cliente)
  vehiculos: Vehiculo[];
}