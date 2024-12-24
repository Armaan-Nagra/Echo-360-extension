const { createFFmpeg, fetchFile } = FFmpeg;

const ffmpeg = createFFmpeg({
    corePath: chrome.runtime.getURL("libs/ffmpeg-core.js"),
    log: true,
    mainName: 'main'
});

async function fetchWithCombinedProgress(urls, progressElement, statusText) {
    let totalSize = 0;
    let loadedSize = 0;

    // Show the progress bar
    if (progressElement) {
        progressElement.style.display = "block";
    }

    const responses = await Promise.all(
        urls.map(async (url) => {
            const response = await fetch(url, { method: "HEAD" });
            if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
            const contentLength = response.headers.get("Content-Length");
            if (!contentLength) throw new Error("Unable to track progress: Content-Length header missing");
            totalSize += parseInt(contentLength, 10);
            return url;
        })
    );

    const blobs = await Promise.all(
        responses.map(async (url) => {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

            const reader = response.body.getReader();
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                loadedSize += value.length;

                // Update the progress bar and status
                if (progressElement) {
                    progressElement.value = (loadedSize / totalSize) * 100;
                }
                if (statusText) {
                    statusText.textContent = `Downloading... ${(loadedSize / totalSize * 100).toFixed(1)}%`;
                }
            }
            return new Blob(chunks);
        })
    );

    // Hide the progress bar when done
    if (progressElement) {
        progressElement.style.display = "none";
    }

    return blobs;
}

async function runFFmpeg(outputFileName, commandStr, audioUrl, videoUrl, status, progressBar) {
    if (ffmpeg.isLoaded()) {
        await ffmpeg.exit();
    }

    await ffmpeg.load();

    const commandList = commandStr.split(" ");
    if (commandList.shift() !== "ffmpeg") {
        alert("Please start with ffmpeg");
        return;
    }

    // Fetch files with a combined progress bar
    status.textContent = "Fetching files...";
    const [audioBlob, videoBlob] = await fetchWithCombinedProgress(
        [audioUrl, videoUrl],
        progressBar,
        status
    );

    const audioBuffer = new Uint8Array(await audioBlob.arrayBuffer());
    const videoBuffer = new Uint8Array(await videoBlob.arrayBuffer());

    status.textContent = "Writing to FFMPEG memory...";
    ffmpeg.FS("writeFile", "audio.mp4", await fetchFile(audioBuffer));
    ffmpeg.FS("writeFile", "video.mp4", await fetchFile(videoBuffer));

    status.textContent = "Merging audio and video...";
    await ffmpeg.run(...commandList);

    const data = ffmpeg.FS("readFile", outputFileName);
    const blob = new Blob([data.buffer]);
    downloadFile(blob, outputFileName);

    status.textContent = "Download complete!";
    progressBar.value = 0; // Reset progress bar
}

function downloadFile(blob, fileName) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
}

async function getTitleFromPage() {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length === 0) {
                reject("No active tab found.");
                return;
            }

            const activeTabId = tabs[0].id;

            chrome.scripting.executeScript(
                {
                    target: { tabId: activeTabId, allFrames: false },
                    func: () => {
                        return document.title || "Untitled Page";
                    },
                },
                (results) => {
                    if (chrome.runtime.lastError) {
                        console.error(chrome.runtime.lastError.message);
                        reject(chrome.runtime.lastError.message);
                    } else if (results && results[0] && results[0].result) {
                        resolve(results[0].result);
                    } else {
                        reject("Failed to retrieve title");
                    }
                }
            );
        });
    });
}

// DOM Elements are retrieved ONCE here
document.getElementById("download").addEventListener("click", async () => {
    const status = document.getElementById("status");
    const progressBar = document.getElementById("progress-bar");

    status.textContent = "Fetching files...";

    let pageTitle;
    try {
        pageTitle = await getTitleFromPage();
        console.log("Page Title:", pageTitle);
    } catch (error) {
        console.error("Failed to fetch page title:", error);
        pageTitle = "Unknown Title";
    }

    const audioUrl = await new Promise(resolve =>
        chrome.storage.local.get(["latestAudio"], result => resolve(result.latestAudio))
    );

    const videoUrl = await new Promise(resolve =>
        chrome.storage.local.get(["latestVideo"], result => resolve(result.latestVideo))
    );

    const outputFileName = `${pageTitle.replace(/[^a-zA-Z0-9]+/g, "-")}.mp4`;

    await runFFmpeg(
        outputFileName,
        `ffmpeg -i video.mp4 -i audio.mp4 -c:v copy -c:a copy ${outputFileName}`,
        audioUrl,
        videoUrl,
        status,
        progressBar
    );
});