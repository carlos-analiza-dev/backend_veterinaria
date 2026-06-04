import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Message } from './message.entity';

@Entity('chat_message_images')
export class MessageImage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @Column()
  key: string;

  @Column()
  mimeType: string;

  @ManyToOne(() => Message, (message) => message.images)
  @JoinColumn({ name: 'messageId' })
  message: Message;

  @Column()
  messageId: string;

  @CreateDateColumn()
  created_at: Date;
}
