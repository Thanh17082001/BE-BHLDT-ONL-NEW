import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { School } from "src/schools/entities/school.entity";
import { Subject } from "src/subjects/entities/subject.entity";
import { Column, Entity, ManyToOne, JoinColumn } from "typeorm";

@Entity()
export class Topic extends BaseWithCreatedBy {
    @Column()
    name: string; 

    @ManyToOne(() => Subject, (subject) => subject.topics, { onDelete: "CASCADE" })
    @JoinColumn()
    subject: Subject;

    @ManyToOne(() => School, (school) => school.id, { onDelete: 'SET NULL' })
    @JoinColumn()
    school: School;
}
