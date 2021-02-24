var save = document.getElementById('save');
var prTableBody = document.getElementById('tbody');
var prMatrix = [
    [1, 0, 0, 0, 0],
    [0, 1, 0, 0, 0],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 1, 0],
    [0, 0, 0, 0, 1],
]
var RI = 1.12;
var harmonicMean = [];
var omomi = [];

save.addEventListener('click', function() {
    let status = document.getElementById('status');
    let info = 'saved';
    let p = document.createElement('p');

    p.innerHTML = info;
    p.setAttribute('class', 'blue');
    p.setAttribute('style', 'font-size: 1rem');

    let prList = [];
    let inputNodes = document.querySelectorAll('#tbody input');
    for (let i=0; i< inputNodes.length; i++) {
        if (inputNodes[i].checked) {
            prList.push(inputNodes[i].value);
        }
    }
    createMatrix(prList)
    for (let i=0; i<5; i++) {
        let count = 0;
        let mean = 0;
        for (let j=0; j<5; j++) {
            count += 1 / prMatrix[i][j];
            mean = 5 / count;
        }
        harmonicMean.push(mean);
    }

    let meanCount = 0;
    for (let i=0; i<5; i++) {
        meanCount += harmonicMean[i];
    }

    for(let i=0; i<5; i++) {
        omomi.push(harmonicMean[i]/meanCount);
    }

    let table = createTable(prMatrix, harmonicMean, omomi);

    let evaluation = evaluata(prMatrix, omomi);
    console.log(evaluation);
    let CR = evaluation[1] / RI;
    console.log(CR);

    info = 'ウェイトｗ = [' + omomi + '],  λ = ' + evaluation[0] + ', CI = ' + evaluation[1] + ', CR = ' + CR + ' < 0.1';
    p.innerHTML = info;

    status.appendChild(table);
    status.appendChild(p);
});

function evaluata(matrix, omomi) {
    let result = [];
    let ramudar = 0;
    let ci = 0;
    let n = omomi.length;
    for (let i=0; i<matrix.length; i++) {
        let count = 0;
        for (let j=0; j<matrix.length; j++) {
            count += matrix[i][j] * omomi[j];
        }
        result.push(count);
    }
    let count = 0;
    for (let i=0; i<omomi.length; i++) {
        count += result[i] / omomi[i];
    }
    ramudar = count / omomi.length;
    ci = (ramudar - n) / (n - 1 );

    return [ramudar, ci];
}

function createMatrix(prList) {
    for (let v=0; v<prList.length; v++) {
        for (let i=0; i<prList.length; i++) {
            switch((prList[v]-prList[i])) {
                case -2:
                    prMatrix[v][i] = 1/3;
                    break;
                case -4:
                    prMatrix[v][i] = 1/5;
                    break;
                case -6:
                    prMatrix[v][i] = 1/7;
                    break;
                case -8:
                    prMatrix[v][i] = 1/9;
                    break;
                case 8:
                    prMatrix[v][i] = 9;
                    break;
                case 6:
                    prMatrix[v][i] = 7;
                    break;
                case 4:
                    prMatrix[v][i] = 5;
                    break;
                case 2:
                    prMatrix[v][i] = 3;
                    break;
                case 0:
                    prMatrix[v][i] = 1;
                    break;
            }
        }
    }
}

function createTable(data, harmonicMean, omomi) {
    let valu = ['因子', '類似度', 'レビュー', 'レーティング', '動画レビュー数', '再生数', '調和平均', '重み'];
    let table = document.createElement('table');
    table.setAttribute('id', 'calculation');
    table.setAttribute('border', '1');
    table.setAttribute('class', 'blue');
    table.setAttribute('style', 'width: 500px');

    let thead = document.createElement('thead');
    let thtr = document.createElement('tr');
    for (let i=0; i<8; i++) {
        let th = document.createElement('th');
        th.innerHTML = valu[i];
        thtr.appendChild(th);
    }
    thead.appendChild(thtr);
    table.appendChild(thead);

    let tbody = document.createElement('tbody');
    for (let i=0; i<5; i++) {
        let tr = document.createElement('tr');
        let tth = document.createElement('th');
        tth.innerHTML = valu[i+1];
        tr.appendChild(tth);
        for (let j=0; j<5; j++) {
            let th = document.createElement('th');
            th.innerHTML = data[i][j];
            tr.appendChild(th);
        }

        let harTh = document.createElement('th');
        harTh.innerHTML = harmonicMean[i];
        tr.appendChild(harTh);

        let omomiTh = document.createElement('th');
        omomiTh.innerHTML = omomi[i];
        tr.appendChild(omomiTh);

        tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    return table;
}