import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { MessageImage } from './message-image.entity';

@Entity('chat_messages')
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  message: string;

  @Column()
  @Index()
  senderId: string;

  @Column()
  @Index()
  receiverId: string;

  @Column('uuid')
  @Index()
  conversationId: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  hasImages: boolean;

  /*  @OneToMany(() => MessageImage, (message) => message.message, {
    cascade: true,
  })
  images: MessageImage[]; */

  @CreateDateColumn({
    type: 'timestamptz',
  })
  created_at: Date;
}
