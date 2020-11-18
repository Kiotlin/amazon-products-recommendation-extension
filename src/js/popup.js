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
        basedProductInfo.product.url
    );
    let dataGroup = [];
    dataGroup.push(data);

    let recommendedGroup = [[0, 0]];
    setRecommendedCard(imgZero, titleZero, infoZero, dataGroup, recommendedGroup, 0);
});

// generate new recommendation products
refresh.addEventListener('click', async function() {
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

    // generate new product card UI
    setRecommendedCard(imgOne, titleOne, infoOne, dataContainer, recommendedVector, 0);
    setRecommendedCard(imgTwo, titleTwo, infoTwo, dataContainer, recommendedVector, 1);
    setRecommendedCard(imgThree, titleThree, infoThree, dataContainer, recommendedVector, 2);
    setRecommendedCard(imgFour, titleFour, infoFour, dataContainer, recommendedVector, 3);
});

function setRecommendedCard(imgSet, titleSet, infoSet, dataGroup, recomVec, num) {
    imgSet.setAttribute('src', dataGroup[recomVec[num][1]][3]);
    titleSet.innerHTML = dataGroup[recomVec[num][1]][0];
    let newA = document.createElement('a');
    newA.setAttribute('href', dataGroup[recomVec[num][1]][4]);
    newA.setAttribute('target', '_blank');
    newA.setAttribute('style', 'padding-left: 8px;');
    newA.innerHTML = 'more';
    let newSpan = document.createElement('span');
    newSpan.innerHTML = 'Price:  $' + dataGroup[recomVec[num][1]][1];
    infoSet.innerHTML = '';
    infoSet.appendChild(newSpan);
    infoSet.appendChild(newA);
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


