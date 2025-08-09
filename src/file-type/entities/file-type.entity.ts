import { AbstractEntity } from "src/common/entities/base.entity";
import { Entity, Column, PrimaryGeneratedColumn, Index } from "typeorm";
@Entity()
export class FileType extends AbstractEntity {
    @Column()
    @Index({ unique: true })
    name: string;
}

