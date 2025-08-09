import { AbstractEntity } from "src/common/entities/base.entity";
import { Column, Entity, Index } from "typeorm";

@Entity()
export class Example extends AbstractEntity {
    @Column({ type: 'varchar', length: 255 })
    name: string;
}
