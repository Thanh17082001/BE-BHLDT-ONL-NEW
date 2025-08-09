import { BaseWithCreatedBy } from "src/common/entities/base-user-createdBy";
import { GameQuestion } from "src/game-question/entities/game-question.entity";
import { School } from "src/schools/entities/school.entity";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";
@Entity()
export class Game extends BaseWithCreatedBy {

    @Column()
    name: string;

    @ManyToMany(() => GameQuestion, (gameQuestion) => gameQuestion.games, {
        cascade: true,   // Thêm cascade để tự động quản lý quan hệ
        onDelete: 'CASCADE',  // Xóa quan hệ khi xóa Game
    })
    @JoinTable()
    questions: GameQuestion[];

     @ManyToOne(() => School, { nullable: true })
            @JoinColumn({ name: "schoolId" })
            school?: School = null;

}
