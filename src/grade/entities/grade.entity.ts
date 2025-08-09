import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { AbstractEntity } from "src/common/entities/base.entity";
import { School, SchoolType } from "src/schools/entities/school.entity";
import { Subject } from "src/subjects/entities/subject.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, Index, JoinColumn, ManyToMany, ManyToOne, OneToMany } from "typeorm";

@Entity()
export class Grade extends BaseWithCreatedBy {
    @Column()
    name: string; // VD: "Khối 10", "Khối 11"

    // @OneToMany(() => Class, (cls) => cls.grade)
    // classes: Class[];

    // Một khối có thể có nhiều user
    @ManyToMany(() => User, (user) => user.grades)
    users: User[];

    @ManyToOne(() => School, (school) => school.grades, { onDelete: 'SET NULL' })
    school: School;

    //   @Column({ type: 'enum', enum: SchoolType, nullable: true })
    // schoolType: string;

    // Một khối có nhiều môn học
    @OneToMany(() => Subject, (subject) => subject.grade)
    subjects: Subject[];


}
