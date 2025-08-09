import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { School } from "src/schools/entities/school.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity()

export class SchoolYear extends BaseWithCreatedBy {
    @Column()
    name: string
    @Column()
    startYear: number
    @Column()
    endYear: number

    @ManyToOne(() => School, (school) => school.id, { onDelete: 'SET NULL' })
         @JoinColumn({ name: 'school_id' })
        school: School;
    
}

