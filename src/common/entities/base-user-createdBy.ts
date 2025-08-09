import { Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { AbstractEntity } from './base.entity';



export abstract class BaseWithCreatedBy extends AbstractEntity {
    @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL'})
    @JoinColumn({ name: 'created_by' })
    createdBy?: User = null;

    @Column({ default: false }) // Dữ liệu chung mặc định là true
    isPublic: boolean;
}