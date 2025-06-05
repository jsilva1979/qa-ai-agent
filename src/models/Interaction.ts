import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Interaction {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    userQuery: string;

    @Column('text')
    aiResponse: string;

    @Column('text', { nullable: true })
    context: string;

    @Column('text', { nullable: true })
    metadata: string;

    @CreateDateColumn()
    createdAt: Date;
} 