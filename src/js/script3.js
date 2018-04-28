"use strict";

Date.prototype.getWeek = function() {
    let onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

let navigationButtons = document.getElementsByClassName("navButton");
let navigationButtonsLength = navigationButtons.length;

for (let i = 0; i < navigationButtonsLength; i++) {
    navigationButtons[i].addEventListener("click", () => {
        switch(i) {
        case 0:
            //schedule
            break;
        }
    })
}

function loadPage() {
    
}

switch(localStorage.getItem("startPage")) {
case "schedule":
    loadPage()
}