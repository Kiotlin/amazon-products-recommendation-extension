var refresh = document.getElementById('refresh');
var urlInput = document.getElementById('basic-url');

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
var basedProductVector;
// searched products result based on the product that was inputted
var relatedProductList;

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
    let randomPage = Math.floor(Math.random()*100);
    for(let i=0; i<categoryAndKeyword.keywords.length; i++) {
        keywordString += categoryAndKeyword.keywords[i] + ' ';
    }
    await getRelatedProductList(categoryString, shopLocation, keywordString, randomPage)
    .then(data => relatedProductList = data)
    .catch(err => console.log(err));
    console.log(relatedProductList);

    /**
     * get data vector
     * STRUCTURE: ['title', 'price', 'rating', 'img', 'url']
     */
    let dataContainer = [];
    let productList = relatedProductList.products;
    for (let product in productList) {
        let data = [];
        data.push(productList[product].title);
        data.push(productList[product].price.current_price);
        data.push(productList[product].reviews.rating);
        data.push(productList[product].thumbnail);
        data.push(productList[product].url);
        dataContainer.push(data);
    }
    console.log(dataContainer);


});


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
 * Feature Parameters: ['brand', 'salePrice', 'score', 'title']
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

// extract keywords
function keywordExtract(description, title) {
    let text = title + '. ' + description;
    // summarize(text, sentences, keywordsInt)
    let result = summarize(text, 1, 3);
    let keywords = result.keywords;

    return keywords;
}


function getProductEigenVector(productDetail) {

}
