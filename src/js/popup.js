var refresh = document.getElementById('refresh');
var urlInput = document.getElementById('basic-url');

var imgZero = document.getElementById('img-0');
var imgOne = document.getElementById('img-1');
var imgTwo = document.getElementById('img-2');
var imgThree = document.getElementById('img-3');
var imgFour = document.getElementById('img-4');

var titleZero = document.getElementById('title-0');
var titleOne = document.getElementById('title-1');
var titleTwo = document.getElementById('title-2');
var titleThree = document.getElementById('title-3');
var titleFour = document.getElementById('title-4');

var infoZero = document.getElementById('info-0');
var infoOne = document.getElementById('info-1');
var infoTwo = document.getElementById('info-2');
var infoThree = document.getElementById('info-3');
var infoFour = document.getElementById('info-4');

var collaOne = document.getElementById('collapseExample-1');
var collaTwo = document.getElementById('collapseExample-2');
var collaThree = document.getElementById('collapseExample-3');
var collaFour = document.getElementById('collapseExample-4');

var collaYtbOne = document.getElementById('collapseYtb-1');
var collaYtbTwo = document.getElementById('collapseYtb-2');
var collaYtbThree = document.getElementById('collapseYtb-3');
var collaYtbFour = document.getElementById('collapseYtb-4');

// amazon api request information
var x_rapidapi_host = 'amazon-product-reviews-keywords.p.rapidapi.com';
var x_rapidapi_key = 'c3a7f7f8a9msh520a129aada3ac0p115dbfjsn6cc0487c3120';
var baseUrl = 'https://amazon-product-reviews-keywords.p.rapidapi.com/';
var productDetailsUrl = baseUrl + 'product/details';
var productSearchUrl = baseUrl + 'product/search';
var productReviewsUrl = baseUrl + 'product/reviews';
var productCategoriesUrl = baseUrl + 'categories';
var shopLocation = 'US';
var splitIndex = 5;

// product details
var urlInputStr;
var asinID;
var category;
var keyword;
// the info of product that is inputted 
var basedProductInfo;
var basedProductVector = [1, 1, 1];
// searched products result based on the product that was inputted
var relatedProductList;
// default vector dimension
var defaultVector = 1;

// install product's info after inputted
urlInput.addEventListener('change', async function() {
    urlInputStr = urlInput.value;

    // get ASIN ID & its details
    asinID = urlInputStr.split('/')[splitIndex];
    await getProductDetails(asinID, shopLocation)
    .then(data => basedProductInfo = data)
    .catch(err => console.log(err));
    console.log(basedProductInfo);

    let data = [];
    let price = basedProductInfo.product.price.current_price === 0 ? basedProductInfo.product.price.before_price : basedProductInfo.product.price.current_price;
    data.push(
        basedProductInfo.product.title, 
        price, 
        basedProductInfo.product.reviews.rating, 
        basedProductInfo.product.main_image, 
        basedProductInfo.product.url,
        basedProductInfo.product.reviews.total_reviews
    );

    setCoverCard(imgZero, titleZero, infoZero, data);
});

// generate new recommendation products
refresh.addEventListener('click', async function() {
    // reset videoInfo array
    if(videoInfos.length == 4) { videoInfos = []; }

    // search related products
    let categoryAndKeyword = getProductCatagoryAndKeyword(basedProductInfo);
    let categoryString = categoryAndKeyword.category;
    let keywordString = '';
    let randomPage = Math.floor(Math.random()*10);
    for(let i=0; i<categoryAndKeyword.keywords.length; i++) {
        keywordString += categoryAndKeyword.keywords[i] + ' ';
    }
    await getRelatedProductList(categoryString, shopLocation, keywordString, randomPage)
    .then(data => relatedProductList = data)
    .catch(err => console.log(err));
    console.log(relatedProductList);

    /**
     * get data vector
     * @param data: ['title', 'price', 'rating', 'img', 'url']
     */
    let dataContainer = [];
    let productList = relatedProductList.products;
    let highestPrice = 0;
    let lowestPrice = Number.MAX_SAFE_INTEGER;
    for (let product in productList) {
        let data = [];
        let current_price = productList[product].price.current_price;
        if (current_price === 0) continue;
        if (current_price >= highestPrice) {
            highestPrice = current_price;
        }
        if (current_price <= lowestPrice) {
            lowestPrice = current_price;
        }
        data.push(productList[product].title);
        data.push(productList[product].price.current_price);
        data.push(productList[product].reviews.rating);
        data.push(productList[product].thumbnail);
        data.push(productList[product].url);
        data.push(productList[product].reviews.total_reviews);
        dataContainer.push(data);
    }
    let vectorContainer = getProductEigenVector(dataContainer, highestPrice, lowestPrice);
    console.log(vectorContainer);
    let relatedProductVector = [];
    for (let vec in vectorContainer) {
        let rVector = cosineSimilarity(basedProductVector, vectorContainer[vec]);
        relatedProductVector.push(rVector);
    }
    let recommendedVector = theBiggestFourIndex(relatedProductVector);
    console.log(recommendedVector);

    // get info from youtube
    ytbGetKeyword(dataContainer, recommendedVector);
    for(let kw in keywordForYtb) {
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
});



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
    imgSet.setAttribute('src', data[3]);
    titleSet.innerHTML = data[0];

    let newSpan1 = document.createElement('span');
    let newSpan2 = document.createElement('span');
    let newSpan3 = document.createElement('span');
    let priceInfo = 'Price:  $' + data[1];
    let ratingInfo = 'Rating:  ' + data[2];
    let totalReviewInfo = 'Review:  ' + data[5];

    newSpan1.innerHTML = priceInfo + '<br>';
    newSpan2.innerHTML = ratingInfo + '<br>';
    newSpan3.innerHTML = totalReviewInfo;

    infoSet.innerHTML = '';
    infoSet.appendChild(newSpan1);
    infoSet.appendChild(newSpan2);
    infoSet.appendChild(newSpan3);
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

    if(num === 1) {
        player1.loadVideoById(videoId, 5, "large");
    } else if(num === 2) {
        player2.loadVideoById(videoId, 5, "large");
    } else if(num === 3) {
        player3.loadVideoById(videoId, 5, "large");
    } else if(num === 4) {
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
    // create httpRequest model
    var xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.onreadystatechange = function() {
        if (this.readyState === this.DONE) {
            if (this.status >= 200 && this.status < 300) {
                let data = JSON.parse(this.responseText);
                resolve(data);
            } else {
                reject({
                    status: this.status,
                    statusText: this.statusText
                });
            }
        }
    };
    xhr.onerror = function() {
        reject({
            status: this.status,
            statusText: this.statusText
        });
    };

    // send product details request 
    xhr.open('GET', url);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('x-rapidapi-host', x_rapidapi_host);
    xhr.setRequestHeader('x-rapidapi-key', x_rapidapi_key);
    xhr.send();
}

/**
 * Feature Parameters: ['title', 'Price', 'rating']
 * Country: 'JP'
 */
function getProductDetails(asinID, country) {
    return new Promise(function(resolve, reject) {
        let url = productDetailsUrl + '?country=' + country + '&asin=' + asinID;
        productRequest(resolve, reject, url);
    });
}

function getRelatedProductList(category, country, keyword, page=1) {
    return new Promise(function(resolve, reject) {
        let url = productSearchUrl + '?page=' + page + '&category=' + category + '&country=' + country + '&keyword=' + keyword;
        productRequest(resolve, reject, url);
    });
}

/**
 * 
 * @param {details} JSON_STRUCTURE
 * - product
 *   - title:
 *   - description:
 *   - feature_bullets:
 *   - variants:
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
    let productCategories = details.product.categories;

    for (let index in productCategories) {
        category.push(productCategories[index].category);
    }
    /**
     * category1 > category2 > category3 => category3 > category2 > category1
     * get product category
     */
    category = category.reverse();
    for (let index of category) {
        for (let cat in categoryList) {
            if (index === cat) {
                categoryAvailable = categoryList[cat];
                break;
            }
        }
        if (typeof categoryAvailable !== 'undefined') {
            break;
        }
    }
    if (typeof categoryAvailable === 'undefined') categoryAvailable = 'no_category';

    // get product keyword
    keyword = keywordExtract(details.product.description, details.product.title);

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
function keywordExtract(description, title) {
    let text = title ;
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
    for (let i=0; i < basedSentence.length; i++) {
        if(basedSentence[i] !== "") {
            wordGather.push(basedSentence[i]);
        }
    }
    for (let i=0; i < currentSentence.length; i++) {
        if(currentSentence[i] !== "") {
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
 */
function getProductEigenVector(dataGroup, hp, lp) {
    let vectorGroup = [];
    for (let data in dataGroup) {
        let smallVectorGroup = [];
        let cPrice = basedProductInfo.product.price.current_price;
        if(cPrice === 0) {
            cPrice = basedProductInfo.product.price.before_price;
        }
        let titleVector = titleVectorCalc(defaultVector, basedProductInfo.product.title, dataGroup[data][0]);
        let priceVector = priceVectorCalc(defaultVector, cPrice, dataGroup[data][1], hp, lp);
        let rateVector = rateVectorCalc(defaultVector, basedProductInfo.product.reviews.rating, dataGroup[data][2], 5.0, 0);
        smallVectorGroup.push(titleVector, priceVector, rateVector);
        vectorGroup.push(smallVectorGroup);
    }
    return vectorGroup;
}


