const labels = [
    '類似度',
    'レビュー数',
    'レーティング',
    '動画レビュー数',
    '動画再生数',
];

let data = {
    labels: labels,
    datasets: [{
        backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(77, 83, 96)',
            'rgb(70, 191, 189)'
        ],
        data: [20, 20, 20, 20, 20],
        hoverOffset: 4
    }]
};

let config = {
    type: 'pie',
    data: data,
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: 'right',
            },
            title: {
                display: true,
                text: 'ウエイトの分布',
                position: 'right',
            }
        }
    }
};

let optionChart;