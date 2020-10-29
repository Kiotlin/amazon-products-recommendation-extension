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
var shopLocation = 'JP';

// product details
var urlInputStr;
var asinID;
var basedProductInfo;
var basedProductVector;

refresh.addEventListener('click', async function() {
    urlInputStr = urlInput.value;

    // get ASIN ID & its details
    asinID = urlInputStr.split('/')[5];
    await getProductInformation(asinID, shopLocation)
    .then(data => basedProductInfo = data)
    .catch(err => console.log(err));
    console.log(basedProductInfo);

    // extract product's eigenvalues => eigenvector 
});

/**
 * Feature Parameters: ['brand', 'salePrice', 'score']
 * Country: 'JP'
 */
function getProductInformation(asinID, country) {
    return new Promise(function (resolve, reject) {
        let urlRequest = productDetailsUrl + '?country=' + country + '&asin=' + asinID;

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
        xhr.open('GET', urlRequest);
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.setRequestHeader('x-rapidapi-host', x_rapidapi_host);
        xhr.setRequestHeader('x-rapidapi-key', x_rapidapi_key);
        xhr.send();
    });
}

// function getResponse() {
//     if (xhr.readyState===xhr.DONE) {
//         if (xhr.status>=200 && xhr.sta) {
//             let data = JSON.parse(xhr.responseText);
//             basedProductInfo = data;
//         } else {
//             console.log('There was a problem with the request.');
//         }
//     }
// }
function getProductEigenVector(productDetail) {

}

function getSameProductsLists(page, category, country) {}