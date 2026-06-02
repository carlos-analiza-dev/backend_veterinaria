import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

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

  @Column()
  @Index()
  conversationId: string;

  @Column({ default: false })
  isRead: boolean;

  @Column({ default: false })
  hasImages: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
  })
  created_at: Date;
}
