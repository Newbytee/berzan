"use strict";

Date.prototype.getWeek = function() {
    let onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

let navigationButtons = document.getElementsByClassName("navButton");
let navigationButtonsLength = navigationButtons.length;
let contentIframe = document.getElementById("contentIframe");

for (let i = 0; i < navigationButtonsLength; i++) {
    navigationButtons[i].addEventListener("click", () => {
        loadPage(i);
    });
}

function loadPage(page = 0) {
    switch (page) {
        case 0:
            contentIframe.src = "html/schedule.html";
            break;
        case 1:
            contentIframe.src = "html/lunch.html";
            break;
        case 2:
            contentIframe.src = "html/etc.html";
            break;
        case 3:
            contentIframe.src = "html/settings.html";
            break;
    }
}

switch(localStorage.getItem("startPage")) {
    case "schedule":
        loadPage(0);
        break;
    case "lunch":
        loadPage(1);
        break;
}