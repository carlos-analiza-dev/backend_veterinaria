import { User } from 'src/auth/entities/auth.entity';
import { NotificationType } from 'src/interfaces/nptificaciones.type';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('notificaciones_admins')
export class NotificacionesAdmin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column('text')
  title: string;

  @Column('text')
  message: string;

  @Column({ default: false })
  read: boolean;

  @ManyToOne(() => User, { eager: false, onDelete: 'CASCADE' })
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
