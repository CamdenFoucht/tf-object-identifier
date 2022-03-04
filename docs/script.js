const pageLoader = document.querySelector('.page-loader')
const minAccuracyInput = document.querySelector('.accuracy-slider');
const minAccuracySpan = document.querySelector('.min-accuracy-span');

let minAccuracy = minAccuracyInput.value;
minAccuracySpan.textContent = minAccuracy;

const handleMinus = () => {
    minAccuracyInput.stepDown();
}

const handlePlus = () => {
    minAccuracyInput.stepUp();
}

const slideValue = document.querySelector("span");
const inputSlider = document.querySelector(".accuracy-slider");
inputSlider.oninput = (() => {
    console.log('on input?')
    minAccuracy = inputSlider.value;
    minAccuracySpan.textContent = minAccuracy;
});

function handleAccuracyChange(e) {
    console.log(e.target.value);
    minAccuracy = e.target.value;
}


minAccuracyInput.addEventListener('click', handleAccuracyChange);

var model = undefined;


cocoSsd.load().then(function (loadedModel) {
    model = loadedModel;
    // Show demo section now model is ready to use.
    console.log(pageLoader);
    pageLoader.style.display = 'none';
});

// pageLoader.style.display = 'none';


let requestId = undefined;
let objectsSet = new Set();

var children = [];

function predictWebcam(videoElement, parentView, objectList) {
    // Now let's start classifying the stream.
    model.detect(videoElement).then(function (predictions) {
        // Remove any highlighting we did previous frame.
        for (let i = 0; i < children.length; i++) {
            parentView.removeChild(children[i]);
        }
        children.splice(0);

        let currentSet = new Set();
        let currentMap = new Map();

        // they have a high confidence score.
        for (let n = 0; n < predictions.length; n++) {

            const scoreNice = Math.round(parseFloat(predictions[n].score) * 100)

            // If we are over 66% sure we are sure we classified it right, draw it!
            let predClassUpdated = undefined;
            if (scoreNice >= minAccuracy) {
                const predClass = predictions[n].class;
                if (currentSet.has(predClass)) {
                    predClassUpdated = `${predClass} - ${currentMap.get(predClass)}`
                    currentMap.set(predClass, currentMap.get(predClass) + 1);
                    currentSet.add(predClassUpdated);
                } else {
                    currentSet.add(predClass);
                    currentMap.set(predClass, 1);
                }


                // console.log(predictions[n]);
                const p = document.createElement('p');
                p.innerText = predictions[n].class + ' - with ' +
                    Math.round(parseFloat(predictions[n].score) * 100) +
                    '% confidence.';
                // Draw in top left of bounding box outline.
                p.style = 'left: ' + predictions[n].bbox[0] + 'px;' +
                    'top: ' + predictions[n].bbox[1] + 'px;' +
                    'width: ' + (predictions[n].bbox[2] - 10) + 'px;';

                // Draw the actual bounding box.
                const highlighter = document.createElement('div');
                highlighter.setAttribute('class', 'highlighter');
                highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px; top: ' +
                    predictions[n].bbox[1] + 'px; width: ' +
                    predictions[n].bbox[2] + 'px; height: ' +
                    predictions[n].bbox[3] + 'px;';

                const score = predictions[n].score;

                let background = 'green';

                if (score <= 0.3) {
                    highlighter.style.background = 'rgba(255, 0, 0, 0.4)';
                    highlighter.style.borderColor = 'rgba(255, 0, 0, 0.4)';
                    background = 'rgba(255, 0, 0, 0.4)';
                    p.style.background = `rgba(255, 0, 0, 0.7)`
                    p.style.borderColor = `rgba(255, 0, 0, 0.4)`
                } else if (score <= 0.5) {
                    highlighter.style.background = 'rgba(3, 169, 244, 0.4)';
                    background = 'rgba(3, 169, 244, 0.4)'
                    p.style.background = `rgba(3, 169, 244, 0.7)`
                    p.style.borderColor = `rgba(3, 169, 244, 0.4)`

                } else if (score <= 0.75) {
                    highlighter.style.background = 'rgba(63, 81, 181, 0.3)';
                    background = 'rgba(63, 81, 181, 0.3)';
                    p.style.background = `rgba(63, 81, 181, 0.8)`
                    p.style.borderColor = `rgba(63, 81, 181, 0.3)`

                } else {
                    highlighter.style.background = 'rgba(76, 175, 80, 0.3)';
                    highlighter.style.borderColor = 'rgba(76, 175, 80, 0.6)';
                    p.style.background = `rgba(76, 175, 80, 0.8)`
                    p.style.borderColor = `rgba(76, 175, 80, 0.6)`
                    background = 'rgba(76, 175, 80, 0.6)';
                }

                const listItemsCurrent = [...objectList.children];

                if (predClassUpdated !== undefined && !objectsSet.has(predClassUpdated)) {
                    const li = document.createElement('li');
                    li.textContent = `${predClassUpdated} - Highest Accuracy Rate Seen: ${scoreNice}%`;
                    li.classList.add('object-identified-li');
                    li.dataset.rate = scoreNice;
                    li.dataset.name = predClassUpdated;
                    objectList.append(li);
                    objectsSet.add(predClassUpdated);
                    li.style.background = background;
                } else if (predClass !== undefined && !objectsSet.has(predClass)) {
                    const li = document.createElement('li');
                    li.classList.add('object-identified-li')
                    li.textContent = `${predClass} - Highest Accuracy Rate Seen: ${scoreNice}%`;
                    li.dataset.name = predClass;
                    objectList.append(li);
                    objectsSet.add(predClass);
                    li.style.background = background;
                    li.dataset.rate = scoreNice;
                } else {
                    listItemsCurrent.forEach(el => {
                        if (el.dataset.name === predClass || el.dataset.name === predClassUpdated) {
                            if (scoreNice >= el.dataset.rank) {
                                el.style.background = background;
                                el.textContent = `${el.dataset.name} - Highest Accuracy Rate Seen - ${scoreNice}`
                            }
                            el.dataset.rank = Math.max(el.dataset.rank, scoreNice);
                        }
                    })
                }


                const listItems = [...objectList.children];
                listItemsSorted = listItems.sort((el1, el2) => el2.dataset.scoreNice - el1.dataset.scoreNice);

                objectList.innerHTML = '';
                listItemsSorted.forEach(el => {
                    objectList.appendChild(el);
                })


                parentView.appendChild(highlighter);
                parentView.appendChild(p);

                // Store drawn objects in memory so we can delete them next time around.
                children.push(highlighter);
                children.push(p);
            }

        }

        // Call this function again to keep predicting when the browser is ready.
        requestId = window.requestAnimationFrame(() => predictWebcam(videoElement, parentView, objectList));
    });
}



function clearStream() {
    if (requestId !== undefined) {
        window.cancelAnimationFrame(requestId);
    }
    video.srcObject = null;
    enableWebcamButton.classList.remove('removed');

    for (let i = 0; i < children.length; i++) {
        children[i].parentElement.removeChild(children[i]);
    }
    children.splice(0);
}