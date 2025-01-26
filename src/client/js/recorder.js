import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const startBtn = document.getElementById("startBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

const files = {
  input: "recording.webm",
  output: "output.mp4",
  thumbnail: "thumbnail.jpg",
};

const downloadFile = async (fileUrl, filename) => {
  const a = document.createElement("a");
  a.href = fileUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
};

const handleDownload = async () => {
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  const ffmpeg = new FFmpeg();

  // 로딩 상태 표시
  startBtn.innerText = "Processing...";
  startBtn.disabled = true;

  try {
    ffmpeg.on("log", ({ message }) => {
      console.log(message);
    });

    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(
        `${baseURL}/ffmpeg-core.wasm`,
        "application/wasm"
      ),
    });

    await ffmpeg.writeFile(files.input, await fetchFile(videoFile));
    await ffmpeg.exec(["-i", files.input, "-r", "60", files.output]);
    await ffmpeg.exec([
      "-i",
      files.input,
      "-ss",
      "00:00:01",
      "-frames:v",
      "1",
      files.thumbnail,
    ]);

    const mp4File = await ffmpeg.readFile(files.output);
    const thumbnailFile = await ffmpeg.readFile(files.thumbnail);

    const videoBlob = new Blob([mp4File], { type: "video/mp4" });
    const mp4Url = URL.createObjectURL(videoBlob);

    const thumbnailBlob = new Blob([thumbnailFile], { type: "image/jpeg" });
    const thumbnailUrl = URL.createObjectURL(thumbnailBlob);

    downloadFile(mp4Url, files.output);
    downloadFile(thumbnailUrl, files.thumbnail);

    startBtn.innerText = "Download Recording";
    startBtn.disabled = false;
  } catch (error) {
    console.error("Error processing video:", error);
    startBtn.innerText = "Error! Try again";
    startBtn.disabled = false;
  }
};

const handleStop = () => {
  startBtn.innerText = "Download Recording";
  startBtn.removeEventListener("click", handleStop);
  startBtn.addEventListener("click", handleDownload);
  recorder.stop();
};

const handleStart = () => {
  startBtn.innerText = "Stop Recording";
  startBtn.removeEventListener("click", handleStart);
  startBtn.addEventListener("click", handleStop);

  recorder = new MediaRecorder(stream, { mimeType: "video/webm" });
  recorder.ondataavailable = (event) => {
    videoFile = URL.createObjectURL(event.data);
    video.srcObject = null;
    video.src = videoFile;
    video.loop = true;
    video.play();
  };

  recorder.start();
};

const init = async () => {
  stream = await navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: 1024,
      height: 576,
    },
  });
  video.srcObject = stream;
  video.play();
};

init();
startBtn.addEventListener("click", handleStart);
