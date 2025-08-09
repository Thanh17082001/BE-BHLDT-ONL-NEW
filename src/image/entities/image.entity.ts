import { AbstractEntity } from "src/common/entities/base.entity";
import { File } from "src/file/entities/file.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";

@Entity()
export class Image extends AbstractEntity {
    @Column()
    name: string;
    @Column()
    path: string;
    @ManyToOne(() => File, (file) => file.images, { onDelete: 'CASCADE' })
    file: File;
}
