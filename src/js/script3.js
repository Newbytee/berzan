"use strict";

Date.prototype.getWeek = function() {
    const onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

const navigationButtons = document.getElementsByClassName("navButton");
const navigationButtonsLength = navigationButtons.length;
const contentIframe = document.getElementById("contentIframe");
const date = new Date();

for (let i = 0; i < navigationButtonsLength; i++) {
    navigationButtons[i].addEventListener("click", () => {
        loadPage(i);
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
            contentIframe.src = "html/settings.html";
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

    schedule.src = `http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=png&schoolid=89920/sv-se&type=-1&id=${className}&period=&week=${currentWeek}&mode=0&printer=0&colors=32&head=0&clock=0&foot=0&day=0&width=921&height=490&maxwidth=921&maxheight=872`;
    schedule.onload = () => {
        contentIframe.height = (contentIframe.contentWindow.document.body.scrollHeight + 15) + "px";
    }
}

function loadLunchPage() {
    contentIframe.src = "html/lunch.html";
    fetch("https://skolmaten.se/berzeliusskolan/?fmt=json").then(response => response.json().then(obj => console.log(obj)));
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