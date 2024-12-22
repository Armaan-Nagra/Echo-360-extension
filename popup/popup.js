// import { createFFmpeg } from '@ffmpeg/ffmpeg';

// document.getElementById("download").addEventListener("click", async () => {
//     console.log("TESTING TESTING")
//     const status = document.getElementById("status");
//     status.textContent = "Fetching files...";

//     // Retrieve URLs from storage
//     const audioUrl = await new Promise(resolve =>
//         chrome.storage.local.get(["latestAudio"], result => resolve(result.latestAudio))
//     );

//     const videoUrl = await new Promise(resolve =>
//         chrome.storage.local.get(["latestVideo"], result => resolve(result.latestVideo))
//     );

//     if (!audioUrl || !videoUrl) {
//         status.textContent = "Audio or video not found!";
//         return;
//     }

//     status.textContent = "Downloading files...";
    
//     // Fetch audio and video
//     const [audioResponse, videoResponse] = await Promise.all([
//         fetch(audioUrl),
//         fetch(videoUrl)
//     ]);

//     const audioBlob = await audioResponse.blob();
//     const videoBlob = await videoResponse.blob();

//     const audioBuffer = await audioBlob.arrayBuffer();
//     const videoBuffer = await videoBlob.arrayBuffer();

//     // Merge audio and video with FFmpeg.js
//     status.textContent = "Merging files...";
//     const ffmpeg = FFmpeg.createFFmpeg({ log: true });
//     await ffmpeg.load();

//     ffmpeg.FS('writeFile', 'audio.m4a', new Uint8Array(audioBuffer));
//     ffmpeg.FS('writeFile', 'video.mp4', new Uint8Array(videoBuffer));

//     await ffmpeg.run('-i', 'video.mp4', '-i', 'audio.m4a', '-c:v', 'copy', '-c:a', 'aac', 'output.mp4');
//     const mergedFile = ffmpeg.FS('readFile', 'output.mp4');

//     const mergedBlob = new Blob([mergedFile.buffer], { type: 'video/mp4' });
//     const mergedUrl = URL.createObjectURL(mergedBlob);

//     // Trigger download
//     chrome.downloads.download({
//         url: mergedUrl,
//         filename: 'merged_video.mp4',
//         saveAs: true
//     });

//     status.textContent = "Download started!";
// });

const { createFFmpeg, fetchFile } = FFmpeg;

const ffmpeg = createFFmpeg({
    corePath: chrome.runtime.getURL("libs/ffmpeg-core.js"),
    log: true,
    mainName: 'main'
});

async function runFFmpeg(outputFileName, commandStr, audioUrl, videoUrl) {
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

    console.log(commandList);
    await ffmpeg.run(...commandList);
    const data = ffmpeg.FS('readFile', outputFileName);
    const blob = new Blob([data.buffer]);
    downloadFile(blob, outputFileName);
}

function downloadFile(blob, fileName) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = fileName;
    a.click();
}


document.getElementById("download").addEventListener("click", async () => {
    const status = document.getElementById("status");
    status.textContent = "Fetching files...";

    const audioUrl = await new Promise(resolve =>
        chrome.storage.local.get(["latestAudio"], result => resolve(result.latestAudio))
    );

    const videoUrl = await new Promise(resolve =>
        chrome.storage.local.get(["latestVideo"], result => resolve(result.latestVideo))
    );

    runFFmpeg('output.mp4', 'ffmpeg -i video.mp4 -i audio.mp4 -c:v copy -c:a copy output.mp4',audioUrl,videoUrl)
});



// document.getElementById("download").addEventListener("click", async () => {
//     const status = document.getElementById("status");
//     status.textContent = "Fetching files...";

//     // Retrieve URLs from storage
//     const audioUrl = await new Promise(resolve =>
//         chrome.storage.local.get(["latestAudio"], result => resolve(result.latestAudio))
//     );

//     const videoUrl = await new Promise(resolve =>
//         chrome.storage.local.get(["latestVideo"], result => resolve(result.latestVideo))
//     );

//     if (!audioUrl || !videoUrl) {
//         status.textContent = "Audio or video not found!";
//         return;
//     }

//     status.textContent = "Downloading files...";

//     // Fetch audio and video      
//     const [audioResponse, videoResponse] = await Promise.all([
//         fetch(audioUrl),
//         fetch(videoUrl)
//     ]);

//     const audioBlob = await audioResponse.blob();
//     const videoBlob = await videoResponse.blob();

//     const audioBuffer = new Uint8Array(await audioBlob.arrayBuffer());
//     const videoBuffer = new Uint8Array(await videoBlob.arrayBuffer());

//     status.textContent = "Merging files with ffmpeg... (UI may freeze)";

//     // Run ffmpeg synchronously on the main thread
//     let stdout = "";
//     let stderr = "";

//     const result = ffmpeg({
//         MEMFS: [
//             { name: "video.mp4", data: videoBuffer },
//             { name: "audio.m4a", data: audioBuffer }
//         ],
//         arguments: ["-i", "video.mp4", "-i", "audio.m4a", "-c:v", "copy", "-c:a", "aac", "output.mp4"],
//         print: (data) => { stdout += data + "\n"; },
//         printErr: (data) => { stderr += data + "\n"; },
//         onExit: (code) => {
//             console.log("FFmpeg exited with code:", code);
//             console.log("FFmpeg stdout:", stdout);
//             console.log("FFmpeg stderr:", stderr);
//         }
//     });

//     // result.MEMFS now contains the output file
//     const outputFile = result.MEMFS.find(file => file.name === "output.mp4");
//     if (!outputFile) {
//         status.textContent = "FFmpeg did not produce an output file.";
//         console.error("No output file found:", stderr);
//         return;
//     }

//     const mergedBlob = new Blob([outputFile.data], { type: 'video/mp4' });
//     const mergedUrl = URL.createObjectURL(mergedBlob);

//     // Trigger download
//     chrome.downloads.download({
//         url: mergedUrl,
//         filename: 'merged_video.mp4',
//         saveAs: true
//     });

//     status.textContent = "Download started!";
// });