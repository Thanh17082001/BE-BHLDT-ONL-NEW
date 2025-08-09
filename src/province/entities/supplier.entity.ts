import { Exclude } from "class-transformer";
import { AbstractEntity } from "src/common/entities/base.entity";
import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";
@Entity()
export class Province extends AbstractEntity {
    @Column()
    @Index({ unique: true })
    name: string;
    @Column()
    code: number;
}
