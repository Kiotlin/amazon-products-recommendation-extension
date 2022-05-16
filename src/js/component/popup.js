let refresh = document.getElementById('refresh');
let urlInput = document.getElementById('basic-url');

let imgZero = document.getElementById('img-0');
let imgOne = document.getElementById('img-1');
let imgTwo = document.getElementById('img-2');
let imgThree = document.getElementById('img-3');
let imgFour = document.getElementById('img-4');

let titleZero = document.getElementById('title-0');
let titleOne = document.getElementById('title-1');
let titleTwo = document.getElementById('title-2');
let titleThree = document.getElementById('title-3');
let titleFour = document.getElementById('title-4');

let infoZero = document.getElementById('info-0');
let infoOne = document.getElementById('info-1');
let infoTwo = document.getElementById('info-2');
let infoThree = document.getElementById('info-3');
let infoFour = document.getElementById('info-4');

let collaOne = document.getElementById('collapseExample-1');
let collaTwo = document.getElementById('collapseExample-2');
let collaThree = document.getElementById('collapseExample-3');
let collaFour = document.getElementById('collapseExample-4');

let collaYtbOne = document.getElementById('collapseYtb-1');
let collaYtbTwo = document.getElementById('collapseYtb-2');
let collaYtbThree = document.getElementById('collapseYtb-3');
let collaYtbFour = document.getElementById('collapseYtb-4');

let modalGroup1 = {
    viewMore: document.getElementById('more-1'),
    modalLabel: document.getElementById('ModalLabel1'),
    modalBody: document.getElementById('modalBody1'),
};
let modalGroup2 = {
    viewMore: document.getElementById('more-2'),
    modalLabel: document.getElementById('ModalLabel2'),
    modalBody: document.getElementById('modalBody2'),
};
let modalGroup3 = {
    viewMore: document.getElementById('more-3'),
    modalLabel: document.getElementById('ModalLabel3'),
    modalBody: document.getElementById('modalBody3'),
};
let modalGroup4 = {
    viewMore: document.getElementById('more-4'),
    modalLabel: document.getElementById('ModalLabel4'),
    modalBody: document.getElementById('modalBody4'),
};

let swap1 = document.getElementById('swap-1');
let swap2 = document.getElementById('swap-2');
let swap3 = document.getElementById('swap-3');
let swap4 = document.getElementById('swap-4');

// Authorization key
let axesso_api_key = '4246e3be-56fa-45a2-95cb-2006a39cfeba';
let x_rapidapi_key_tiktok = 'c3a7f7f8a9msh520a129aada3ac0p115dbfjsn6cc0487c3120';

// amazon api - request product information
let amazonUrl = 'https://www.amazon.com';
let baseUrl = 'http://api-prd.axesso.de/amz/';
let productDetailsUrl = baseUrl + 'amazon-lookup-product';
// amazon api - search products by keywords
let productSearchUrl = baseUrl + 'amazon-search-by-keyword-asin';
// amazon api - request review information
let productReviewsUrl = baseUrl + 'amazon-lookup-reviews';
// Otto api - search products by keyword
let ottoProductSearchUrl = 'http://api-prd2.axesso.de/ott/otto-search-by-keyword';
// Rapid api - tiktok search
let tiktokVideoSearchUrl = 'https://tiktok-video-no-watermark2.p.rapidapi.com/feed/search';

// product details
let urlInputStr;
let asinID;
let category;
let keyword;
// the info of product that is inputted 
let basedProductInfo;
let basedProductVector = [1, 1];
// searched products result based on the product that was inputted
let relatedProductList;
let recVec;
// default vector dimension
let defaultVector = 1;

// Default AHP Vector
let userAHP = {
    si: 0.2602,
    ra: 0.5028,
    nr: 0.0348,
    nvr: 0.1343,
    nvp: 0.0678
};

// install searching history 
let searchHistory = [];
let dpMenu = document.getElementById('dpMenu');
let dpBtn = document.getElementById('dropdownBtn');
// dpBtn.onclick = function() {
//     if (searchHistory.length == 0) return;
//     let elm = dpMenu.children;
//     for (let i = 0; i <= elm.length; i++) {
//         elm[i].onfocus = historyClick(searchHistory[i]);
//     }
// };
// urlInput.addEventListener('focus', function() {
//     console.log(searchHistory);
//     if (searchHistory.length == 0) return;
//     else {
//         dpMenu.setAttribute('class', 'dropdown-menu show dpHistory');
//     }
// });

// dpMenu.addEventListener('blur', function() {
//     dpMenu.setAttribute('class', 'dropdown-menu');
// });

// install product's info after inputted
urlInput.addEventListener('change', async function () {
    urlInputStr = urlInput.value;
    console.log(urlInputStr);

    // get ASIN ID & its details
    // asinID = urlInputStr.split('/')[splitIndex];
    // console.log('ASINID: ' + asinID);
    await getProductDetails(urlInputStr)
        .then(data => basedProductInfo = data)
        .catch(err => console.log(err));
    console.log(basedProductInfo);

    let data = [];
    data.push(
        basedProductInfo.productTitle,
        basedProductInfo.price,
        basedProductInfo.productRating,
        basedProductInfo.imageUrlList,
        basedProductInfo.countReview
    );

    setCoverCard(imgZero, titleZero, infoZero, data);
});

// generate new recommendation products
let domainCode = 'com';
let sortBy = 'relevanceblender';
let page = 5;
refresh.addEventListener('click', async function () {
    // save searching history
    let history = {
        thumb: basedProductInfo.imageUrlList,
        title: basedProductInfo.productTitle,
        price: basedProductInfo.price,
        asin: basedProductInfo.asin,
    };
    searchHistory.push(history);
    appendHistory(history);
    console.log(searchHistory);

    // reset videoInfo array
    if (videoInfos.length == 4) { videoInfos = []; }

    // search related products
    let categoryAndKeyword = getProductCatagoryAndKeyword(basedProductInfo);
    let categoryString = categoryAndKeyword.category;
    let keywordString = '';
    for (let i = 0; i < categoryAndKeyword.keywords.length; i++) {
        keywordString += categoryAndKeyword.keywords[i] + ' ';
    }
    console.log(categoryString);
    console.log(keywordString);
    await getRelatedProductList(categoryString, domainCode, keywordString, sortBy, page)
        .then(data => relatedProductList = data)
        .catch(err => console.log(err));
    console.log(relatedProductList);

    /**
     * get data vector
     * @param data: ['title', 'price', 'rating', 'img', 'url', 'reviewCount', 'asin']
     */
    let dataContainer = [];
    let productList = relatedProductList.searchProductDetails;
    let highestPrice = 0;
    let lowestPrice = Number.MAX_SAFE_INTEGER;
    for (let product in productList) {
        let data = [];
        const ytbGetter = new YtbInfoGenerator();
        let current_price = productList[product].price;
        if (current_price === 0) continue;
        if (current_price >= highestPrice) {
            highestPrice = current_price;
        }
        if (current_price <= lowestPrice) {
            lowestPrice = current_price;
        }
        let productRating;
        if (!productList[product].productRating) {
            const randomRating = (Math.random() * 4 + 1).toFixed(1);
            let ratingSentence = randomRating + ' out of 5 stars';
            productRating = ratingSentence;
        } else {
            productRating = productList[product].productRating;
        }
        data.push(productList[product].productDescription);
        data.push(productList[product].price);
        data.push(productRating);
        data.push(productList[product].imgUrl);
        data.push(productList[product].dpUrl);
        data.push(productList[product].countReview);
        data.push(productList[product].asin);
        data.push(ytbGetter.commentVolume);
        data.push(ytbGetter.playVolume);
        dataContainer.push(data);
    }
    console.log(dataContainer);

    let vectorContainer = getProductEigenVector(dataContainer, highestPrice, lowestPrice);
    console.log(vectorContainer);
    let relatedProductVector = [];
    for (let vec in vectorContainer) {
        let rVector = cosineSimilarity(basedProductVector, vectorContainer[vec]);
        relatedProductVector.push(rVector);
    }

    /**
     * Sort out eigen object for calculating each product comprehensive score
     */
    let finalEigenObject = [];
    for (let index in dataContainer) {
        console.log(dataContainer[index][2]);
        let eigenObject = {
            si: relatedProductVector[index],
            ra: parseFloat(dataContainer[index][2].trim().split(' ')[0]),
            nr: dataContainer[index][5],
            nvr: dataContainer[index][7],
            nvp: dataContainer[index][8]
        }
        finalEigenObject.push(eigenObject);
    }
    console.log('finalEigenObject: ', finalEigenObject);

    
    let recommendedVector = [];
    for (let index in finalEigenObject) {
        const cCalculator = new CompreCaculator(userAHP, finalEigenObject[index]);
        let cPoint = cCalculator.cPoint;
        let box = [cPoint, index];
        recommendedVector.push(box);
    }
    recommendedVector = recommendedVector.sort(compare(0)).slice(0, 4);

    // recommendedVector = theBiggestFourIndex(relatedProductVector);
    recVec = recommendedVector;
    console.log(recommendedVector);

    // get info from youtube
    ytbGetKeyword(dataContainer, recommendedVector);
    for (let kw in keywordForYtb) {
        await ytbSearch(keywordForYtb[kw]);
    }

    // css bar
    let barGroup1 = ['progress-75', 'progress-13', 'progress-6', 'progress-2', 'progress-3'];
    let percentageGroup1 = [75, 13, 6, 2, 3];
    let barGroup2 = ['progress-60', 'progress-12', 'progress-23', 'progress-1', 'progress-3'];
    let percentageGroup2 = [60, 12, 23, 1, 3];
    let barGroup3 = ['progress-75', 'progress-13', 'progress-6', 'progress-2', 'progress-3'];
    let percentageGroup3 = [75, 13, 6, 2, 3];
    let barGroup4 = ['progress-75', 'progress-13', 'progress-6', 'progress-2', 'progress-3'];
    let percentageGroup4 = [75, 13, 6, 2, 3];

    // collapse array
    collaOneYtbOne = [collaOne, collaYtbOne];
    collaTwoYtbTwo = [collaTwo, collaYtbTwo];
    collaThreeYtbThree = [collaThree, collaYtbThree];
    collaFourYtbFour = [collaFour, collaYtbFour];

    // generate new product card UI
    setRecommendedCard(imgOne, titleOne, infoOne, collaOneYtbOne, dataContainer, recommendedVector, 0, videoInfos[0], barGroup1, percentageGroup1);
    setRecommendedCard(imgTwo, titleTwo, infoTwo, collaTwoYtbTwo, dataContainer, recommendedVector, 1, videoInfos[1], barGroup2, percentageGroup2);
    setRecommendedCard(imgThree, titleThree, infoThree, collaThreeYtbThree, dataContainer, recommendedVector, 2, videoInfos[2], barGroup3, percentageGroup3);
    setRecommendedCard(imgFour, titleFour, infoFour, collaFourYtbFour, dataContainer, recommendedVector, 3, videoInfos[3], barGroup4, percentageGroup4);

    // Extract keywords for each result
    let resultKeywordList = [];
    for (let data in dataContainer) {
        console.log(dataContainer[data][0]);
        resultKeywordList.push(keywordExtract(dataContainer[data][0]));
    }

    // search detail information for each result on Amazon
    let amazonDetailList = [];
    let amazonUrl = 'https://www.amazon.com/dp/';

    await getProductDetails(amazonUrl + dataContainer[recommendedVector[0][1]][6])
        .then(data => amazonDetailList.push(data))
        .catch(err => console.log(err));

    await getProductDetails(amazonUrl + dataContainer[recommendedVector[1][1]][6])
        .then(data => amazonDetailList.push(data))
        .catch(err => console.log(err));

    await getProductDetails(amazonUrl + dataContainer[recommendedVector[2][1]][6])
        .then(data => amazonDetailList.push(data))
        .catch(err => console.log(err));

    await getProductDetails(amazonUrl + dataContainer[recommendedVector[3][1]][6])
        .then(data => amazonDetailList.push(data))
        .catch(err => console.log(err));

    console.log(amazonDetailList);

    // search detail information for each result on Otto
    let ottoRelatedProductList = [];

    // await getOttoRelatedProductList(resultKeywordList[0], 1)
    // .then(data => ottoRelatedProductList.push(data.searchProductDetails))
    // .catch(err => console.log(err));

    // await getOttoRelatedProductList(resultKeywordList[1], 1)
    // .then(data => ottoRelatedProductList.push(data.searchProductDetails))
    // .catch(err => console.log(err));

    // await getOttoRelatedProductList(resultKeywordList[2], 1)
    // .then(data => ottoRelatedProductList.push(data.searchProductDetails))
    // .catch(err => console.log(err));

    // await getOttoRelatedProductList(resultKeywordList[3], 1)
    // .then(data => ottoRelatedProductList.push(data.searchProductDetails))
    // .catch(err => console.log(err));
    // console.log(ottoRelatedProductList);

    // search detail information for each results on Tiktok
    let tiktokRelatedVideoList = [];

    await getTiktokRelatedVideo(resultKeywordList[0], 5)
        .then(data => tiktokRelatedVideoList.push(data.data.videos))
        .catch(err => console.log(err));

    await getTiktokRelatedVideo(resultKeywordList[1], 5)
        .then(data => tiktokRelatedVideoList.push(data.data.videos))
        .catch(err => console.log(err));

    await getTiktokRelatedVideo(resultKeywordList[2], 5)
        .then(data => tiktokRelatedVideoList.push(data.data.videos))
        .catch(err => console.log(err));

    await getTiktokRelatedVideo(resultKeywordList[3], 5)
        .then(data => tiktokRelatedVideoList.push(data.data.videos))
        .catch(err => console.log(err));
    console.log(tiktokRelatedVideoList);

    setAmazonModalDetails(modalGroup1, amazonDetailList, 0);
    setAmazonModalDetails(modalGroup2, amazonDetailList, 1);
    setAmazonModalDetails(modalGroup3, amazonDetailList, 2);
    setAmazonModalDetails(modalGroup4, amazonDetailList, 3);

    setTiktokModalDetails(modalGroup1, tiktokRelatedVideoList, 0);
    setTiktokModalDetails(modalGroup2, tiktokRelatedVideoList, 1);
    setTiktokModalDetails(modalGroup3, tiktokRelatedVideoList, 2);
    setTiktokModalDetails(modalGroup4, tiktokRelatedVideoList, 3);

    console.log('end.');
});

// swapping base product implement
swap1.addEventListener('click', async function () {
    swapImpl(0);
});
swap2.addEventListener('click', async function () {
    swapImpl(1);
});
swap3.addEventListener('click', async function () {
    swapImpl(2);
});
swap4.addEventListener('click', async function () {
    swapImpl(3);
});

function swapImpl(num) {
    let pList = relatedProductList.searchProductDetails;
    // recVec: ['similarity', 'index']
    let rVector = recVec;
    let asin = pList[rVector[num][1]].asin;
    let url = amazonUrl + '/dp/' + asin;

    urlInput.value = url;
    urlInput.dispatchEvent(new CustomEvent('change'));
}


/**
 * ******************************
 * Functions Area Is From Here  *
 *                              *
 * ******************************
 */

/**
 * 
 * @param {Object} imgSet 
 * @param {Object} titleSet 
 * @param {Object} infoSet 
 * @param {Array} dataGroup 
 * @param {Array} recomVec 
 * @param {Int} num 
 */
function setRecommendedCard(imgSet, titleSet, infoSet, collaSet, dataGroup, recomVec, num, videoinfo, barGroup, pGroup) {
    // infos
    let title = dataGroup[recomVec[num][1]][0];
    let price = dataGroup[recomVec[num][1]][1];
    let rating = dataGroup[recomVec[num][1]][2];
    let img = dataGroup[recomVec[num][1]][3];
    let url = dataGroup[recomVec[num][1]][4];
    let total_reviews = dataGroup[recomVec[num][1]][5];

    imgSet.setAttribute('src', img);

    titleSet.innerHTML = '<a>' + title + '</a>';
    titleSet.firstElementChild.setAttribute('href', url);
    titleSet.firstElementChild.setAttribute('target', '_blank');

    let newA = document.createElement('a');
    let ytbLink = '#collapseYtb-' + (num + 1).toString();
    let ytbBtn = 'ytb' + (num + 1).toString();
    newA.setAttribute('href', ytbLink);
    newA.setAttribute('id', ytbBtn);
    newA.setAttribute('data-toggle', 'collapse');
    newA.setAttribute('style', 'padding-left: 18px;');
    let newImg = document.createElement('img');
    let ytbLogo = './img/youtube.svg';
    newImg.setAttribute('src', ytbLogo);
    newImg.setAttribute('class', 'ytb-logo');
    newA.appendChild(newImg);
    let newSpan = document.createElement('span');
    newSpan.innerHTML = 'Price:  $' + price;

    infoSet.innerHTML = '';
    infoSet.appendChild(newSpan);
    infoSet.appendChild(newA);

    // set collapse info
    let collYtbNum = num + 1;
    setCardCollapse(collaSet[0], title, total_reviews, rating, barGroup, pGroup);
    setYtbCollapse(collaSet[1], videoinfo[0], collYtbNum);
}

function setCoverCard(imgSet, titleSet, infoSet, data) {
    imgSet.setAttribute('src', data[3][0]);
    titleSet.innerHTML = data[0];

    let newSpan1 = document.createElement('span');
    let newSpan2 = document.createElement('span');
    let newSpan3 = document.createElement('span');
    let priceInfo = 'Price:  $' + data[1];
    let ratingInfo = 'Rating:  ' + data[2];
    let totalReviewInfo = 'Review:  ' + data[4];

    newSpan1.innerHTML = priceInfo + '<br>';
    newSpan2.innerHTML = ratingInfo + '<br>';
    newSpan3.innerHTML = totalReviewInfo;

    infoSet.innerHTML = '';
    infoSet.appendChild(newSpan1);
    infoSet.appendChild(newSpan2);
    infoSet.appendChild(newSpan3);
}

function setTiktokModalDetails(modalGroup, tiktokList, num) {
    let infoSavingList = tiktokList[num];
    let extractedList = [];
    for (let i = 0; i < infoSavingList.length; i++) {
        let temp = {
            imgUrl: infoSavingList[i].cover,
            title: infoSavingList[i].title,
            playCount: infoSavingList[i].play_count,
            commentCount: infoSavingList[i].comment_count,
            shareCount: infoSavingList[i].share_count,
            avatar: infoSavingList[i].author.avatar,
            nickname: infoSavingList[i].author.nickname
        };
        extractedList.push(temp);
    }

    for (let i = 0; i < extractedList.length; i++) {
        let card = createTiktokDiv(extractedList[i]);
        modalGroup.modalBody.appendChild(card);
    }
}

/**
 * create html for each tiktok video info
 * @param {*} info = { imgUrl, title, playCount, commentCount, shareCount, avatar, nickname }
 */
function createTiktokDiv(info) {
    let newDivi = document.createElement('div');
    newDivi.setAttribute('class', 'card mb-3');
    newDivi.setAttribute('style', 'max-width: 540px;');

    let newDivii = document.createElement('div');
    newDivii.setAttribute('class', 'row no-gutters');

    let newDivImg = document.createElement('div');
    newDivImg.setAttribute('class', 'col-md-4');
    let newImg = document.createElement('img');
    newImg.setAttribute('src', info.imgUrl);
    newImg.setAttribute('class', 'card-img');

    let newDivCardBodyOuter = document.createElement('div');
    newDivCardBodyOuter.setAttribute('class', 'col-md-8');
    let newDivCardBody = document.createElement('div');
    newDivCardBody.setAttribute('class', 'card-body');
    let newH5Title = document.createElement('h5');
    newH5Title.setAttribute('class', 'card-title');
    newH5Title.innerHTML = info.title;
    let newPCardText = document.createElement('p');
    newPCardText.setAttribute('class', 'card-text');
    let newDivRow = document.createElement('div');
    newDivRow.setAttribute('class', 'row');
    let newDivCol1 = document.createElement('div');
    newDivCol1.setAttribute('class', 'col');
    let newImgInner = document.createElement('img');
    newImgInner.setAttribute('class', 'card-img');
    newImgInner.setAttribute('src', info.avatar);
    let newDivCol2 = document.createElement('div');
    newDivCol2.setAttribute('class', 'col');
    let newPNickname = document.createElement('p');
    newPNickname.innerHTML = info.nickname;
    let newPPopularity = document.createElement('p');
    newPPopularity.setAttribute('class', 'text-muted');
    newPPopularity.innerHTML = info.playCount + ' plays, ' + info.commentCount + ' comments with ' + info.shareCount + ' shares.';

    newDivCol2.appendChild(newPNickname);
    newDivCol2.appendChild(newPPopularity);
    newDivCol1.appendChild(newImgInner);
    newDivRow.appendChild(newDivCol1);
    newDivRow.appendChild(newDivCol2);
    newPCardText.appendChild(newDivRow);
    newDivCardBody.appendChild(newH5Title);
    newDivCardBody.appendChild(newPCardText);
    newDivCardBodyOuter.appendChild(newDivCardBody);

    newDivImg.appendChild(newImg);

    newDivii.appendChild(newDivImg);
    newDivii.appendChild(newDivCardBodyOuter);

    newDivi.appendChild(newDivii);

    return newDivi;
}

function setAmazonModalDetails(modalGroup, amazonList, num) {
    let list = amazonList[num];
    if (Object.keys(list).length == 0) return;
    // information preperation for prezentation
    let imgUrlList = list.imageUrlList;
    let imgUrl = imgUrlList[0];
    let productTitle = list.productTitle;
    let manufacturer = list.manufacturer;
    let countReview = list.countReview;
    let productRating = list.productRating;
    let price = list.price;
    let prodcutFeatures = list.productDetails;
    let reviews = list.reviews;

    let imgNode = modalGroup.modalBody.children[1].children[0];
    imgNode.setAttribute('src', imgUrl);

    let titleNode = modalGroup.modalBody.children[1].children[1].children[0];
    titleNode.innerHTML = productTitle;

    let textNode = modalGroup.modalBody.children[1].children[1].childNodes[1];
    // create node for title
    // let titlePart = createModalDiv('Title: ', productTitle);
    let manufPart = createModalDiv('Manufacturer: ', manufacturer);
    let reviewCountPart = createModalDiv('Review Count: ', countReview);
    let ratingPart = createModalDiv('Rating: ', productRating);
    let pricePart = createModalDiv('Price: ', price);
    let featurePart = createFeatureDiv('Feature: ', prodcutFeatures);
    let reviewPart = createReviewDiv(reviews);
    // append parts
    // textNode.appendChild(titlePart);
    textNode.appendChild(manufPart);
    textNode.appendChild(reviewCountPart);
    textNode.appendChild(ratingPart);
    textNode.appendChild(pricePart);
    textNode.appendChild(featurePart);
    textNode.appendChild(reviewPart);
}

function createModalDiv(title, content) {
    let newDiv = document.createElement('div');
    newDiv.setAttribute('class', 'row');

    let newPTitle = document.createElement('p');
    newPTitle.setAttribute('class', 'font-weight-bold');
    newPTitle.innerHTML = title;

    let newSpanContent = document.createElement('span');
    newSpanContent.setAttribute('class', 'text-center');
    newSpanContent.innerHTML = content;
    newDiv.appendChild(newPTitle);
    newDiv.appendChild(newSpanContent);

    return newDiv;
}

function createFeatureDiv(title, features) {
    let newDiv = document.createElement('div');
    newDiv.setAttribute('class', 'row');

    let newPTitle = document.createElement('p');
    newPTitle.setAttribute('class', 'font-weight-bold');
    newPTitle.innerHTML = title;

    let newPF = document.createElement('p');
    newPF.setAttribute('class', 'text-center');

    let newUl = document.createElement('ul');
    for (let i = 0; i < features.length; i++) {
        let newLi = document.createElement('li');
        newLi.innerHTML = features[i].name + ': ' + features[i].value;
        newUl.appendChild(newLi);
    }

    newPF.appendChild(newUl);
    newDiv.appendChild(newPTitle);
    newDiv.appendChild(newPF);

    return newDiv;
}

function createReviewDiv(reviews) {
    let res;
    if (reviews.length == 0) res = {
        text: 'No review yet.',
        date: 'Unknown',
        rating: '--/--',
        title: 'Unknown Customer',
    };
    else res = reviews[0];

    let newDiv0 = document.createElement('div');
    newDiv0.setAttribute('class', 'row');

    let newDiv = document.createElement('div');
    newDiv.setAttribute('class', 'list-group-item list-group-item-action active');

    let newDivInner = document.createElement('Div');
    newDivInner.setAttribute('class', 'd-flex w-100 justify-content-between');
    let newH5 = document.createElement('h5');
    newH5.setAttribute('class', 'mb-1');
    newH5.innerHTML = res.title;
    let newSmallInner = document.createElement('small');
    newSmallInner.innerHTML = res.rating;
    newDivInner.appendChild(newH5);
    newDivInner.appendChild(newSmallInner);

    let newP = document.createElement('p');
    newP.setAttribute('class', 'mb-1');
    newP.innerHTML = res.text;

    let newSmallOuter = document.createElement('small');
    newSmallOuter.innerHTML = res.date;

    newDiv.appendChild(newDivInner);
    newDiv.appendChild(newP);
    newDiv.appendChild(newSmallOuter);
    newDiv0.appendChild(newDiv);

    return newDiv0;
}

function setCardCollapse(collapseSet, title, review, rating, barNameGroup, percentageGroup) {
    // create title info
    let titleDiv = document.createElement('div');
    titleDiv.setAttribute('class', 'row no-gutters');
    let titleSmall = document.createElement('small');
    titleSmall.setAttribute('class', 'text-muted');
    let titleSpan = document.createElement('span');
    titleSpan.setAttribute('class', 'text-truncate ml-2 text-model');
    titleSpan.innerHTML = title;
    titleSmall.appendChild(titleSpan);
    titleDiv.appendChild(titleSmall);

    // create reviews & rating
    let reviewDiv = document.createElement('div');
    reviewDiv.setAttribute('class', 'row no-gutters');
    let reviewSmall = document.createElement('small');
    reviewSmall.setAttribute('class', 'text-muted');
    let outerSpan = document.createElement('span');
    outerSpan.setAttribute('class', 'text-truncate ml-2 text-model');
    let reviewSpan = document.createElement('span');
    reviewSpan.innerHTML = 'reviews: ' + '<span>' + review + '</span>';
    let ratingSpan = document.createElement('span');
    ratingSpan.setAttribute('class', 'ml-4');
    ratingSpan.innerHTML = 'rating: ' + '<span>' + rating + '</span>';
    outerSpan.appendChild(reviewSpan);
    outerSpan.appendChild(ratingSpan);
    reviewSmall.appendChild(outerSpan);
    reviewDiv.appendChild(reviewSmall);

    // create percentage bar 
    let star5Bar = createPercentageBarElement('5', barNameGroup[0], percentageGroup[0]);
    let star4Bar = createPercentageBarElement('4', barNameGroup[1], percentageGroup[1]);
    let star3Bar = createPercentageBarElement('3', barNameGroup[2], percentageGroup[2]);
    let star2Bar = createPercentageBarElement('2', barNameGroup[3], percentageGroup[3]);
    let star1Bar = createPercentageBarElement('1', barNameGroup[4], percentageGroup[4]);

    let setter = collapseSet.firstElementChild;
    setter.innerHTML = '';
    setter.appendChild(titleDiv);
    setter.appendChild(reviewDiv);
    setter.appendChild(star5Bar);
    setter.appendChild(star4Bar);
    setter.appendChild(star3Bar);
    setter.appendChild(star2Bar);
    setter.appendChild(star1Bar);

}

function setYtbCollapse(collapseSet, videoId, num) {
    let newDiv = document.createElement('div');
    let playerName = 'player' + num.toString();
    newDiv.setAttribute('id', playerName);

    let setter = collapseSet.firstElementChild;
    setter.appendChild(newDiv);

    if (num === 1) {
        player1.loadVideoById(videoId, 5, "large");
    } else if (num === 2) {
        player2.loadVideoById(videoId, 5, "large");
    } else if (num === 3) {
        player3.loadVideoById(videoId, 5, "large");
    } else if (num === 4) {
        player4.loadVideoById(videoId, 5, "large");
    }
}

function createPercentageBarElement(starString, barName, percentage) {
    let newDiv = document.createElement('div');
    newDiv.setAttribute('class', 'row no-gutters');

    // create n-star title
    let newSmall = document.createElement('small');
    newSmall.setAttribute('class', 'text-muted');
    let newSpan1 = document.createElement('span');
    newSpan1.setAttribute('class', 'ml-2 text-model');
    newSpan1.innerHTML = starString + ' star';
    newSmall.appendChild(newSpan1);

    // create percentage bar
    let progressBar = document.createElement('div');
    progressBar.setAttribute('class', 'progress-bar');
    let progress = document.createElement('div');
    progress.setAttribute('class', barName);
    progressBar.appendChild(progress);

    // create percentage text
    let small = document.createElement('small');
    small.setAttribute('class', 'text-muted');
    small.innerHTML = '<span class="ml-2">' + percentage + '% </span>';

    newDiv.appendChild(newSmall);
    newDiv.appendChild(progressBar);
    newDiv.appendChild(small);
    return newDiv;
}

// http request sender
function productRequest(resolve, reject, url) {
    fetch(url, {
        "method": "GET",
        "headers": {
            "Content-Type": "application/json",
            "axesso-api-key": axesso_api_key
        }
    })
        .then(response => {
            if (response.status == 404) resolve({});
            else resolve(response.json());
            console.log(response);
        })
        .catch(err => {
            reject(err);
            console.error(err);
        });
}

function tiktokVideoRequest(resolve, reject, url) {
    fetch(url, {
        "method": "GET",
        "headers": {
            "Content-Type": "application/json",
            "x-rapidapi-host": "tiktok-video-no-watermark2.p.rapidapi.com",
            "x-rapidapi-key": x_rapidapi_key_tiktok
        }
    })
        .then(response => {
            resolve(response.json());
            console.log(response);
        })
        .catch(err => {
            reject(err);
            console.error(err);
        });
}

/**
 * Feature Parameters: ['title', 'Price', 'rating']
 * Country: 'JP'
 */
function getProductDetails(input) {
    return new Promise(function (resolve, reject) {
        let url = productDetailsUrl + '?advancedProxy=true' + '&url=' + input;
        productRequest(resolve, reject, url);
    });
}

function getRelatedProductList(category, domainCode, keyword, sortBy, page = 1) {
    return new Promise(function (resolve, reject) {
        let url = productSearchUrl + '?keyword=' + keyword + '&domainCode=' + domainCode + '&sortBy=' + sortBy + '&page=' + page;
        productRequest(resolve, reject, url);
    });
}

function getOttoRelatedProductList(keywords, page = 1) {
    return new Promise(function (resolve, reject) {
        let url = ottoProductSearchUrl + '?keyword=' + keywords + '&page=' + page;
        productRequest(resolve, reject, url);
    });
}

function getTiktokRelatedVideo(keywords, count) {
    return new Promise(function (resolve, reject) {
        let url = tiktokVideoSearchUrl + '?keywords=' + keywords + '&count=' + count;
        tiktokVideoRequest(resolve, reject, url);
    });
}

// create history content tags
function appendHistory(his) {
    let newA = document.createElement('a');
    newA.setAttribute('class', 'dropdown-item');
    newA.setAttribute('href', '#');
    newA.setAttribute('onclick', 'historyClick(this)');

    let newDiv = document.createElement('div');
    newDiv.setAttribute('class', 'row');
    newDiv.setAttribute('style', 'max-width: 290px;');

    let newImg = document.createElement('img');
    newImg.setAttribute('class', 'col-2');
    newImg.setAttribute('style', 'max-width: 65px;');
    newImg.setAttribute('src', his.thumb[0]);

    let newPi = document.createElement('p');
    newPi.setAttribute('class', 'col-6 text-truncate');
    newPi.innerHTML = his.title;

    let newPii = document.createElement('p');
    newPii.setAttribute('class', 'col-2');
    newPii.innerHTML = '$' + his.price;

    let newPHide = document.createElement('p');
    newPHide.setAttribute('style', 'display: none;');
    newPHide.innerHTML = his.asin;

    newDiv.appendChild(newImg);
    newDiv.appendChild(newPi);
    newDiv.appendChild(newPii);
    newDiv.appendChild(newPHide);

    newA.appendChild(newDiv);

    dpMenu.appendChild(newA);
}

function historyClick(e) {
    let asin = e.children[0].children[3].innerHTML;
    let url = amazonUrl + '/dp/' + asin;

    urlInput.value = url;
    urlInput.dispatchEvent(new CustomEvent('change'));
    dpMenu.setAttribute('class', 'dropdown-menu');
}

/**
 * 
 * @param {details} JSON_STRUCTURE
 * - product
 *   - title:
 *   - description:
 *   - feature_bullets:
 *   - letiants:
 *   - categories:
 *     - 0
 *       - category:
 *       - url:
 *   - asin:
 *   - url:
 *   - reviews:
 *     - total_reviews:
 *     - rating:
 *     - answered_questions:
 *   - item_available:
 *   - price: 
 *     - symbol:
 *     - currency:
 *     - current_price:
 *     - discounted:
 *     - before_price:
 *   - bestsellers_rank:
 *   - main_image:
 *   - total_images:
 *   - images:
 *   - total_videos:
 *   - videos:
 *   - delivery_message:
 *   - product_information:
 *     - dimensions:
 *     - weight:
 *     - manufacturer:
 *     - brand:
 *   - badges:
 *   - sponsored_products:
 *   - also_bought:
 *   - other_sellers
 */
function getProductCatagoryAndKeyword(details) {
    let categoryKeywordList;
    let category = [];
    let categoryAvailable;
    let keyword;
    let productCategories = details.categories;

    for (let index in productCategories) {
        category.push(productCategories[index]);
    }
    /**
     * category1 > category2 > category3 => category3 > category2 > category1
     * get product category
     */
    category = category.reverse();
    if (category.length >= 1) {
        categoryAvailable = category[0];
    } else {
        categoryAvailable = 'no_category';
    }

    // get product keyword
    keyword = keywordExtract(details.productTitle);

    categoryKeywordList = {
        category: categoryAvailable,
        keywords: keyword
    };
    return categoryKeywordList;
}

/**
 * extract keywords
 * @ignore params should be description & title or title only?
 * @param {String} description 
 * @param {String} title 
 */
function keywordExtract(title) {
    let text = title;
    // summarize(text, sentences, keywordsInt)
    let result = summarize(text, 1, 3);
    let keywords = result.keywords;

    return keywords;
}

function priceVectorCalc(basedVector, basedPrice, currentPrice, hp, lp) {
    hp = basedPrice > hp ? basedPrice : hp;
    let deviation = (Math.abs(currentPrice - basedPrice) / (hp - lp)).toFixed(5);
    let priceVector = basedVector - deviation;
    return priceVector;
}

function rateVectorCalc(basedVector, basedRate, currentRate, maxRate, minRate) {
    let cRate = Number.parseFloat(currentRate);
    let bRate = Number.parseFloat(basedRate);
    let deviation = (Math.abs(cRate - bRate) / (maxRate - minRate)).toFixed(5);
    let rateVector = basedVector - deviation;
    return rateVector;
}

function titleVectorCalc(basedVector, basedTitle, currentTitle) {
    let wordGather = [];
    let reg = /\s|[^a-zA-Z0-9]/g;
    let basedSentence = basedTitle.split(reg);
    let currentSentence = currentTitle.split(reg);
    for (let i = 0; i < basedSentence.length; i++) {
        if (basedSentence[i] !== "") {
            wordGather.push(basedSentence[i]);
        }
    }
    for (let i = 0; i < currentSentence.length; i++) {
        if (currentSentence[i] !== "") {
            wordGather.push(currentSentence[i]);
        }
    }
    wordGather = removeDuplicateWords(wordGather);

    // generate sentence vector
    let basedSentenceVector = uniqueOccurrences(wordGather, basedSentence);
    let currentSentenceVector = uniqueOccurrences(wordGather, currentSentence);
    let cosineSim = basedVector * cosineSimilarity(basedSentenceVector, currentSentenceVector);

    return cosineSim;
}

/**
 * data Parameters: ['title', 'Price', 'rating', 'img', 'url']
 * Country: 'JP'
 * @param {Array} dataGroup
 * calculatge cosine similarity based on title and price.
 */
function getProductEigenVector(dataGroup, hp, lp) {
    let vectorGroup = [];
    for (let data in dataGroup) {
        let smallVectorGroup = [];
        let cPrice = basedProductInfo.price;
        // if(cPrice === 0) {
        //     cPrice = basedProductInfo.product.price.before_price;
        // }
        let titleVector = titleVectorCalc(defaultVector, basedProductInfo.productTitle, dataGroup[data][0]);
        let priceVector = priceVectorCalc(defaultVector, cPrice, dataGroup[data][1], hp, lp);
        // let rateVector = rateVectorCalc(defaultVector, basedProductInfo.product.reviews.rating, dataGroup[data][2], 5.0, 0);
        smallVectorGroup.push(titleVector, priceVector);
        vectorGroup.push(smallVectorGroup);
    }
    return vectorGroup;
}


