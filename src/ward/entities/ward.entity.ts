import { Exclude } from "class-transformer";
import { AbstractEntity } from "src/common/entities/base.entity";
import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";
@Entity()
export class Ward extends AbstractEntity {
    @Column()
    @Index()
    name: string;
    @Column()
    code: number;
    @Column()
    district: number;
}
