'use strict';

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({color: '#c8d97e'}, function() {
        console.log('the color is green.');
    })
    chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
                // pageUrl: {hostEquals: 'developer.chrome.com'}
            })],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });
});