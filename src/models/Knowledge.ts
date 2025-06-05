import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Interaction } from './Interaction';

@Entity()
export class Knowledge {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text')
    title: string;

    @Column('text')
    content: string;

    @Column('text', { array: true, default: [] })
    tags: string[];

    @Column('text', { nullable: true })
    category: string;

    @Column('float', { default: 0 })
    confidence: number;

    @Column('text', { nullable: true })
    source: string;

    @ManyToOne(() => Interaction, { nullable: true })
    @JoinColumn()
    relatedInteraction: Interaction;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 