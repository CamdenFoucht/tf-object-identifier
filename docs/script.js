const pageLoader = document.querySelector('.page-loader')
const minAccuracyInput = document.querySelector('.range-slider__range');
const minAccuracySpan = document.querySelector('.range-slider__value');
const streamObjectsIdentifiedList = document.querySelector('.stream-objects-identified-list');
const enableWebcamSpan = document.querySelector('.enable-webcam-span');
const clearListBtn = document.querySelector('.clear-list');

let minAccuracy = minAccuracyInput.value;
minAccuracySpan.textContent = minAccuracy;

// max objects
const maxObjectSlider = document.querySelector('#max-object-slider');
const maxObjectSpan = document.querySelector('#max-object-span');

let maxObjects = 20;

maxObjectSlider.oninput = (e) => {
    maxObjects = maxObjectSlider.value;
    maxObjectSpan.textContent = maxObjectSlider.value;
}


// const slideValue = document.querySelector("span");
// const inputSlider = document.querySelector(".accuracy-slider");
minAccuracyInput.oninput = (() => {
    console.log('on input?')
    minAccuracy = minAccuracyInput.value;
    minAccuracySpan.textContent = minAccuracy;
});

function handleAccuracyChange(e) {
    console.log(e.target.value);
    minAccuracy = e.target.value;
}


minAccuracyInput.addEventListener('click', handleAccuracyChange);

var model = undefined;


cocoSsd.load({
    base: 'mobilenet_v1'
}).then(function (loadedModel) {
    model = loadedModel;
    // Show demo section now model is ready to use.
    console.log(pageLoader);
    pageLoader.style.display = 'none';
});

// pageLoader.style.display = 'none';


let requestId = undefined;
let objectsSet = new Set();

var children = [];

let xy = 0;

function predictWebcam(videoElement, parentView, objectList, mapX = (x) => x, mapY = (y) => y) {

    if (xy == 0) {
        console.log(mapX);
        console.log(mapY);
        console.log('Map y coord of 500', mapY(500));
        console.log('Map x coord of 500', mapX(500));
    }
    // Now let's start classifying the stream.
    model.detect(videoElement, maxObjects, minAccuracy / 100).then(function (predictions) {
        // Remove any highlighting we did previous frame.
        for (let i = 0; i < children.length; i++) {
            parentView.removeChild(children[i]);
        }
        children.splice(0);

        let currentSet = new Set();
        let currentMap = new Map();

        // console.log(mapX);
        // console.log('Map y coord of 50', mapY(50));

        // they have a high confidence score.
        for (let n = 0; n < predictions.length; n++) {

            const scoreNice = Math.round(parseFloat(predictions[n].score) * 100)

            // If we are over 66% sure we are sure we classified it right, draw it!
            let predClassUpdated = undefined;
            if (scoreNice >= minAccuracy) {
                const predClass = predictions[n].class;
                if (currentSet.has(predClass)) {
                    predClassUpdated = `${predClass}(${currentMap.get(predClass)})`
                    currentMap.set(predClass, currentMap.get(predClass) + 1);
                    currentSet.add(predClassUpdated);
                } else {
                    currentSet.add(predClass);
                    currentMap.set(predClass, 2);
                }


                // console.log(predictions[n]);
                const p = document.createElement('p');
                // p.innerText = (predClassUpdated ?? predClass) + ' - with ' +
                //     Math.round(parseFloat(predictions[n].score) * 100) +
                //     '% confidence.';
                p.classList.add('highlighter-header')
                p.textContent = `${predClassUpdated ?? predClass} - With ${scoreNice} % Confidence`

                // Draw in top left of bounding box outline.
                p.style.left = `${mapX(predictions[n].bbox[0])}px`;
                p.style.top = `${mapY(predictions[n].bbox[1])}px`
                p.style.minWidth = `${mapX(predictions[n].bbox[2])}px`;

                // Draw the actual bounding box.
                const highlighter = document.createElement('div');
                highlighter.setAttribute('class', 'highlighter');
                highlighter.style.left = `${mapX(predictions[n].bbox[0])}px`;
                highlighter.style.top = `${mapY(predictions[n].bbox[1])}px`;
                highlighter.style.width = `${mapX(predictions[n].bbox[2])}px`;
                highlighter.style.height = `${mapY(predictions[n].bbox[3])}px`;
    
                if (xy == 0) {
                    console.log('Bounding box is ', predictions[n]);
                    console.log('Mapped[0]', mapX(predictions[n].bbox[0]))
                    console.log('Mapped[1]', mapY(predictions[n].bbox[1]))
                    console.log('Mapped[2]', mapX(predictions[n].bbox[2]))
                    console.log('Mapped[3]', mapY(predictions[n].bbox[3]))
                }
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

                const listItemsCurrent = [...streamObjectsIdentifiedList.children];

                if (predClassUpdated !== undefined && !objectsSet.has(predClassUpdated)) {
                    const li = document.createElement('li');
                    li.textContent = `${predClassUpdated} - Highest Accuracy Rate Seen: ${scoreNice}%`;
                    li.classList.add('object-identified-li');
                    li.dataset.rate = scoreNice;
                    li.dataset.name = predClassUpdated;
                    streamObjectsIdentifiedList.append(li);
                    objectsSet.add(predClassUpdated);
                    li.style.background = background;
                } else if (predClass !== undefined && !objectsSet.has(predClass)) {
                    const li = document.createElement('li');
                    li.classList.add('object-identified-li')
                    li.textContent = `${predClass} - Highest Accuracy Rate Seen: ${scoreNice}%`;
                    li.dataset.name = predClass;
                    streamObjectsIdentifiedList.append(li);
                    objectsSet.add(predClass);
                    li.style.background = background;
                    li.dataset.rate = scoreNice;
                } else {
                    listItemsCurrent.forEach(el => {
                        if (el.dataset.name === predClass || el.dataset.name === predClassUpdated) {
                            if (scoreNice >= el.dataset.rate) {
                                el.style.background = background;
                                el.textContent = `${el.dataset.name} - Highest Accuracy Rate Seen - ${scoreNice}`
                            }
                            el.dataset.rate = Math.max(el.dataset.rate, scoreNice);
                        }
                    })
                }

                xy++;
                parentView.appendChild(highlighter);
                parentView.appendChild(p);

                // Store drawn objects in memory so we can delete them next time around.
                children.push(highlighter);
                children.push(p);
            }
            const listItems = [...streamObjectsIdentifiedList.children];
            
            listItemsSorted = listItems.sort((el1, el2) => el2.dataset.rate - el1.dataset.rate);
            streamObjectsIdentifiedList.innerHTML = '';
            listItemsSorted.forEach(el => {
                streamObjectsIdentifiedList.appendChild(el);
            })
        }

        // Call this function again to keep predicting when the browser is ready.
        requestId = window.requestAnimationFrame(() => predictWebcam(videoElement, parentView, objectList, mapX, mapY));
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


let prevTab = 'streamer-container';
function openTab(evt, cityName) {
    console.log('open tab');
    // Declare all variables
    var i, tabcontent, tablinks;
  
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].classList.remove('active');
    }
  
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    if (prevTab !== cityName) {
        clearObjectList();
    }
    document.querySelectorAll(`.${prevTab}-el`).forEach(el => {
        el.classList.remove('visible');
    });

    prevTab = cityName;
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(cityName).classList.add('active');

    
    evt.currentTarget.className += " active";


    document.querySelectorAll(`.${cityName}-el`).forEach(el => {
        el.classList.add('visible');
    });

  }


  function clearObjectList() {
      streamObjectsIdentifiedList.innerHTML = '';
      [...document.querySelectorAll('.highlighter'), ...document.querySelectorAll('.highlighter-header')].forEach(el => {
          el.parentElement.removeChild(el);
      });
      children = [];
      objectsSet = new Set();
      if (prevTab === 'streamer-container') {
          disableCam();
      }
  }

  clearListBtn.addEventListener('click', () => {
    streamObjectsIdentifiedList.innerHTML = '';
  })

  document.getElementById("defaultOpen").click();
