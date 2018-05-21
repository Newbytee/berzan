"use strict";

Date.prototype.getWeek = function() {
    const onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

const slideout = new Slideout({
    "panel": document.getElementById("panel"),
    "menu": document.getElementById("hiddenMenu"),
    "padding": 256,
    "tolerance": 0
});