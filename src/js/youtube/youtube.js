// youtube api request information
var apiKey = 'AIzaSyAzZ9zDUhbl9wRic80yAVN_R_oglKsv98c';
var discoveryDocs = 'https://www.googleapis.com/discovery/v1/apis/youtube/v3/rest';
var searchPart = ['snippet'];
var keywordForYtb = [];
var videoInfos = [];

function ytbLoadClient() {
    gapi.client.setApiKey(apiKey);
    return gapi.client.load(discoveryDocs)
        .then(function() { console.log('GAPI client loaded for API'); },
              function(err) { console.error('Error loading GAPI client for API', err); });
}

// Make sure the client is loaded before calling this method.
function ytbSearch(kw) {
    return gapi.client.youtube.search.list({
        'part': searchPart,
        'maxResults': 25,
        'order': 'relevance',
        'q': kw
    }).then(
        function(response) {
            // Handle the results here (response.result has the parsed body).
            let vInfo = [];
            let resInfo = response.result.items[0];
            if(resInfo === undefined) { return ; }
            console.log(resInfo);
            vInfo.push(
                resInfo.id.videoId,
                resInfo.snippet.channelId, 
                resInfo.snippet.description,
                resInfo.snippet.publishedAt,
                resInfo.snippet.thumbnails.default,
                resInfo.snippet.title
            );
            videoInfos.push(vInfo);
        },
        function(err) { console.error('Execute error', err); }
    );
}

function ytbGetKeyword(dataContainer, rcmVector) {
    for(let index in rcmVector) {
        let title = dataContainer[rcmVector[index][1]][0];
        let slice = title.split(' ').slice(0, 6).join(' ');
        keywordForYtb.push(slice);
    }
    console.log(keywordForYtb);
}

// Logic is from here
gapi.load('client', ytbLoadClient);
