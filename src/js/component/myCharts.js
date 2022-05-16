const labels = [
    'SI',
    'NR',
    'RA',
    'NVR',
    'NVP',
];

const data = {
    labels: labels,
    datasets: [{
        label: 'My First dataset',
        backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(77, 83, 96)',
            'rgb(70, 191, 189)'
        ],
        data: [87.23, 26.80, 86.00, 66.38, 42.90],
        hoverOffset: 4
    }]
};

const config = {
    type: 'pie',
    data: data,
    options: {
        plugins: {
            legend: {
                display: false
            }
        }
    }
};

const mychart = new Chart(
    document.getElementById('myChart'),
    config
);