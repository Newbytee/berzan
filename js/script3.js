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
let scheduleInit = false;
let firstScheduleLoad = true;

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
    resizeSchedule();
    viewSchedule(true, false);
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

function resetPreferences() {
    if (confirm("Är du säker?")) {
        sessionStorage.clear();
        localStorage.clear();
        location.reload();
    }
}

function resizeSchedule() {
    if (window.innerWidth > 768) {
        slideout.close();
    }
}

function showSnackbar(text) {
    const snackbar = document.getElementById("snackbar");
    if (snackbar.className.includes("show")) {
        snackbar.innerHTML = text;
        return;
    }
    snackbar.innerHTML = text;
    snackbar.className = "show";
    setTimeout(() => {
        snackbar.className = snackbar.className.replace("show", "");
    }, 3000);
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
            pageTitle.innerHTML = "Övrigt - Berzan.js";
            break;
        case 3:
            loadSettings();
            break;
        case 4:
            contentIframe.src = "html/about.html";
            pageTitle.innerHTML = "Om - Berzan.js";
            break;
        default:
            loadPage(0);
            return;
    }
    for (let i = 0; i < navigationButtonsLength; i++) {
        if (i !== page) {
            mobileNavButtons[i].removeAttribute("style");
            navigationButtons[i].removeAttribute("style");
        }
    }
    mobileNavButtons[page].style.backgroundColor = "#00000066";
    navigationButtons[page].style.textShadow = "0 0 8px #FFF";
    sessionStorage.setItem("currentPage", page.toString());
}

function loadSchedulePage() {
    contentIframe.src = "html/schedule.html";
    pageTitle.innerHTML = "Schema - Berzan.js";
    sessionStorage.setItem("inputField0", date.getWeek());
    contentIframe.onload = () => {
        const iframeDocument = contentIframe.contentDocument || contentIframe.contentWindow.document;
        const inputFields = iframeDocument.getElementsByClassName("inputField");
        const searchButton = iframeDocument.getElementById("searchClass");
        const dayDropdown = iframeDocument.getElementById("dayDropdown");

        for (let i = 0; i < inputFields.length; i++) {
            if (sessionStorage.getItem("inputField" + i)) inputFields[i].value = sessionStorage.getItem("inputField" + i);
        }
        
        if (firstScheduleLoad && localStorage.getItem("defaultClass")) {
            inputFields[1].value = localStorage.getItem("defaultClass");
            firstScheduleLoad = false;
        }
        
        if ((window.innerHeight/window.innerWidth) < 1) {
            searchButton.innerHTML = "Visa schema";
        } else {
            searchButton.innerHTML = "Visa";
        }

        inputFields[0].onchange = function() {
            viewSchedule(true);
        };

        dayDropdown.onchange = function() {
            scheduleInit = true;
            viewSchedule(true);
        };
        
        searchButton.addEventListener("click", function() {
            scheduleInit = true;
            viewSchedule(true);
        });

        for (let i = 0; i < inputFields.length; i++) {
            inputFields[i].addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    scheduleInit = true;
                    viewSchedule(true);
                }
            });

            inputFields[i].addEventListener("blur", () => {
                sessionStorage.setItem("inputField" + i, inputFields[i].value);
            });
        }

        if (window.innerWidth < 768) {
            if (date.getDay() < 6) {
                dayDropdown.selectedIndex = date.getDay();
            } else {
                dayDropdown.selectedIndex = 1;
            }
        } else {
            dayDropdown.selectedIndex = 0;
        }
        
        setTimeout(() => {
            if (inputFields[1].value.length !== 0) {
            scheduleInit = true;
            viewSchedule(true);
            sessionStorage.setItem("inputField1", inputFields[1].value);
            }
        }, 0);
    };
}

function viewSchedule(clickInit = false, prompt = true) {
    if (scheduleInit === false) return;
    const iframeDocument = contentIframe.contentDocument || contentIframe.contentWindow.document;
    const weekInputField = iframeDocument.getElementById("weekNumberField");
    const classInputField = iframeDocument.getElementById("classNameField");
    const dayDropdown = iframeDocument.getElementById("dayDropdown");
    const schedule = iframeDocument.getElementById("schedule");
    let currentWeek = weekInputField.value;
    let weekDay;
    let className;

    switch(dayDropdown.selectedIndex) {
        case 0:
            weekDay = 0;
            break;
        case 1:
            weekDay = 1;
            break;
        case 2:
            weekDay = 2;
            break;
        case 3:
            weekDay = 4;
            break;
        case 4:
            weekDay = 8;
            break;
        case 5:
            weekDay = 16;
            break;
        default:
            weekDay = 0;
            break;
    }

    if (currentWeek === "") currentWeek = date.getWeek();
    if (clickInit) className = classInputField.value;

    if (className.length > 0) {
        schedule.src = `http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=png&schoolid=89920/sv-se&type=-1&id=${className}&period=&week=${currentWeek}&mode=0&printer=0&colors=32&head=0&clock=0&foot=0&day=${weekDay}&width=${window.innerWidth}&height=${window.innerHeight}`;
        schedule.onload = () => {
            contentIframe.height = (contentIframe.contentWindow.document.body.scrollHeight + 5) + "vh";
            //iframeDocument.getElementById("iframePanel").createElement
            iframeDocument.getElementById("schedule").style.display = "block";
        }
    } else if (prompt === true) {
        showSnackbar("Välj en klass först");
    }
}

function loadLunchPage() {
    contentIframe.src = "https://skolmaten.se/berzeliusskolan";
    pageTitle.innerHTML = "Lunch - Berzan.js";
    //fetch("https://skolmaten.se/berzeliusskolan/?fmt=json").then(response => response.json().then(obj => console.log(obj)));
}

function loadSettings() {
    contentIframe.src = "html/settings.html";
    pageTitle.innerHTML = "Inställningar - Berzan.js";
    contentIframe.onload = () => {
        const iframeDocument = contentIframe.contentDocument || contentIframe.contentWindow.document;
        const changeStartpageButtons = iframeDocument.getElementsByClassName("startPagePicker");
        const classSaveField = iframeDocument.getElementById("defaultClass");
        
        for (let i = 0; i < changeStartpageButtons.length; i++) {
            changeStartpageButtons[i].addEventListener("click", () => {
                switch (i) {
                    case 0:
                        localStorage.setItem("startPage", "schedule");
                        showSnackbar("Startsida bytt till schema");
                        break;
                    case 1:
                        localStorage.setItem("startPage", "lunch");
                        showSnackbar("Startsida bytt till lunch");
                        break;
                    case 2:
                        localStorage.setItem("startPage", "etc");
                        showSnackbar("Startsida bytt till övrigt");
                        break;
                    default:
                        localStorage.setItem("startPage", "schedule");
                        showSnackbar("Startsida bytt till schema");
                        break;
                }
            });
        }

        function saveDefaultClass() {
            if (classSaveField.value !== "") {
                localStorage.setItem("defaultClass", classSaveField.value);
                showSnackbar(classSaveField.value + " sparad som standardklass");
            } else {
                localStorage.removeItem("defaultClass");
                showSnackbar("Standardklass borttagen");
            }
        }

        classSaveField.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                saveDefaultClass();
            }
        });

        iframeDocument.getElementById("saveButtonThingy").addEventListener("click", () => {
            saveDefaultClass();
        });

        iframeDocument.getElementById("resetButton").addEventListener("click", () => {
            resetPreferences();
        });
    };
}

if (sessionStorage.getItem("currentPage")) {
    loadPage(parseInt(sessionStorage.getItem("currentPage")));
} else {
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
}

document.getElementById("splashScreen").style.display = "none";
if (location.protocol !== "https:") console.log("[Berzan.js] Jag skulle uppskatta om ni uppgraderade till HTTPS. Kan inte registrera service-workers annars. https://letsencrypt.org/getting-started/ :^)");