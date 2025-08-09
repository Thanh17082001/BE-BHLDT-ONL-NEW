import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import configuration from 'src/config/configuration';
import { ExamplesModule } from './examples/examples.module';
import { UsersModule } from './users/users.module';
import { SchoolsModule } from './schools/schools.module';
import { GradeModule } from './grade/grade.module';
import { SubjectsModule } from './subjects/subjects.module';
import { AuthModule } from './auth/auth.module';
import { RoleModule } from './role/role.module';
import { AuthGuard } from './auth/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { TopicsModule } from './topics/topics.module';
import { SchoolYearModule } from './school-year/school-year.module';
import { ClassModule } from './class/class.module';
import { FileTypeModule } from './file-type/file-type.module';
import { PartModule } from './part/part.module';
import { TypeVoiceModule } from './type-voice/type-voice.module';
import { TypeScoreModule } from './type-score/type-score.module';
import { FileModule } from './file/file.module';
import { ImageModule } from './image/image.module';
import { JwtModule } from '@nestjs/jwt';
import { DoaminsModule } from './doamins/doamins.module';
import { StaticFilesMiddleware } from './common/middlewares/static-files.middleware';
import { StudentModule } from './student/student.module';
import { ProvinceModule } from './province/province.module';
import { DistrictModule } from './district/district.module';
import { WardModule } from './ward/ward.module';
import { ScoreModule } from './score/score.module';
import { LevelModule } from './level/level.module';
import { TypeQuestionModule } from './type-question/type-question.module';
import { AnswerModule } from './answer/answer.module';
import { QuestionModule } from './question/question.module';
import { ExamModule } from './exam/exam.module';
import { VoiceModule } from './voice/voice.module';
import { LessonPlanModule } from './lesson-plan/lesson-plan.module';
import { GameQuestionModule } from './game-question/game-question.module';
import { GameModule } from './game/game.module';
import { ElearningModule } from './elearning/elearning.module';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: 'thienthanh132',
      signOptions: { expiresIn: '60m' },
    }),
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const dbConfig = configService.get('database');
        try {
          const connection = {
            type: configService.get('DB_TYPE') || dbConfig.type,
            host: configService.get('DB_HOST') || dbConfig.host,
            port: configService.get('DB_PORT') || dbConfig.port,
            username: configService.get('DB_USER') || dbConfig.username,
            password: configService.get('DB_PASS') || dbConfig.password,
            database: configService.get('DB_NAME') || dbConfig.database,
            synchronize: true,
            autoLoadEntities: true,
          };
          return connection;
        } catch (error) {
          console.log(error);
        }
      },
    }),
    ExamplesModule,
    UsersModule,
    SchoolsModule,
    GradeModule,
    SubjectsModule,
    AuthModule,
    RoleModule,
    TopicsModule,
    SchoolYearModule,
    ClassModule,
    FileTypeModule,
    PartModule,
    TypeVoiceModule,
    TypeScoreModule,
    FileModule,
    ImageModule,
    DoaminsModule,
    StudentModule,
    ProvinceModule,
    DistrictModule,
    WardModule,
    ScoreModule,
    LevelModule,
    TypeQuestionModule,
    AnswerModule,
    QuestionModule,
    ExamModule,
    VoiceModule,
    LessonPlanModule,
    GameQuestionModule,
    GameModule,
    ElearningModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD, // Đăng ký AuthGuard cho tất cả các route
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
