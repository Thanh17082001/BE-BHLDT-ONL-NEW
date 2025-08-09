import { Class } from "src/class/entities/class.entity";
import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { AbstractEntity } from "src/common/entities/base.entity";
import { Grade } from "src/grade/entities/grade.entity";
import { Subject } from "src/subjects/entities/subject.entity";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from "typeorm";
export enum SchoolType {
    'Tiểu học' = 'Tiểu học', // Tiểu học
    'THCS' = 'THCS', // Trung học cơ sở
    'THPT' = 'THPT', // Trung học phổ thông
    'TH&THCS' = 'TH&THCS', // Tiểu học & Trung học cơ sở
    'THCS&THPT' = 'THCS&THPT', // Trung học cơ sở & Trung học phổ thông
}
@Entity()
export class School extends AbstractEntity  {
    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ nullable: true, default: null })
    code?: string
    @Column({ nullable: true, default: null })
    address?: string;
    @Column({ nullable: true, default: null })
    description?: string;
    @Column({ nullable: true })
    manageBy?: string
    @Column({ type: 'enum', enum: SchoolType, nullable: true })
    schoolType: string;

    @OneToMany(() => User, (user) => user.school)
    users: User[];

    @OneToMany(() => Subject, (subject) => subject.school)
    subjects: Subject[];

    @OneToMany(() => Grade, (cls) => cls.school)
    grades: Grade[];

    @OneToMany(() => Class, (cls) => cls.school)
    classes: Class[];

    @Column({nullable:true, default:false})
    isAdmin?:boolean


    @ManyToOne(() => User, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn({ name: 'created_by' }) // Tạo cột `created_by` trong DB
    createdBy?: User;

}
