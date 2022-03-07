const liveView2 = document.getElementById('liveView2');
const videoObjectsIdentifiedList = document.querySelector('.video-objects-identified-list');
const videoPlayerDemoBtn = document.getElementById('demo-video-player-btn');
const videoPlayer = document.getElementById('video-player');

videoPlayer.onplay = (e) => {

    videoPlayer.onplaying = () => {
        const originalHeight = videoPlayer.videoHeight;
        const originalWidth = videoPlayer.videoWidth;
        const resizedHeight = videoPlayer.offsetHeight;
        const resizedWidth = videoPlayer.offsetWidth;
        
        const mapX = (x) => (x / originalWidth) * resizedWidth;
        const mapY = (y) => (y / originalHeight) * resizedHeight;

        setTimeout(() => {
            predictWebcam(videoPlayer, liveView2, videoObjectsIdentifiedList, mapX, mapY);
        }, 500);

        videoPlayer.onended = () => {
            if (requestId !== undefined) {
                window.cancelAnimationFrame(requestId);
            }
        }
        videoPlayer.onpause = () => {
            if (requestId !== undefined) {
                window.cancelAnimationFrame(requestId);
            }
        }
    }
}

videoPlayerDemoBtn.addEventListener('click', () => {
    video.srcObject = null;
    for (let i = 0; i < children.length; i++) {
        liveView.removeChild(children[i]);
    }
    children.splice(0);
    if (requestId !== undefined) {
        window.cancelAnimationFrame(requestId);
    }
    var source = videoPlayer.querySelector('source');
    source.setAttribute('src', "https://static.videezy.com/system/resources/previews/000/008/452/original/Dark_Haired_Girl_Pensive_Looks_at_Camera.mp4");
    source.setAttribute('type', 'video/mp4');
    videoPlayer.load();

})


const uploadVideoBtn = document.querySelector('.upload-video-btn');
console.log('videoBtn', uploadVideoBtn)
uploadVideoBtn.addEventListener('click', (e) => {
    console.log("Target", e);
    uploadVideoBtn.nextElementSibling.click();
});

const videoFileInput = document.querySelector('.video-file-input');

videoFileInput.onchange = async (e) => {
    const [file] = videoFileInput.files;
    console.log(file);

    var source = videoPlayer.querySelector('source');
    const url = URL.createObjectURL(file)
    source.setAttribute('src', url);
    source.setAttribute('type', 'video/mp4');
    videoPlayer.load();
}