
import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { School } from "src/schools/entities/school.entity";
import { Subject } from "src/subjects/entities/subject.entity";
import { Topic } from "src/topics/entities/topic.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from "typeorm";

@Entity()
export class LessonPlan extends BaseWithCreatedBy {
    @Column()
    name: string
    @Column()
    path: string;

    @Column({ nullable: true })
    previewImage: string;


    @Column({ nullable: true })
    topic: number;

    @ManyToOne(() => School, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'schoolId' })
    school: School;

    @ManyToOne(() => Subject, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'subjectId' })
    subject: Subject;
    
    @Column({ nullable: true })
    fileType: number

}

