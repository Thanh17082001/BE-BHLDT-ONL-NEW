import { AbstractEntity } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";



@Entity()
export class TypeVoice extends AbstractEntity {
    @Column()
    name: string
}
