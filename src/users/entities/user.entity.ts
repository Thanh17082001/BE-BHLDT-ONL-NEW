
import { BaseUserEntity } from "src/common/entities/base-user.entity";
import { Grade } from "src/grade/entities/grade.entity";
import { Role } from "src/role/role.enum";
import { School } from "src/schools/entities/school.entity";
import { Subject } from "src/subjects/entities/subject.entity";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
@Entity()
export class User extends BaseUserEntity {
    @Column()
    fullname: string;
    @Column()
    username: string;
    @Column()
    password: string;
    @Column({ default: '' })
    email?: string;
    @Column({ default: '' })
    phone?: string;
    @Column({ default: 'Giáo viên', enum:Role })
    role?: string;
    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    createdBy?: User

    @ManyToOne(() => School, (school) => school.users, { onDelete: 'SET NULL' })
    school?: School;

    // Mỗi user có thể thuộc nhiều khối
    @ManyToMany(() => Grade, (grade) => grade.users)
    @JoinTable()
    grades: Grade[];

    // Mỗi user có thể thuộc nhiều môn học
    @ManyToMany(() => Subject, (subject) => subject.users)
    @JoinTable()
    subjects: Subject[];

    @Column({ default: false })
    isAdmin:boolean; // true: admin, false: user
}
