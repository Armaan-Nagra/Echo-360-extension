// This is the service worker script, which executes in its own context
// when the extension is installed or refreshed (or when you access its console).
// It would correspond to the background script in chrome extensions v2.

console.log("This prints to the adfds of the service worker (background script)")
console.log("OOGA BOOGA")

// This code runs in the service worker (background) context

function logURL(details) {
    console.log(details.url);
}
  
chrome.webRequest.onCompleted.addListener(logURL,
    {urls: ["*://content.echo360.org.uk/*.m3u8*"]}
);