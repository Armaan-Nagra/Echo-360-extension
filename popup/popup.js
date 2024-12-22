const { createFFmpeg, fetchFile } = FFmpeg;

const ffmpeg = createFFmpeg({
    corePath: chrome.runtime.getURL("libs/ffmpeg-core.js"),
    log: true,
    mainName: 'main'
});

async function runFFmpeg(outputFileName, commandStr, audioUrl, videoUrl,status) {
    if (ffmpeg.isLoaded()) {
        await ffmpeg.exit();
    }

    await ffmpeg.load();

    const commandList = commandStr.split(' ');
    if (commandList.shift() !== 'ffmpeg') {
        alert('Please start with ffmpeg');
        return;
    }

    // Fetch audio and video      
    const [audioResponse, videoResponse] = await Promise.all([
        fetch(audioUrl),
        fetch(videoUrl)
    ]);

    const audioBlob = await audioResponse.blob();
    const videoBlob = await videoResponse.blob();

    const audioBuffer = new Uint8Array(await audioBlob.arrayBuffer());
    const videoBuffer = new Uint8Array(await videoBlob.arrayBuffer());

    ffmpeg.FS('writeFile', 'audio.mp4', await fetchFile(audioBuffer));
    ffmpeg.FS('writeFile', 'video.mp4', await fetchFile(videoBuffer));

    // console.log(commandList);
    await ffmpeg.run(...commandList);
    status.textContent = "Mergin audio and video";
    const data = ffmpeg.FS('readFile', outputFileName);
    const blob = new Blob([data.buffer]);
    downloadFile(blob, outputFileName);
    status.textContent = "";
}

function downloadFile(blob, fileName) {
    const a = document.createElement('a');
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


document.getElementById("download").addEventListener("click", async () => {
    const status = document.getElementById("status");
    status.textContent = "Fetching files...";

    let pageTitle;
    try {
        pageTitle = await getTitleFromPage();
        console.log("Page Title:", pageTitle);
    } catch (error) {
        console.error("Failed to fetch page title:", error);
        pageTitle = "Unknown Title";
    }
    console.log(pageTitle);

    const audioUrl = await new Promise(resolve =>
        chrome.storage.local.get(["latestAudio"], result => resolve(result.latestAudio))
    );

    const videoUrl = await new Promise(resolve =>
        chrome.storage.local.get(["latestVideo"], result => resolve(result.latestVideo))
    );

    const outputFileName = `${pageTitle.replace(/[^a-zA-Z0-9]+/g, "-")}.mp4`;

    runFFmpeg(outputFileName, `ffmpeg -i video.mp4 -i audio.mp4 -c:v copy -c:a copy ${outputFileName}`,audioUrl,videoUrl,status)
});


