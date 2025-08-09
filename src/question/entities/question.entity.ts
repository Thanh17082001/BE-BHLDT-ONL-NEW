

import { Answer } from "src/answer/entities/answer.entity";
import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { Level } from "src/level/entities/level.entity";
import { Part } from "src/part/entities/part.entity";
import { School } from "src/schools/entities/school.entity";
import { Subject } from "src/subjects/entities/subject.entity";
import { Topic } from "src/topics/entities/topic.entity";
import { TypeQuestion } from "src/type-question/entities/type-question.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Question extends BaseWithCreatedBy {
    @Column()
    content: string;
    @ManyToOne(() =>Subject, { nullable: true })
    @JoinColumn({ name: "subjectId" })
    subject: Subject;
    @ManyToOne(() =>Part, { nullable: true })
    @JoinColumn({ name: "partId" })
    part: Part;
    @ManyToOne(() => Topic, { nullable: true })
    @JoinColumn({ name: "topicId" })
    topic: Topic;
    @ManyToOne(() => TypeQuestion, { nullable: true })
    @JoinColumn({ name: "typeQuestionId" })
    typeQuestion: TypeQuestion;
   
    @ManyToOne(() =>Level, { nullable: true })
    @JoinColumn({ name: "levelId" })
    level: Level;
    @Column("decimal", { precision: 5, scale: 2 })
    score: number;

    @Column({ nullable: true })
    numberOfAnswers: number;

    @OneToMany(() => Answer, answer => answer.question, { cascade: true, onDelete: 'CASCADE' })
    answers: Answer[];

    @ManyToOne(() => School, { nullable: true })
        @JoinColumn({ name: "schoolId" })
        school?: School = null;
}
