import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { Game } from "src/game/entities/game.entity";
import { School } from "src/schools/entities/school.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne } from "typeorm";

@Entity()
export class GameQuestion extends BaseWithCreatedBy {
    @Column()
    suggest: string;
    @Column()
    answer: string;
    @ManyToMany(() => Game, (game) => game.questions, {
        onDelete: 'CASCADE',  // Xóa quan hệ khi gameQuestion bị xóa
    })
    games: Game[];

     @ManyToOne(() => School, { nullable: true })
        @JoinColumn({ name: "schoolId" })
        school?: School = null;
}

