const labels = [
    'SI',
    'NR',
    'RA',
    'NVR',
    'NVP',
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
        data: [87.23, 26.80, 86.00, 66.38, 42.90],
        hoverOffset: 4
    }]
};

let data2 = {
    labels: labels,
    datasets: [{
        backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(77, 83, 96)',
            'rgb(70, 191, 189)'
        ],
        data: [75.65, 38.42, 81.23, 64.58, 37.29],
        hoverOffset: 4
    }]
};

let data3 = {
    labels: labels,
    datasets: [{
        backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(77, 83, 96)',
            'rgb(70, 191, 189)'
        ],
        data: [23.00, 66.75, 54.10, 42.76, 53.20],
        hoverOffset: 4
    }]
};

let data4 = {
    labels: labels,
    datasets: [{
        backgroundColor: [
            'rgb(255, 99, 132)',
            'rgb(54, 162, 235)',
            'rgb(255, 205, 86)',
            'rgb(77, 83, 96)',
            'rgb(70, 191, 189)'
        ],
        data: [14.32, 75.36, 84.00, 39.92, 63.11],
        hoverOffset: 4
    }]
};

let config = {
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

let config2 = {
    type: 'pie',
    data: data2,
    options: {
        plugins: {
            legend: {
                display: false
            }
        }
    }
};

let config3 = {
    type: 'pie',
    data: data3,
    options: {
        plugins: {
            legend: {
                display: false
            }
        }
    }
};

let config4 = {
    type: 'pie',
    data: data4,
    options: {
        plugins: {
            legend: {
                display: false
            }
        }
    }
};

let myChart = new Chart(
    document.getElementById('myChart'),
    config,
);

let myChart2 = new Chart(
    document.getElementById('myChart-2'),
    config2,
);

let myChart3 = new Chart(
    document.getElementById('myChart-3'),
    config3,
);

let myChart4 = new Chart(
    document.getElementById('myChart-4'),
    config4,
);

let datas = [data, data2, data3, data4];