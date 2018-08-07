"use strict";

Date.prototype.getWeek = function() {
    const ONEJAN = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - ONEJAN) / 86400000) + ONEJAN.getDay() + 1) / 7);
};

const NAVIGATION_BUTTONS = document.getElementsByClassName("navButton");
const MOBILE_NAV_BUTTONS = document.getElementsByClassName("mobileNavButton");
const NAVIGATION_BUTTONS_LENGTH = NAVIGATION_BUTTONS.length;
const CONTENT_IFRAME = document.getElementById("contentIframe");
const PAGE_TITLE = document.getElementById("titleName");
const DATE = new Date();
let scheduleInit = false;
let firstScheduleLoad = true;
let orientationPortrait;
let slideout;

createSlideout();
checkOrientation();

document.getElementById("hamburgerSvg").addEventListener("click", () => {
    slideout.toggle();
});

window.onresize = () => {
    checkOrientation();
    viewSchedule(true, false);
};

for (let i = 0; i < NAVIGATION_BUTTONS_LENGTH; i++) {
    NAVIGATION_BUTTONS[i].addEventListener("click", () => {
        loadPage(i);
    });
    MOBILE_NAV_BUTTONS[i].addEventListener("click", () => {
        loadPage(i);
        slideout.close();
    });
}

async function createSlideout() {
    const slideoutMenu = document.getElementById("hiddenMenu");
    const hamburgerMenu = document.getElementById("hamburgerSvg");
    slideoutMenu.classList.remove("slideout-menu-right");
    slideoutMenu.classList.remove("slideout-menu-left");
    if (localStorage.getItem("slideoutSide") === null || localStorage.getItem("slideoutSide") === "left") {
        slideout = new Slideout({
            "panel": document.getElementById("panel"),
            "menu": document.getElementById("hiddenMenu"),
            "padding": 256,
            "tolerance": 0
        });
        hamburgerMenu.style.marginLeft = "5%";
    } else {
        slideout = new Slideout({
            "panel": document.getElementById("panel"),
            "menu": document.getElementById("hiddenMenu"),
            "padding": 256,
            "tolerance": 0,
            "side": "right"
        });
        hamburgerMenu.style.marginLeft = "90%";
    }
    await sleep(500);
    hamburgerMenu.style.transition = "0.5s";
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function resetPreferences() {
    if (confirm("Är du säker?")) {
        sessionStorage.clear();
        localStorage.clear();
        location.reload();
    }
}

function checkOrientation() {
    if (window.innerWidth > 768) {
        slideout.close();
        orientationPortrait = false;
    } else {
        orientationPortrait = true;
    }
}

function showSnackbar(text) {
    const SNACKBAR = document.getElementById("snackbar");
    if (SNACKBAR.className.includes("show")) {
        SNACKBAR.innerHTML = text;
        return;
    }
    SNACKBAR.innerHTML = text;
    SNACKBAR.className = "show";
    setTimeout(() => {
        SNACKBAR.className = SNACKBAR.className.replace("show", "");
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
            CONTENT_IFRAME.src = "html/etc.html";
            PAGE_TITLE.innerHTML = "Övrigt - Berzan.js";
            break;
        case 3:
            loadSettings();
            break;
        case 4:
            CONTENT_IFRAME.src = "html/about.html";
            PAGE_TITLE.innerHTML = "Om - Berzan.js";
            break;
        default:
            if (typeof page === "string") {
                CONTENT_IFRAME.src = page;
            } else {
                loadPage(0);
            }
            return;
    }
    for (let i = 0; i < NAVIGATION_BUTTONS_LENGTH; i++) {
        if (i !== page) {
            MOBILE_NAV_BUTTONS[i].removeAttribute("style");
            NAVIGATION_BUTTONS[i].removeAttribute("style");
        }
    }
    MOBILE_NAV_BUTTONS[page].style.backgroundColor = "#00000066";
    NAVIGATION_BUTTONS[page].style.textShadow = "0 0 8px #FFF";
    sessionStorage.setItem("currentPage", page.toString());
}

function loadSchedulePage() {
    CONTENT_IFRAME.src = "html/schedule.html";
    PAGE_TITLE.innerHTML = "Schema - Berzan.js";
    sessionStorage.setItem("inputField0", DATE.getWeek());
    CONTENT_IFRAME.onload = () => {
        const IFRAME_DOCUMENT = CONTENT_IFRAME.contentDocument || CONTENT_IFRAME.contentWindow.document;
        const INPUT_FIELDS = IFRAME_DOCUMENT.getElementsByClassName("inputField");
        const SEARCH_BUTTON = IFRAME_DOCUMENT.getElementById("searchClass");
        const DAY_DROPDOWN = IFRAME_DOCUMENT.getElementById("dayDropdown");

        for (let i = 0; i < INPUT_FIELDS.length; i++) {
            if (sessionStorage.getItem("inputField" + i)) INPUT_FIELDS[i].value = sessionStorage.getItem("inputField" + i);
        }
        
        if (firstScheduleLoad && localStorage.getItem("defaultClass")) {
            INPUT_FIELDS[1].value = localStorage.getItem("defaultClass");
            firstScheduleLoad = false;
        }
        
        if (orientationPortrait) {
            SEARCH_BUTTON.innerHTML = "Visa";
        } else {
            SEARCH_BUTTON.innerHTML = "Visa schema";
        }

        INPUT_FIELDS[0].onchange = function() {
            viewSchedule(true);
        };

        DAY_DROPDOWN.onchange = function() {
            scheduleInit = true;
            viewSchedule(true);
        };
        
        SEARCH_BUTTON.addEventListener("click", function() {
            scheduleInit = true;
            viewSchedule(true);
        });

        for (let i = 0; i < INPUT_FIELDS.length; i++) {
            INPUT_FIELDS[i].addEventListener("keydown", (event) => {
                if (event.key === "Enter") {
                    scheduleInit = true;
                    viewSchedule(true);
                }
            });

            INPUT_FIELDS[i].addEventListener("blur", () => {
                sessionStorage.setItem("inputField" + i, INPUT_FIELDS[i].value);
            });
        }

        if (orientationPortrait) {
            if (DATE.getDay() < 6) {
                DAY_DROPDOWN.selectedIndex = DATE.getDay() === 0 ? 1 : DATE.getDay();
            } else {
                DAY_DROPDOWN.selectedIndex = 1;
            }
        } else {
            DAY_DROPDOWN.selectedIndex = 0;
        }
        
        setTimeout(() => {
            if (INPUT_FIELDS[1].value.length !== 0) {
                scheduleInit = true;
                viewSchedule(true);
                sessionStorage.setItem("inputField1", INPUT_FIELDS[1].value);
            }
        }, 0);
    };
}

function viewSchedule(clickInit = false, prompt = true) {
    if (scheduleInit === false) return;
    const IFRAME_DOCUMENT = CONTENT_IFRAME.contentDocument || CONTENT_IFRAME.contentWindow.document;
    const WEEK_INPUT_FIELD = IFRAME_DOCUMENT.getElementById("weekNumberField");
    const CLASS_INPUT_FIELD = IFRAME_DOCUMENT.getElementById("classNameField");
    const DAY_DROPDOWN = IFRAME_DOCUMENT.getElementById("dayDropdown");
    const SCHEDULE = IFRAME_DOCUMENT.getElementById("schedule");
    let currentWeek = WEEK_INPUT_FIELD.value;
    let weekDay;
    let className;

    switch(DAY_DROPDOWN.selectedIndex) {
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

    if (currentWeek === "") currentWeek = DATE.getWeek();
    if (clickInit) className = CLASS_INPUT_FIELD.value;
    
    if (className === "åsna") {
        loadPage("https://www.youtube.com/embed/L_jWHffIx5E");
        return;
    }

    if (className.length > 0) {
        SCHEDULE.src = `http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=${localStorage.getItem("scheduleFiletype")}&schoolid=89920/sv-se&type=-1&id=${className}&period=&week=${currentWeek}&mode=0&printer=0&colors=32&head=0&clock=0&foot=0&day=${weekDay}&width=${window.innerWidth}&height=${window.innerHeight}`;
        SCHEDULE.onload = () => {
            CONTENT_IFRAME.height = (CONTENT_IFRAME.contentWindow.document.body.scrollHeight + 5) + "vh";
            //iframeDocument.getElementById("iframePanel").createElement
            IFRAME_DOCUMENT.getElementById("schedule").style.display = "block";
        }
    } else if (prompt === true) {
        showSnackbar("Välj en klass först");
        return;
    }

    if (!(localStorage.getItem("defaultClass"))) {
        localStorage.setItem("defaultClass", CLASS_INPUT_FIELD.value);
    }
}

function loadLunchPage() {
    CONTENT_IFRAME.src = "https://skolmaten.se/berzeliusskolan";
    PAGE_TITLE.innerHTML = "Lunch - Berzan.js";
    //fetch("https://skolmaten.se/berzeliusskolan/?fmt=json").then(response => response.json().then(obj => console.log(obj)));
}

function loadSettings() {
    CONTENT_IFRAME.src = "html/settings.html";
    PAGE_TITLE.innerHTML = "Inställningar - Berzan.js";
    CONTENT_IFRAME.onload = () => {
        const IFRAME_DOCUMENT = CONTENT_IFRAME.contentDocument || CONTENT_IFRAME.contentWindow.document;
        const CHANGE_STARTPAGE_BUTTONS = IFRAME_DOCUMENT.getElementsByClassName("startPagePicker");
        const CLASS_SAVE_FIELD = IFRAME_DOCUMENT.getElementById("defaultClass");
        const CHANGE_FILETYPE_BUTTONS = IFRAME_DOCUMENT.getElementsByClassName("filetypePicker");
        const CHANGE_SLIDEOUT_SIDE_BUTTONS = IFRAME_DOCUMENT.getElementsByClassName("slideoutSidePicker");

        for (let i = 0; i < CHANGE_STARTPAGE_BUTTONS.length; i++) {
            CHANGE_STARTPAGE_BUTTONS[i].addEventListener("click", function() {
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

        for (let i = 0; i < CHANGE_FILETYPE_BUTTONS.length; i++) {
            CHANGE_FILETYPE_BUTTONS[i].addEventListener("click", function() {
                switch (i) {
                    case 0:
                        localStorage.setItem("scheduleFiletype", "png");
                        showSnackbar("Schemat laddas nu som PNG");
                        break;
                    case 1:
                        localStorage.setItem("scheduleFiletype", "gif");
                        showSnackbar("Schemat laddas nu som GIF");
                        break;
                }
            });
        }

        for (let i = 0; i < CHANGE_SLIDEOUT_SIDE_BUTTONS.length; i++) {
            CHANGE_SLIDEOUT_SIDE_BUTTONS[i].addEventListener("click", function() {
                switch (i) {
                    case 0:
                        localStorage.setItem("slideoutSide", "left");
                        slideout.destroy();
                        createSlideout();
                        showSnackbar("Mobilmenyn flyttad till vänster");
                        break;
                    case 1:
                        localStorage.setItem("slideoutSide", "right");
                        slideout.destroy();
                        createSlideout();
                        showSnackbar("Mobilmenyn flyttad till höger");
                        break;
                }
            });
        }

        function saveDefaultClass() {
            if (CLASS_SAVE_FIELD.value.length > 0) {
                localStorage.setItem("defaultClass", CLASS_SAVE_FIELD.value);
                showSnackbar(CLASS_SAVE_FIELD.value + " sparad som standardklass");
            } else {
                localStorage.removeItem("defaultClass");
                showSnackbar("Standardklass borttagen");
            }
        }

        CLASS_SAVE_FIELD.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                saveDefaultClass();
            }
        });

        IFRAME_DOCUMENT.getElementById("saveButtonThingy").addEventListener("click", () => {
            saveDefaultClass();
        });

        IFRAME_DOCUMENT.getElementById("resetButton").addEventListener("click", () => {
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

if (localStorage.getItem("scheduleFiletype") !== "png" || localStorage.getItem("scheduleFiletype") !== "gif") {
    localStorage.setItem("scheduleFiletype", "png");
}

document.getElementById("splashScreen").style.display = "none";
if (location.protocol !== "https:") console.log("[Berzan.js] Jag skulle uppskatta om ni uppgraderade till HTTPS. Kan inte registrera service-workers annars. https://letsencrypt.org/getting-started/ :^)");