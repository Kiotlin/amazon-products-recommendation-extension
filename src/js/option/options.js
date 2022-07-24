math.config({
  number: "Fraction",
});

// the dom elements of all the <select>
let t12 = document.querySelector("#cosineChoice2");
let t13 = document.querySelector("#cosineChoice3");
let t14 = document.querySelector("#cosineChoice4");
let t15 = document.querySelector("#cosineChoice5");
let t23 = document.querySelector("#reviewChoice3");
let t24 = document.querySelector("#reviewChoice4");
let t25 = document.querySelector("#reviewChoice5");
let t34 = document.querySelector("#ratingChoice4");
let t35 = document.querySelector("#ratingChoice5");
let t45 = document.querySelector("#videoChoice5");

let save = document.getElementById("save");
let harmonicMean = [];
let weights = [];
const RI = 1.12;

function restoreOption() {
  chrome.storage.sync.get(
    [
      'configured',
      'cMatrix',
    ],
    function (items) {
      if (items.configured) {
        t12.value = items.cMatrix.t12;
        t13.value = items.cMatrix.t13;
        t14.value = items.cMatrix.t14;
        t15.value = items.cMatrix.t15;
        t23.value = items.cMatrix.t23;
        t24.value = items.cMatrix.t24;
        t25.value = items.cMatrix.t25;
        t34.value = items.cMatrix.t34;
        t35.value = items.cMatrix.t35;
        t45.value = items.cMatrix.t45;
      }
    }
  );
}

function ahpCalc() {
  // the value of the selected options
  let n12 = math.number(math.fraction(t12.options[t12.selectedIndex].text));
  let n13 = math.number(math.fraction(t13.options[t13.selectedIndex].text));
  let n14 = math.number(math.fraction(t14.options[t14.selectedIndex].text));
  let n15 = math.number(math.fraction(t15.options[t15.selectedIndex].text));
  let n23 = math.number(math.fraction(t23.options[t23.selectedIndex].text));
  let n24 = math.number(math.fraction(t24.options[t24.selectedIndex].text));
  let n25 = math.number(math.fraction(t25.options[t25.selectedIndex].text));
  let n34 = math.number(math.fraction(t34.options[t34.selectedIndex].text));
  let n35 = math.number(math.fraction(t35.options[t35.selectedIndex].text));
  let n45 = math.number(math.fraction(t45.options[t45.selectedIndex].text));

  let prMatrix = [
    [1, n12, n13, n14, n15],
    [1 / n12, 1, n23, n24, n25],
    [1 / n13, 1 / n23, 1, n34, n35],
    [1 / n14, 1 / n24, 1 / n34, 1, n45],
    [1 / n15, 1 / n25, 1 / n35, 1 / n45, 1],
  ];

  let sum = [];
  for (let i = 0; i < 5; i++) {
    let count = 0;
    for (let j = 0; j < 5; j++) {
      count += prMatrix[j][i];
    }
    sum.push(count);
  }
  console.log(sum);

  let normalizedMatrix = [
    [1, n12, n13, n14, n15],
    [1 / n12, 1, n23, n24, n25],
    [1 / n13, 1 / n23, 1, n34, n35],
    [1 / n14, 1 / n24, 1 / n34, 1, n45],
    [1 / n15, 1 / n25, 1 / n35, 1 / n45, 1],
  ];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      normalizedMatrix[i][j] /= sum[j];
    }
  }
  console.log(normalizedMatrix);

  for (let i = 0; i < 5; i++) {
    let count = 0;
    for (let j = 0; j < 5; j++) {
      count += normalizedMatrix[i][j];
    }
    weights.push(count / 5);
  }

  let evaluation = ahpEval(prMatrix, weights);
  let CR = evaluation.ci / RI;

  // create a complete table of the comparison matrix
  let table = createTable(prMatrix, weights);

  // create a table for showing weight of each criterion.
  let wTable = createWeightTable(weights);

  // explanations for ahp reliability
  let comparison_info = CR < 0.1 ? " < 0.1" : " >= 0.1";
  let info = "λ = " + evaluation.lambda + "<br>" + 
          "CI = " + evaluation.ci + "<br>" + 
          "CR = " + CR + comparison_info;

  let status = document.getElementById("status");
  let delimiter = document.createElement('hr');
  let reliability = document.createElement("p");
  reliability.setAttribute("class", "blue");
  reliability.setAttribute("style", "font-size: 1rem");
  reliability.innerHTML = info;

  let info_of_table = document.createElement("h3");
  info_of_table.setAttribute("class", "blue");
  info_of_table.innerHTML = "一対比較行列";

  let info_of_wTable = document.createElement("h3");
  info_of_wTable.setAttribute("class", "blue");
  info_of_wTable.innerHTML = "重要度の計算結果";

  let info_of_reliability = document.createElement("h3");
  info_of_reliability.setAttribute("class", "blue");
  info_of_reliability.innerHTML = "整合性チェック";

  status.appendChild(delimiter);
  status.appendChild(info_of_table);
  status.appendChild(table);
  status.appendChild(info_of_wTable);
  status.appendChild(wTable);
  status.appendChild(info_of_reliability);
  status.appendChild(reliability);

  chrome.storage.sync.set({
    configured: true,
    cMatrix: {
        t12: t12.options[t12.selectedIndex].value,
        t13: t13.options[t13.selectedIndex].value,
        t14: t14.options[t14.selectedIndex].value,
        t15: t15.options[t15.selectedIndex].value,
        t23: t23.options[t23.selectedIndex].value,
        t24: t24.options[t24.selectedIndex].value,
        t25: t25.options[t25.selectedIndex].value,
        t34: t34.options[t34.selectedIndex].value,
        t35: t35.options[t35.selectedIndex].value,
        t45: t45.options[t45.selectedIndex].value,
    },
    userAHP: {
        si: weights[0],
        ra: weights[1],
        nr: weights[2],
        nvr: weights[3],
        nvp: weights[4],
      },
  }, function(items) { console.log('configuration saved!'); });
}

function createWeightTable(w) {
  let table = document.createElement('table');
  table.setAttribute('id', 'weights');
  table.setAttribute('border', '1');
  table.setAttribute('class', 'blue w-5');

  let tbody = document.createElement('tbody');
  let criteria = ['類似度', 'レビュー', 'レーティング', '動画レビュー', '再生数'];
  criteria.forEach((v, i) => {
    let tr = document.createElement('tr');
    let th_1 = document.createElement('th');
    th_1.innerHTML = v;
    let th_2 = document.createElement('th');
    th_2.innerHTML = w[i];
    tr.appendChild(th_1);
    tr.appendChild(th_2);

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

function ahpEval(matrix, weights) {
  let result = [];
  let lambda = 0;
  let ci = 0;
  let n = weights.length;
  for (let i = 0; i < matrix.length; i++) {
    let count = 0;
    for (let j = 0; j < matrix.length; j++) {
      count += matrix[i][j] * weights[j];
    }
    result.push(count);
  }
  let count = 0;
  for (let i = 0; i < weights.length; i++) {
    count += result[i] / weights[i];
  }
  lambda = count / weights.length;
  ci = (lambda - n) / (n - 1);

  return {
    lambda: lambda,
    ci: ci,
  };
}

function createTable(data, weights) {
  let valu = [
    "因子",
    "類似度",
    "レビュー",
    "レーティング",
    "動画レビュー数",
    "再生数",
  ];
  let table = document.createElement("table");
  table.setAttribute("id", "calculation");
  table.setAttribute("border", "1");
  table.setAttribute("class", "blue");
  table.setAttribute("style", "width: 500px");

  let thead = document.createElement("thead");
  let thtr = document.createElement("tr");
  for (let i = 0; i < 6; i++) {
    let th = document.createElement("th");
    th.innerHTML = valu[i];
    thtr.appendChild(th);
  }
  thead.appendChild(thtr);
  table.appendChild(thead);

  let tbody = document.createElement("tbody");
  for (let i = 0; i < 5; i++) {
    let tr = document.createElement("tr");
    let tth = document.createElement("th");
    tth.innerHTML = valu[i + 1];
    tr.appendChild(tth);
    for (let j = 0; j < 5; j++) {
      let th = document.createElement("th");
      if (Number.isInteger(data[i][j])) {
        th.innerHTML = data[i][j];
      } else {
        th.innerHTML = math.format(math.fraction(data[i][j]));
      }
      tr.appendChild(th);
    }

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  return table;
}

save.addEventListener("click", ahpCalc);
document.addEventListener("DOMContentLoaded", restoreOption);
