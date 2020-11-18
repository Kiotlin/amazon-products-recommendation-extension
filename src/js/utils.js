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