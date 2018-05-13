"use strict";

Date.prototype.getWeek = function() {
    const onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};


const slideout = new Slideout({
    'panel': document.getElementById('panel'),
    'menu': document.getElementById('hiddenMenu'),
    'padding': 256,
    'tolerance': 0
});

document.getElementById("hamburgerSvg").addEventListener("click", () => {
    slideout.toggle();
});

const navigationButtons = document.getElementsByClassName("navButton");
const mobileNavButtons = document.getElementsByClassName("mobileNavButton");
const navigationButtonsLength = navigationButtons.length;
const contentIframe = document.getElementById("contentIframe");
const date = new Date();

for (let i = 0; i < navigationButtonsLength; i++) {
    navigationButtons[i].addEventListener("click", () => {
        loadPage(i);
    });
    mobileNavButtons[i].addEventListener("click", () => {
        loadPage(i);
        slideout.close();
    });
}

function loadPage(page = 0) {
    switch(page) {
        case 0:
            loadSchedulePage();
            break;
        case 1:
            loadLunchPage();
            break;
        case 2:
            contentIframe.src = "html/etc.html";
            break;
        case 3:
            loadSettings();
            break;
    }
}

function loadSchedulePage() {
    contentIframe.src = "html/schedule.html";
    contentIframe.onload = () => {
        const iframeDocument = contentIframe.contentDocument || contentIframe.contentWindow.document;
        const inputFields = iframeDocument.getElementsByClassName("inputField");
        const searchButton = iframeDocument.getElementById("searchClass");

        searchButton.addEventListener("click", () => {
            viewSchedule(true);
        });

        for (let i = 0; i < inputFields.length; i++) {
            inputFields[i].addEventListener("keydown", (event) => {
                const keyName = event.key;

                if (keyName === "Enter") {
                    viewSchedule(true);
                }
            });
        }
    };
}

function viewSchedule(clickInit = false) {
    const iframeDocument = contentIframe.contentDocument || contentIframe.contentWindow.document;
    const weekInputField = iframeDocument.getElementById("weekNumberField");
    const classInputField = iframeDocument.getElementById("classNameField");
    const schedule = iframeDocument.getElementById("schedule");
    let currentWeek;
    let className;

    try {
        currentWeek = weekInputField.value;
    } catch (e) {
        console.log(e);
    }

    if (currentWeek === "") currentWeek = date.getWeek();
    if (clickInit) className = classInputField.value;

    schedule.src = `http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=png&schoolid=89920/sv-se&type=-1&id=${className}&period=&week=${currentWeek}&mode=0&printer=0&colors=32&head=0&clock=0&foot=0&day=0&width=921&height=490`;
    schedule.onload = () => {
        contentIframe.height = (contentIframe.contentWindow.document.body.scrollHeight + 15) + "px";
    }
}

function loadLunchPage() {
    contentIframe.src = "https://skolmaten.se/berzeliusskolan";
    //fetch("https://skolmaten.se/berzeliusskolan/?fmt=json").then(response => response.json().then(obj => console.log(obj)));
}

function loadSettings() {
    contentIframe.src = "html/settings.html";
    contentIframe.onload = () => {
        const iframeDocument = contentIframe.contentDocument || contentIframe.contentWindow.document;
        const changeStartpageButtons = iframeDocument.getElementsByClassName("startPagePicker");
        
        for (let i = 0; i < changeStartpageButtons.length; i++) {
            changeStartpageButtons[i].addEventListener("click", () => {
                //TODO: add startpage-change code
            });
        }
    };
}

switch(localStorage.getItem("startPage")) {
    case "schedule":
        loadPage(0);
        break;
    case "lunch":
        loadPage(1);
        break;
    case "etc":
        loadPage(2);
        break;
    case "settings":
        loadPage(3);
        break;
    default:
        loadPage();
}