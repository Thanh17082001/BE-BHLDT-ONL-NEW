import { Score } from 'src/score/entities/score.entity';
export const scoreAverage = (scores): number => {
    if (scores) {
        const totalScore = scores?.reduce((total, score) => {
            return total + (+score.score * +score.coefficient);
        }, 0);


        const totalCoefficient = scores.reduce((total, score) => {
            return total + +score.coefficient;
        }, 0);

        // Tính điểm trung bình
        const averageScore = totalCoefficient > 0
            ? parseFloat((totalScore / totalCoefficient).toFixed(3))
            : 0.00;
        return averageScore;
    } else {
        return 0
    }
    
}

export const scoreAverageStatistical = (scores: any[]): number => {
    const totalScore = scores.reduce((total, score) => {
        return total + (+score.avg * +score.typeSCoreCoefficient);
    }, 0);

    const totalCoefficient = scores.reduce((total, score) => {
        return total + +score.typeSCoreCoefficient;
    }, 0);

    // Tính điểm trung bình
    const averageScore = totalCoefficient > 0
        ? parseFloat((totalScore / totalCoefficient).toFixed(2))
        : 0.00;
    return averageScore;
}
