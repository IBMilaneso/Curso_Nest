import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany, type Relation } from 'typeorm';
import { Vehiculo } from '../../vehiculos/entities/vehiculo.entity.js';
import { OrdenDetalle } from './orden-detalle.entity.js';
import { EstatusOrden } from '../../common/enums/estatus-orden.enum.js';

@Entity({ name: 'ordenes' })
export class Orden {
  @PrimaryGeneratedColumn({ name: 'id_orden', type: 'int' })
  id: number;

  @Column({ name: 'id_vehiculo', type: 'int' })
  vehiculoId: number;

  @ManyToOne(() => Vehiculo, (vehiculo) => vehiculo.ordenes, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'id_vehiculo' })
  vehiculo: Relation<Vehiculo>;

  @Column({ type: 'varchar', length: 30, default: EstatusOrden.PENDIENTE })
  estatus: EstatusOrden;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  total: number;

  @CreateDateColumn({ name: 'fecha_ingreso', type: 'datetime2' })
  fechaIngreso: Date;

  @UpdateDateColumn({ name: 'fecha_actualizacion', type: 'datetime2' })
  fechaActualizacion: Date;

  @OneToMany(() => OrdenDetalle, (detalle) => detalle.orden, { cascade: true })
  detalles: OrdenDetalle[];
}