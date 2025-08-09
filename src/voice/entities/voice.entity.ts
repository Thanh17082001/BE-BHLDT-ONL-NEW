
import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { File } from "src/file/entities/file.entity";
import { School } from "src/schools/entities/school.entity";
import { TypeVoice } from "src/type-voice/entities/type-voice.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity()
export class Voice extends BaseWithCreatedBy {
    @Column({ nullable: true })
    name: string;

    @ManyToOne(() => File, { nullable: true })
    @JoinColumn({ name: "fileId" })
    file?: File = null

    @ManyToOne(() => TypeVoice, { nullable: true })
    @JoinColumn({ name: "typevoiceId" })
    typeVoice?: TypeVoice = null

    @Column()
    link: string
    @Column()
    order: number
    @Column()
    isGeneral: boolean;
    @ManyToOne(() => School, { nullable: true })
    @JoinColumn({ name: "schoolId" })
    school?: School = null;

}

