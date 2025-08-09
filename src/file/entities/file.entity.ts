import { Entity, Column, ManyToOne, JoinColumn, OneToMany } from "typeorm";
import { FileType } from "src/file-type/entities/file-type.entity";
import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { School } from "src/schools/entities/school.entity";
import { Topic } from "src/topics/entities/topic.entity";
import { Image } from "src/image/entities/image.entity";
import { Subject } from "src/subjects/entities/subject.entity";

@Entity()
export class File extends BaseWithCreatedBy {
    @Column()
    name: string;

    @Column({ nullable: true })
    path: string;

    @Column({ nullable: true })
    previewImage: string;

    @ManyToOne(() => FileType, { nullable: true })
    @JoinColumn({ name: "filetype_id" })
    fileType?: FileType;

    @ManyToOne(() => Topic, { nullable: true })
    @JoinColumn({ name: "topic_id" })
    topic?: Topic | null;

    @ManyToOne(() => Subject, { nullable: true })
    @JoinColumn({ name: "subject_id" })
    subject?: Subject | null;

    @ManyToOne(() => School, { nullable: true })
    @JoinColumn({ name: "schoolId" })
    school?: School = null;

    @Column({ default: true })
    isFolder: boolean;

    @ManyToOne(() => File, (file) => file.id, { nullable: true })
    @JoinColumn({ name: "parent_id" })
    parent?: File | null;

    @OneToMany(() => File, (file) => file.parent, { cascade: true, onDelete: 'CASCADE' })
    children: File[];

    @OneToMany(() => Image, (image) => image.file, { cascade: true, onDelete: 'CASCADE' })
    images: Image[]
}
