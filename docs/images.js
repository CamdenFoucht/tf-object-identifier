const fileInputs = document.querySelectorAll('.file-input');
fileInputs.forEach(input => {
  input.onchange = async (e) => {
    const [file] = input.files;
    if (file) {
      const parent = input.parentElement;
      const imgContainer = parent.querySelector('.image-upload');
      const children = [...imgContainer.children];
      children.forEach(child => {
        const tagName = child.tagName.toLowerCase();
        console.log(tagName);

        if (tagName === 'img') {
          return;
        }
        imgContainer.removeChild(child);
      })

      const img = parent.querySelector('img');
      img.src = URL.createObjectURL(file);
      img.style.display = "block";
      await new Promise(res => {
        setTimeout(res, 1000);
      })

      model.detect(img, 30, minAccuracy / 100).then(function (predictions) {
        // Lets write the predictions to a new paragraph element and
        // add it to the DOM.
        // console.log(predictions);
        console.log(predictions);
        for (let n = 0; n < predictions.length; n++) {
          // Description text
          const p = document.createElement('p');
          // console.log(predictions[n]);
          p.innerText = predictions[n].class + ' - with ' +
            Math.round(parseFloat(predictions[n].score) * 100) +
            '% confidence.';
          // Positioned at the top left of the bounding box.
          // Height is whatever the text takes up.
          // Width subtracts text padding in CSS so fits perfectly.

          p.classList.add('prediction-text')
          p.style = 'left: ' + predictions[n].bbox[0] + 'px;' +
            'top: ' + predictions[n].bbox[1] + 'px; ' +
            'min-width: ' + (predictions[n].bbox[2] - 10) + 'px;';
            
          p.style.color = '#fff';

          const highlighter = document.createElement('div');
          highlighter.setAttribute('class', 'highlighter');
          highlighter.style = 'left: ' + predictions[n].bbox[0] + 'px;' +
            'top: ' + predictions[n].bbox[1] + 'px;' +
            'width: ' + predictions[n].bbox[2] + 'px;' +
            'height: ' + predictions[n].bbox[3] + 'px;';

          imgContainer.appendChild(highlighter);
          imgContainer.appendChild(p);
        }
      });
    }
  }
})


document.querySelectorAll('.upload-img-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    btn.nextElementSibling.click();
  })
})