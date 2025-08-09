import { AbstractEntity } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class TypeScore extends AbstractEntity {
    @Column({ unique: true })
    name: string;
    @Column("decimal", { precision: 5, scale: 2 })
    coefficient: number
    @Column({nullable: true})
    order: number
}
