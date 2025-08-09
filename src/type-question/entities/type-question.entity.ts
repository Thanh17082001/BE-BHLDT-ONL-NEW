
import { AbstractEntity } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";



@Entity()
export class TypeQuestion extends AbstractEntity {
    @Column()
    name: string
    @Column()
    order: number
}
