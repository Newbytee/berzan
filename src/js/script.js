'use strict';

let canvas = document.createElement("canvas"),
    canvasContext = canvas.getContext("2d");

image.onload = function () {

    canvas.width = image.width;
    canvas.height = image.height;

    canvasContext.drawImage(image, 0, 0, image.width, image.height);

    let dataURL = canvas.toDataURL();

    document.write(dataURL);

};

image.src = url;