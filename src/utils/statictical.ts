import { ValidateNested } from 'class-validator';
export function calculateStatistics(data) {
    // const ranges = {
    //     'under3.5': { count: 0, percentage: 0 },
    //     '3.5to4.99': { count: 0, percentage: 0 },
    //     '5to6.49': { count: 0, percentage: 0 },
    //     '6.5to7.99': { count: 0, percentage: 0 },
    //     '8andAbove': { count: 0, percentage: 0 }
    // };
    type rage = {
        label: string,
        values: {
            count: number,
            percentage: number
        }
    }

    const ranges: rage[] = [
        {
            label: 'Điểm dưới 3.5',
            values: {
                count: 0,
                percentage: 0
            }
        },
        {
            label: 'Điểm từ 3.5 đến 4.99',
            values: {
                count: 0,
                percentage: 0
            }
        },
        {
            label: 'Điểm từ 5 đến 6.49',
            values: {
                count: 0,
                percentage: 0
            }
        },
        {
            label: 'Điểm từ 6.5 đến 7.99',
            values: {
                count: 0,
                percentage: 0
            }
        },
        {
            label: 'Điểm trên 8',
            values: {
                count: 0,
                percentage: 0
            }
        }
    ];

    // Tính tổng số học sinh
    const totalCount = data.length;

    // Đếm số lượng học sinh trong từng khoảng điểm
    data.forEach((item, index) => {
        const avg = item.avgEntire ?? item.avg;
        if (avg < 3.5) {
            ranges[0].values.count++;
        } else if (avg >= 3.5 && avg < 5) {
            ranges[1].values.count++;
        } else if (avg >= 5 && avg < 6.5) {
            ranges[2].values.count++;
        } else if (avg >= 6.5 && avg < 8) {
            ranges[3].values.count++;
        } else if (avg >= 8) {
            ranges[4].values.count++;
        }
    });

    // Tính tỷ lệ phần trăm
    // for (const range in ranges) {
    //     ranges[range].percentage = (+(ranges[range].count / totalCount * 100).toFixed(2));
    // }

    ranges.forEach((item, index) => {
        ranges[index].values.percentage = (+(ranges[index].values.count / totalCount * 100).toFixed(2));
    
    })

    return ranges;
}