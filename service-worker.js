// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

console.log("This prints to the adfds of the service worker (background script)")

// This code runs in the service worker (background) context

let latestAudio = null;
let latestVideo = null;

function storeInStorage(key, value) {
    chrome.storage.local.set({ [key]: value }, function () {
        console.log(`Stored ${key}: ${value}`);
    });
}

function getFromStorage(key) {
    chrome.storage.local.get([key], function (result) {
        console.log(`Retrieved ${key}: ${result[key]}`);
    });
}

function logAudio(details) {
    if(latestAudio == null){
        latestAudio = details.url;

        storeInStorage("latestAudio", latestAudio);
    }
}

function logVideo(details) {
    if(latestVideo == null){
        latestVideo = details.url;

        storeInStorage("latestVideo", latestVideo);
    }
}

console.log(getFromStorage("latestAudio"))

chrome.webRequest.onCompleted.addListener(logAudio,
    {urls: ["*://content.echo360.org.uk/*s0q1.m4s*"]}
);

chrome.webRequest.onCompleted.addListener(logVideo,
    {urls: ["*://content.echo360.org.uk/*s1q1.m4s*"]}
);
