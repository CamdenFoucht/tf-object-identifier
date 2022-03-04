const enableWebcamButton = document.getElementById('webcamButton');
const video = document.getElementById('webcam');
const streamObjectsIdentifiedList = document.querySelector('.stream-objects-identified-list');
const liveView = document.getElementById('liveView');



// Check if webcam access is supported.
function hasGetUserMedia() {
    return !!(navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia);
}

// Keep a reference of all the child elements we create
// so we can remove them easilly on each render.
var children = [];


// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
    enableWebcamButton.addEventListener('click', enableCam);
} else {
    console.warn('getUserMedia() is not supported by your browser');
}


let streaming = false;
// Enable the live webcam view and start classification.
function enableCam(event) {
    // if (!model) {
    //     console.log('Wait! Model not loaded yet.')
    //     return;
    // }

    if (video.srcObject !== null) {
        event.target.textContent = 'Enable Webcam';
        clearStream();
    } else {
        event.target.textContent = 'Stop Streaming';

        // getUsermedia parameters.
        const constraints = {
            video: true
        };

        // Activate the webcam stream.
        navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
            console.log("Stream", stream);
            video.srcObject = stream;
            console.log("vid", video);
            video.play();
            video.addEventListener('loadeddata', () => predictWebcam(video, liveView, streamObjectsIdentifiedList));
        });
    }
}