import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, type Relation } from 'typeorm';
import { Cliente } from '../../clientes/entities/cliente.entity.js';
import { Orden } from '../../ordenes/entities/orden.entity.js';

@Entity({ name: 'vehiculos' })
export class Vehiculo {
  @PrimaryGeneratedColumn({ name: 'id_vehiculo', type: 'int' })
  id: number;

  @Column({ name: 'placa', type: 'varchar', length: 20, unique: true })
  placa: string;

  @Column({ name: 'marca', type: 'varchar', length: 50 })
  marca: string;

  @Column({ name: 'modelo', type: 'varchar', length: 50 })
  modelo: string;

  @Column({ name: 'anio', type: 'int' })
  anio: number;

  @Column({ name: 'color', type: 'varchar', length: 30, nullable: true })
  color: string | null;

  @Column({ name: 'id_cliente', type: 'int' })
  clienteId: number;

  @ManyToOne(() => Cliente, (cliente) => cliente.vehiculos, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_cliente' })
  cliente: Relation<Cliente>;

  @OneToMany(() => Orden, (orden) => orden.vehiculo)
  ordenes: Orden[];

  @CreateDateColumn({ name: 'fecha_registro', type: 'datetime2' })
  fechaRegistro: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'datetime2' })
  fechaActualizacion: Date;
}