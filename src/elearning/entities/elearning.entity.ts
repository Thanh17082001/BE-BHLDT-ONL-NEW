import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { School } from "src/schools/entities/school.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
@Entity()
export class Elearning extends BaseWithCreatedBy {
    @Column()
    content: string;
    @Column()
    title: string;

    @ManyToOne(() => School, { nullable: true })
    @JoinColumn({ name: "schoolId" })
    school?: School = null;

}
