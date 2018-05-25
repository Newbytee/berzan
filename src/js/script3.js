"use strict";

Date.prototype.getWeek = function() {
    const onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

const navigationButtons = document.getElementsByClassName("navButton");
const mobileNavButtons = document.getElementsByClassName("mobileNavButton");
const navigationButtonsLength = navigationButtons.length;
const contentIframe = document.getElementById("contentIframe");
const pageTitle = document.getElementById("titleName");
const date = new Date();
let scheduleHeight = (window.innerWidth/window.innerHeight) * 1000;
let scheduleInit = false;

const slideout = new Slideout({
    "panel": document.getElementById("panel"),
    "menu": document.getElementById("hiddenMenu"),
    "padding": 256,
    "tolerance": 0
});

document.getElementById("hamburgerSvg").addEventListener("click", () => {
    slideout.toggle();
});

window.onresize = () => {
    if ((window.innerHeight/window.innerWidth) < 1) {
        slideout.close();
        scheduleHeight = 490;
    } else {
        scheduleHeight = 900;
    }
    viewSchedule(true);
};

window.onload = () => {
    if ((window.innerHeight/window.innerWidth) < 1) {
        scheduleHeight = 490;
    } else {
        scheduleHeight = 900;
    }
};

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
        case 4:
            contentIframe.src = "html/about.html";
            break;
    }
}

function loadSchedulePage() {
    contentIframe.src = "html/schedule.html";
    pageTitle.innerHTML = "Schema - Berzan";
    sessionStorage.setItem("inputField0", date.getWeek());
    contentIframe.onload = () => {
        const iframeDocument = contentIframe.contentDocument || contentIframe.contentWindow.document;
        const inputFields = iframeDocument.getElementsByClassName("inputField");
        const searchButton = iframeDocument.getElementById("searchClass");

        for (let i = 0; i < inputFields.length; i++) {
            if (sessionStorage.getItem("inputField" + i)) inputFields[i].value = sessionStorage.getItem("inputField" + i);
        }

        searchButton.addEventListener("click", () => {
            scheduleInit = true;
            viewSchedule(true);
        });

        for (let i = 0; i < inputFields.length; i++) {
            inputFields[i].addEventListener("keydown", (event) => {
                const keyName = event.key;

                if (keyName === "Enter") {
                    scheduleInit = true;
                    viewSchedule(true);
                }
            });

            inputFields[i].addEventListener("blur", () => {
                sessionStorage.setItem("inputField" + i, inputFields[i].value);
            });
        }

        if (inputFields[1].value !== "") viewSchedule(true);
    };
}

function viewSchedule(clickInit = false) {
    if (scheduleInit === false) return;
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

    schedule.src = `http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=png&schoolid=89920/sv-se&type=-1&id=${className}&period=&week=${currentWeek}&mode=0&printer=0&colors=32&head=0&clock=0&foot=0&day=0&width=921&height=${scheduleHeight}`;
    schedule.onload = () => {
        contentIframe.height = (contentIframe.contentWindow.document.body.scrollHeight + 5) + "vh";
        //iframeDocument.getElementById("iframePanel").createElement
        iframeDocument.getElementById("schedule").style.display = "block";
    }
}

function loadLunchPage() {
    contentIframe.src = "https://skolmaten.se/berzeliusskolan";
    pageTitle.innerHTML = "Lunch - Berzan";
    //fetch("https://skolmaten.se/berzeliusskolan/?fmt=json").then(response => response.json().then(obj => console.log(obj)));
}

function loadSettings() {
    contentIframe.src = "html/settings.html";
    pageTitle.innerHTML = "Inställningar - Berzan";
    contentIframe.onload = () => {
        const iframeDocument = contentIframe.contentDocument || contentIframe.contentWindow.document;
        const changeStartpageButtons = iframeDocument.getElementsByClassName("startPagePicker");
        const classSaveField = iframeDocument.getElementById("defaultClass");
        const hasSavedField = iframeDocument.getElementById("hasSaved");
        
        for (let i = 0; i < changeStartpageButtons.length; i++) {
            changeStartpageButtons[i].addEventListener("click", () => {
                switch (i) {
                    case 0:
                        localStorage.setItem("startPage", "schedule");
                        break;
                    case 1:
                        localStorage.setItem("startPage", "lunch");
                        break;
                    case 2:
                        localStorage.setItem("startPage", "etc");
                        break;
                    case 3:
                        localStorage.setItem("startPage", "settings");
                        break;
                    default:
                        localStorage.setItem("startPage", "schedule");
                        break;
                }
            });
        }

        iframeDocument.getElementById("saveButtonThingy").addEventListener("click", () => {
            localStorage.setItem("defaultClass", classSaveField.value);
            hasSavedField.innerText = "Sparat!";
            setTimeout(() => {
                hasSavedField.innerText = null;
            }, 2000);
        });
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

document.getElementById("splashScreen").style.display = "none";

if (location.protocol !== "https:") console.log("Jag skulle uppskatta om ni uppgraderade till HTTPS. Kan inte registrera service-workers annars. https://letsencrypt.org/getting-started/ :^)");