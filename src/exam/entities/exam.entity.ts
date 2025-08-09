import { BaseWithCreatedBy } from 'src/common/entities/base-user-createdBy';
import { Question } from 'src/question/entities/question.entity';
import { School } from 'src/schools/entities/school.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
} from 'typeorm';

@Entity()
export class Exam extends BaseWithCreatedBy {
  @Column()
  name: string;
  @ManyToOne(() => Subject, { nullable: true })
  @JoinColumn({ name: 'subjectId' })
  subject: Subject;
  @Column()
  time: number;
  @Column()
  subExam: number;
  @Column()
  totalMultipleChoiceScore: number;
  @Column({ nullable: true })
  totalMultipleChoiceScorePartI: number;
  @Column({ nullable: true })
  totalMultipleChoiceScorePartII: number;
  @Column({ nullable: true })
  totalMultipleChoiceScorePartIII: number;
  @Column()
  totalEssayScore: number;
  @ManyToMany(() => Question)
  @JoinTable()
  questions: Question[];

  @ManyToOne(() => School, { nullable: true })
  @JoinColumn({ name: 'schoolId' })
  school?: School = null;
}
