import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { Grade } from "src/grade/entities/grade.entity";
import { SchoolYear } from "src/school-year/entities/school-year.entity";
import { School } from "src/schools/entities/school.entity";
import { Student } from "src/student/entities/student.entity";
import { Subject } from "src/subjects/entities/subject.entity";

import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToMany, OneToOne } from "typeorm";

@Entity()
export class Class extends BaseWithCreatedBy {
    @Column()
    name: string;
    @Column()
    suffixes: string;
    @ManyToOne(() => Grade, (grade) => grade, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn()
    grade?: Grade;
    @ManyToOne(() => SchoolYear, (schoolYear) => schoolYear)
    @JoinColumn()
    schoolYear: SchoolYear
    @ManyToOne(() => School, (school) => school.classes, { onDelete: 'CASCADE' })
    school: School;

    @OneToMany(() => Student, (student) => student.class)
    students: Student[];
   
}
