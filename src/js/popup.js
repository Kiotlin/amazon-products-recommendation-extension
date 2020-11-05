var refresh = document.getElementById('refresh');
var urlInput = document.getElementById('basic-url');
var imgOne = document.getElementById('img-1');
var titleOne = document.getElementById('title-1');
var infoOne = document.getElementById('info-1');
var imgTwo = document.getElementById('img-2');
var titleTwo = document.getElementById('title-2');
var infoTwo = document.getElementById('info-2');
var imgThree = document.getElementById('img-3');
var titleThree = document.getElementById('title-3');
var infoThree = document.getElementById('info-3');
var imgFour = document.getElementById('img-4');
var titleFour = document.getElementById('title-4');
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

refresh.addEventListener('click', async function() {
    urlInputStr = urlInput.value;

    // get ASIN ID & its details
    asinID = urlInputStr.split('/')[splitIndex];
    await getProductDetails(asinID, shopLocation)
    .then(data => basedProductInfo = data)
    .catch(err => console.log(err));
    console.log(basedProductInfo);

    // search related products
    let categoryAndKeyword = getProductCatagoryAndKeyword(basedProductInfo);
    let categoryString = categoryAndKeyword.category;
    let keywordString = '';
    let randomPage = Math.floor(Math.random()*5);
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
    let relatedProductVector = [];
    for (let vec in vectorContainer) {
        let rVector = cosineSimilarity(basedProductVector, vectorContainer[vec]);
        relatedProductVector.push(rVector);
    }
    let recommendedVector = theBiggestFourIndex(relatedProductVector);

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

// function for removing duplicate words in array
function removeDuplicateWords(words) {
    let stack = [];
    for (let i=0; i < words.length; i++) {
        if(!stack.includes(words[i])) {
            stack.push(words[i]);
        } else {
            continue;
        }
    }
    return stack;
}

/**
 * function for counting the number of occurences
 * @param {Array} standardArr 
 * @param {Array} generatedArr 
 */
function uniqueOccurrences(standardArr, generatedArr) {
    let targetVector = [];
    for (let i=0; i < standardArr.length; i++) {
        targetVector.push(0);
    }
    for (let i=0; i < standardArr.length; i++) {
        for (let j=0; j < generatedArr.length; j++) {
            if(standardArr[i] === generatedArr[j]) {
                targetVector[i]++;
            }
        }
    }
    return targetVector;
}

/**
 * function for calculating cosine similarity between two vectors
 * arr1 and arr2 should have the same length
 * @param {Array} arr1 
 * @param {Array} arr2 
 */
function cosineSimilarity(arr1, arr2) {
    let deno = 0;
    let len1 = 0;
    let len2 = 0;
    for (let i=0; i < arr1.length; i++) {
        deno += (arr1[i] * arr2[i]);
        len1 += (arr1[i] * arr1[i]);
        len2 += (arr2[i] * arr2[i]);
    }
    len1 = Math.sqrt(len1);
    len2 = Math.sqrt(len2);
    let cosineSim = deno / (len1 * len2);
    cosineSim = cosineSim.toFixed(5);

    return cosineSim;
}

/**
 * return the largest 4 indexs
 * @param arr
 */
function theBiggestFourIndex(arr) {
    let arr1 = arr;
    let st1 = [0, 0];
    let nd2 = [0, 0];
    let rd3 = [0, 0];
    let th4 = [0, 0];
    let group = [];
    for (let i=0; i < arr1.length; i++) {
        if(st1 <= arr1[i]) {
            st1[0] = arr1[i];
            st1[1] = i;
        }
    }
    arr1[st1[1]] = 0;
    for (let i=0; i < arr1.length; i++) {
        if(nd2 <= arr1[i]) {
            nd2[0] = arr1[i];
            nd2[1] = i;
        }
    }
    arr1[nd2[1]] = 0;
    for (let i=0; i < arr1.length; i++) {
        if(rd3 <= arr1[i]) {
            rd3[0] = arr1[i];
            rd3[1] = i;
        }
    }
    arr1[rd3[1]] = 0;
    for (let i=0; i < arr1.length; i++) {
        if(th4 <= arr1[i]) {
            th4[0] = arr1[i];
            th4[1] = i;
        }
    }
    arr1[th4[1]] = 0;
    group.push(st1, nd2, rd3, th4);

    return group;
}
