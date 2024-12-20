// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

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
    latestAudio = details.url;
    storeInStorage("latestAudio", latestAudio);
}

function logVideo(details) {
    latestVideo = details.url;
    storeInStorage("latestVideo", latestVideo);
}

chrome.webRequest.onCompleted.addListener(logAudio,
    {urls: ["*://content.echo360.org.uk/*s0q1.m4s*"]}
);

chrome.webRequest.onCompleted.addListener(logVideo,
    {urls: ["*://content.echo360.org.uk/*s1q1.m4s*"]}
);

