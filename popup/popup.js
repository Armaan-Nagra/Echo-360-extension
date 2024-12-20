// Include FFmpeg.js (WebAssembly) in your project
import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';

// Button click handler for downloading and merging files
document.getElementById("download").addEventListener("click", async () => {
    const statusElement = document.getElementById("status");
    const ffmpeg = createFFmpeg({ log: true }); // Enable logging for debugging

    try {
        console.log("Button Clicked")
        statusElement.textContent = "Loading FFmpeg...";
        await ffmpeg.load(); // Load FFmpeg WebAssembly module

        // Retrieve stored URLs
        const { latestAudio, latestVideo } = await chrome.storage.local.get(["latestAudio", "latestVideo"]);

        if (!latestAudio || !latestVideo) {
            statusElement.textContent = "Error: Audio or video URL not found.";
            return;
        }

        // Fetch audio and video files
        statusElement.textContent = "Downloading files...";
        const audioBlob = await fetchFile(latestAudio);
        const videoBlob = await fetchFile(latestVideo);

        // Write files to FFmpeg's virtual file system
        statusElement.textContent = "Preparing files...";
        ffmpeg.FS('writeFile', 'audio.m4s', audioBlob);
        ffmpeg.FS('writeFile', 'video.m4s', videoBlob);

        // Merge audio and video into a single MP4
        statusElement.textContent = "Merging files...";
        await ffmpeg.run('-i', 'video.m4s', '-i', 'audio.m4s', '-c:v', 'copy', '-c:a', 'aac', 'output.mp4');

        // Retrieve the merged file
        const mergedFile = ffmpeg.FS('readFile', 'output.mp4');

        // Create a blob URL and trigger download
        const blob = new Blob([mergedFile.buffer], { type: 'video/mp4' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = 'merged_video.mp4'; // Set the desired file name
        a.click();

        statusElement.textContent = "Download complete!";
    } catch (error) {
        console.error("An error occurred:", error);
        statusElement.textContent = `Error: ${error.message}`;
    }
});