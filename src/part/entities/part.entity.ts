import { AbstractEntity } from "src/common/entities/base.entity";
import { Column, Entity } from "typeorm";

@Entity()
export class Part extends AbstractEntity {
    @Column()
    name: string;

    @Column()
    order: number;
}
