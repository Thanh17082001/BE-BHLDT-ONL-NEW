import { Class } from 'src/class/entities/class.entity';
import { BaseWithCreatedBy } from 'src/common/entities/base-user-createdBy';
import { SchoolYear } from 'src/school-year/entities/school-year.entity';
import { School } from 'src/schools/entities/school.entity';
import { Student } from 'src/student/entities/student.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { TypeScore } from 'src/type-score/entities/type-score.entity';
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';

@Entity()
export class Score extends BaseWithCreatedBy {
    @Column()
    name: string;

    @Column("decimal", { precision: 5, scale: 2 })
    score: number;

    @Column("decimal", { precision: 5, scale: 2 })
    coefficient: number;

    // Quan hệ với Student (Nhiều điểm thuộc về 1 học sinh)
    @ManyToOne(() => Student, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'studentId' })
    student: Student;

    // Quan hệ với SchoolYear (Nhiều điểm thuộc về 1 năm học)
    @ManyToOne(() => SchoolYear, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'schoolYearId' })
    schoolYear: SchoolYear;

    // Quan hệ với Subject (Nhiều điểm thuộc về 1 môn học)
    @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'subjectId' })
    subject: Subject;

    // Quan hệ với Class (Nhiều điểm thuộc về 1 lớp học)
    @ManyToOne(() => Class, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'classId' })
    class: Class;

    // Quan hệ với TypeScore (Nhiều điểm thuộc về 1 loại điểm, có thể null)
    @ManyToOne(() => TypeScore, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'typeScoreId' })
    typeScore: TypeScore;

     @ManyToOne(() => School, { nullable: false })
    @JoinColumn({ name: "schoolId" })
    school: School;
}
