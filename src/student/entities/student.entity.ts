import { Class } from "src/class/entities/class.entity";
import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { AbstractEntity } from "src/common/entities/base.entity";
import { District } from "src/district/entities/district.entity";
import { Province } from "src/province/entities/supplier.entity";
import { School } from "src/schools/entities/school.entity";
import { Ward } from "src/ward/entities/ward.entity";
import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";

@Entity()
export class Student extends BaseWithCreatedBy {
    @ManyToOne(() => Class, (classEntity) => classEntity.students, { nullable: true })
    @JoinColumn({ name: "classId" })
    class?: Class | null;

    @ManyToOne(() => School, { nullable: false })
    @JoinColumn({ name: "schoolId" })
    school: School;
    

    @Column({ nullable: true, default: false })
    isChange: boolean

    @Column({ nullable: true })
    code?: string=null;
    @Column({ nullable: true })
    email?: string = null;
    @Column({default:null, nullable:true})
    fullname: string;
    @Column({default:null, nullable:true})
    gender: string;
    @Column({default:null, nullable:true})
    phone: string;
    @Column({default:null, nullable:true})
    street: string;
    @Column({default:null, nullable:true})
    birthday: Date;

    
    @ManyToOne(() => Ward, { nullable: true })
    @JoinColumn({ name: "ward_id" })
    ward: Ward;

    @ManyToOne(() => District, { nullable: true })
    @JoinColumn({ name: "district_id" })
    district: District;

    @ManyToOne(() => Province, { nullable: true })
    @JoinColumn({ name: "province_id" })
    province: Province;
   
   
}
