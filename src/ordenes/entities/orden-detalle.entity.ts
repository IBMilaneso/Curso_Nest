import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, type Relation } from 'typeorm';
import { Orden } from './orden.entity.js';

@Entity({ name: 'ordenes_detalles' })
export class OrdenDetalle {
  @PrimaryGeneratedColumn({ name: 'id_detalle', type: 'int' })
  id: number;

  @Column({ name: 'id_orden', type: 'int' })
  ordenId: number;

  @ManyToOne(() => Orden, (orden) => orden.detalles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_orden' })
  orden: Relation<Orden>;

  @Column({ type: 'varchar', length: 255 })
  descripcion: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  costo: number;
}