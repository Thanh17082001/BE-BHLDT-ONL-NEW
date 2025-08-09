import { AbstractEntity } from "src/common/entities/base.entity";
import { TypeQuestion } from "src/type-question/entities/type-question.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";



@Entity()
export class Level extends AbstractEntity {
    @Column()
    name: string
    @Column()
    order: number
    @ManyToOne(() => TypeQuestion, { nullable: true })
    @JoinColumn({ name: "typeQuestionId" })
    typeQuestion?: TypeQuestion = null
}
