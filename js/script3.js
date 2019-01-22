"use strict";

Date.prototype.getWeek = function() {
    const ONEJAN = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - ONEJAN) / 86400000) + ONEJAN.getDay() + 1) / 7);
};

const NAVIGATION_BUTTONS = document.getElementsByClassName("navButton");
const MOBILE_NAV_BUTTONS = document.getElementsByClassName("mobileNavButton");
const NAVIGATION_BUTTONS_LENGTH = NAVIGATION_BUTTONS.length;
const CONTENT_DIV = document.getElementById("wrapper");
const PAGE_TITLE = document.getElementById("titleName");
const SPLASH_SCREEN = document.getElementById("splashScreen");
const DATE = new Date();
const LOG = new Log();
const LANGUAGES = [ "sv-se", "en-gb", "de-de", "fr-fr" ];
let allowKeyNav = true;
let scheduleInit = false;
let firstScheduleLoad = true;
let orientationPortrait;
let slideout;

createSlideout();
checkOrientation();

document.getElementById("hamburgerSvg").addEventListener("click", function() {
    slideout.toggle();
});

window.onresize = function() {
    checkOrientation();
    viewSchedule(true, false);
};

for (let i = 0; i < NAVIGATION_BUTTONS_LENGTH; i++) {
    NAVIGATION_BUTTONS[i].addEventListener("click", function() {
        loadPage(i);
        NAVIGATION_BUTTONS[i].blur();
    });
    MOBILE_NAV_BUTTONS[i].addEventListener("click", function() {
        loadPage(i);
        slideout.close();
    });
}

document.addEventListener("keypress", function(event) {
    const tabIndex = parseInt(event.key);
    if (!(isNaN(tabIndex)) && tabIndex < NAVIGATION_BUTTONS_LENGTH + 1 && tabIndex > 0 && allowKeyNav) changeTab(tabIndex);
});

function Log() {
    this.data = [];
    
    this.generateLog = function(type, message) {
        const TMP_DATE = new Date();
        this.data.push("(" + TMP_DATE.getHours() + ":" + TMP_DATE.getMinutes() + ":" + TMP_DATE.getSeconds() + ") " + type + ": " + message);
    };
    
    this.error = function(err) {
        this.generateLog("ERROR", err);
    };
    
    this.info = function(message) {
        this.generateLog("INFO", message);
    };
    
    this.get = function() {
        return this.data;
    };
}

function AJAXRequest(URL) {
    return new Promise(function(resolve, reject) {
        const REQUEST = new XMLHttpRequest();
        REQUEST.open("GET", URL, true);
        REQUEST.onload = function() {
            resolve(REQUEST.responseText);
        };
        REQUEST.onerror = function() {
            reject(REQUEST.statusText);
        };
        REQUEST.send();
    });
}

function changeTab(tabIndex) {
    tabIndex--;
    loadPage(tabIndex);
    NAVIGATION_BUTTONS[tabIndex].classList.add("navButtonFakeHover");
    setTimeout(function() {
        NAVIGATION_BUTTONS[tabIndex].classList.remove("navButtonFakeHover");
    }, 250);
}

function createSlideout() {
    const slideoutMenu = document.getElementById("hiddenMenu");
    const hamburgerMenu = document.getElementById("hamburgerSvg");
    if (localStorage.getItem("slideoutSide") === null || localStorage.getItem("slideoutSide") === "left") {
        slideoutMenu.classList.remove("slideout-menu-right");
        hamburgerMenu.style.removeProperty("right");
        hamburgerMenu.style.left = "5%";
        slideout = new Slideout({
            "panel": document.getElementById("panel"),
            "menu": document.getElementById("hiddenMenu"),
            "padding": 256,
            "tolerance": 0
        });
    } else {
        slideoutMenu.classList.remove("slideout-menu-left");
        hamburgerMenu.style.removeProperty("left");
        hamburgerMenu.style.right = "5%";
        slideout = new Slideout({
            "panel": document.getElementById("panel"),
            "menu": document.getElementById("hiddenMenu"),
            "padding": 256,
            "tolerance": 0,
            "side": "right"
        });
    }
}

function resetPreferences() {
    if (confirm("Är du säker?")) {
        sessionStorage.clear();
        localStorage.clear();
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for (let i = 0; i < registrations.length; i++) {
                    registrations[i].unregister();
                }
            });
        }
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
        SNACKBAR.textContent = text;
        return;
    }
    SNACKBAR.textContent = text;
    SNACKBAR.className = "show";
    setTimeout(function() {
        SNACKBAR.className = SNACKBAR.className.replace("show", "");
    }, 3000);
}

function updateServiceWorker() {
    if (localStorage.getItem("serviceWorkerEnabled") === "on") {
        const DOCUMENT_HEAD = document.getElementsByTagName("HEAD");
        const SW2 = document.createElement("SCRIPT");
        SW2.setAttribute("src", "sw2.js");
        DOCUMENT_HEAD[0].appendChild(SW2);
    }
}

function updateStyle() {
    if (localStorage.getItem("newDesign") === "on") {
        const LINK_ELEMENTS = document.getElementsByTagName("LINK");
        for (let i = 0; i < LINK_ELEMENTS.length; i++) {
            if (LINK_ELEMENTS[i].getAttribute("rel") === "stylesheet" && LINK_ELEMENTS[i].getAttribute("href").search("restyle") === -1) {
                const HREF_STRING = LINK_ELEMENTS[i].getAttribute("href");
                const PATTERN_INDEX = HREF_STRING.search("style");
                let stringParts = [];
                stringParts.push(HREF_STRING.substring(0, PATTERN_INDEX));
                stringParts.push(HREF_STRING.substring(PATTERN_INDEX, HREF_STRING.length));
                LINK_ELEMENTS[i].setAttribute("href", stringParts[0] + "re" + stringParts[1]);
            }
        }
    }
}

function addToggle(element, storageKey, func) {
    element.selectedIndex = localStorage.getItem(storageKey) ? 1 : 0;
    
    element.addEventListener("change", function() {
        switch (element.selectedIndex) {
            case 0:
                localStorage.removeItem(storageKey);
                break;
            case 1:
                localStorage.setItem(storageKey, "on");
                break;
        }
        if (typeof func === "function") {
            func();
        }
    });
}

function updateNavBlocking() {
    const CONTENT_INPUT_FIELDS = document.getElementsByTagName("INPUT");
    for (let i = 0; i < CONTENT_INPUT_FIELDS.length; i++) {
        CONTENT_INPUT_FIELDS[i].addEventListener("focus", function() {
            allowKeyNav = false;
        });
        CONTENT_INPUT_FIELDS[i].addEventListener("blur", function() {
            allowKeyNav = true;
        });
    }
}

function loadPage(page = 0) {
    switch(page) {
        case 0:
            putPage("html-fragments/schedule.html", "Schema", setupSchedulePage);
            break;
        case 1:
            putPage("html-fragments/lunch.html", "Lunch");
            break;
        case 2:
            putPage("html-fragments/etc.html", "Övrigt");
            break;
        case 3:
            putPage("html-fragments/settings.html", "Inställningar", setupSettings);
            break;
        case 4:
            putPage("html-fragments/about.html", "Om");
            break;
        default:
            if (typeof page === "string") {
                createExternalPageViewer(page);
            } else {
                const MSG = "Invalid parameter \"" + page + "\" passed to loadPage()";
                LOG.error(MSG);
                throw new Error(MSG);
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

function putPage(source, name, func) {
    loadHTML(source).then(function() {
        if (name) {
            PAGE_TITLE.innerHTML = name + " - Berzan.js";
        } else {
            PAGE_TITLE.innerHTML = "Berzan.js";
        }
        if (typeof func === "function") {
            func();
        }
        updateNavBlocking();
    });
}

function loadHTML(URL) {
    return new Promise(function(resolve) {
        if (typeof URL === "string") {
            AJAXRequest(URL).then(function(requestedHTML) {
                CONTENT_DIV.innerHTML = requestedHTML;
                resolve();
            });
        } else {
            const MSG = "Invalid parameter passed to loadHTML()";
            LOG.error(MSG);
            throw new TypeError(MSG);
        }
    });
}

function createExternalPageViewer(URL) {
    const EXT_PAGE_IFRAME = document.createElement("IFRAME");
    EXT_PAGE_IFRAME.src = URL;
    EXT_PAGE_IFRAME.id = "contentIframe";
    CONTENT_DIV.innerHTML = "";
    CONTENT_DIV.appendChild(EXT_PAGE_IFRAME);
}

function setupSchedulePage() {
    sessionStorage.setItem("inputField0", DATE.getWeek());
    const INPUT_FIELDS = document.getElementsByClassName("inputField");
    const SEARCH_BUTTON = document.getElementById("searchClass");
    const DAY_DROPDOWN = document.getElementById("dayDropdown");
    const SCHEDULE = document.getElementById("schedule");

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

    INPUT_FIELDS[0].addEventListener("change", function() {
        viewSchedule(true);
    });

    DAY_DROPDOWN.onchange = function() {
        scheduleInit = true;
        viewSchedule(true);
    };
    
    SCHEDULE.addEventListener("error", function() {
        if (scheduleInit) {
            showSnackbar("Kunde inte ladda schema :(");
        }
    });
    
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

        INPUT_FIELDS[i].addEventListener("blur", function() {
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
    
    setTimeout(function() {
        if (INPUT_FIELDS[1].value.length !== 0) {
            scheduleInit = true;
            viewSchedule(true);
            sessionStorage.setItem("inputField1", INPUT_FIELDS[1].value);
        }
    }, 0);
}

function viewSchedule(clickInit = false, prompt = true) {
    if (scheduleInit === false) return;
    const WEEK_INPUT_FIELD = document.getElementById("weekNumberField");
    const CLASS_INPUT_FIELD = document.getElementById("classNameField");
    const DAY_DROPDOWN = document.getElementById("dayDropdown");
    const SCHEDULE = document.getElementById("schedule");
    let currentWeek = WEEK_INPUT_FIELD.value;
    let weekDay;
    let className;

    switch (DAY_DROPDOWN.selectedIndex) {
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
            LOG.error("DAY_DROPDOWN had an invalid index (" + DAY_DROPDOWN.selectedIndex.toString() + ").");
            break;
    }

    if (currentWeek.length === 0) currentWeek = DATE.getWeek();
    if (clickInit) className = CLASS_INPUT_FIELD.value;

    if (className.length > 0) {
        SCHEDULE.src = `http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=${localStorage.getItem("scheduleFiletype")}&schoolid=89920/${localStorage.getItem("appLanguage")}&type=-1&id=${className}&period=&week=${currentWeek}&mode=0&printer=0&colors=32&head=0&clock=0&foot=0&day=${weekDay}&width=${window.innerWidth}&height=${window.innerHeight}`;
        SCHEDULE.onload = function() {
            SCHEDULE.style.display = "block";
        };
    } else if (prompt === true) {
        showSnackbar("Välj en klass först");
        return;
    }

    if (className === "åsna") {
        loadPage("https://www.youtube.com/embed/L_jWHffIx5E");
        return;
    }

    if (className === "debug") {
        putPage("html-fragments/debug.html", "Debug", setupDebugMenu);
        return;
    }

    if (!(localStorage.getItem("defaultClass"))) {
        localStorage.setItem("defaultClass", CLASS_INPUT_FIELD.value);
    }
}

function setupSettings() {
    const CHANGE_STARTPAGE_BUTTONS = document.getElementsByClassName("startPagePicker");
    const CLASS_SAVE_FIELD = document.getElementById("defaultClass");
    const CHANGE_FILETYPE_BUTTONS = document.getElementsByClassName("filetypePicker");
    const CHANGE_SLIDEOUT_SIDE_BUTTONS = document.getElementsByClassName("slideoutSidePicker");
    const CHANGE_LANGUAGE_SELECTION = document.getElementById("languageSelection");
    const SERVICE_WORKER_SELECTION = document.getElementById("serviceWorkerSelection");
    const STYLE_SELECTION = document.getElementById("styleSelection");
    
    addToggle(STYLE_SELECTION, "newDesign", updateStyle);
    addToggle(SERVICE_WORKER_SELECTION, "serviceWorkerEnabled", updateServiceWorker);

    for (let i = 0; i < LANGUAGES.length; i++) {
        if (LANGUAGES[i] === localStorage.getItem("appLanguage")) CHANGE_LANGUAGE_SELECTION.selectedIndex = i;
    }

    CHANGE_LANGUAGE_SELECTION.addEventListener("change", function() {
        localStorage.setItem("appLanguage", LANGUAGES[CHANGE_LANGUAGE_SELECTION.selectedIndex]);
        if (LANGUAGES[CHANGE_LANGUAGE_SELECTION.selectedIndex] === "de-de") alert("Due to what seems to be a bug with Novasoftware (the provider of the schedule), when German is selected as language the schedule will frequently fail to load.");
    });

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

    document.getElementById("saveButtonThingy").addEventListener("click", function() {
        saveDefaultClass();
    });

    document.getElementById("resetButton").addEventListener("click", function() {
        resetPreferences();
    });
}

function loadDebugMenu() {
    const SET_ITEM_INPUT = document.getElementsByClassName("setItemInput");
    const SET_ITEM_BUTTON = document.getElementById("setItemButton");
    const GET_ITEM_INPUT = document.getElementById("getItemInput");
    const GET_ITEM_BUTTON = document.getElementById("getItemButton");
    const LOAD_URL_INPUT = document.getElementById("loadURLInput");
    const LOAD_URL_BUTTON = document.getElementById("loadURLButton");

    SET_ITEM_BUTTON.addEventListener("click", function() {
        localStorage.setItem(SET_ITEM_INPUT[0].value, SET_ITEM_INPUT[1].value);
    });

    GET_ITEM_BUTTON.addEventListener("click", function() {
        showSnackbar(localStorage.getItem(GET_ITEM_INPUT.value));
    });

    LOAD_URL_BUTTON.addEventListener("click", function() {
        loadPage(LOAD_URL_INPUT.value);
    });
}

function setupDebugMenu() {
    const SET_ITEM_INPUT = document.getElementsByClassName("setItemInput");
    const SET_ITEM_BUTTON = document.getElementById("setItemButton");
    const GET_ITEM_INPUT = document.getElementById("getItemInput");
    const GET_ITEM_BUTTON = document.getElementById("getItemButton");
    const LOAD_URL_INPUT = document.getElementById("loadURLInput");
    const LOAD_URL_BUTTON = document.getElementById("loadURLButton");

    SET_ITEM_BUTTON.addEventListener("click", function() {
        localStorage.setItem(SET_ITEM_INPUT[0].value, SET_ITEM_INPUT[1].value);
    });

    GET_ITEM_BUTTON.addEventListener("click", function() {
        showSnackbar(localStorage.getItem(GET_ITEM_INPUT.value));
    });

    LOAD_URL_BUTTON.addEventListener("click", function() {
        loadPage(LOAD_URL_INPUT.value);
    });
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

if (localStorage.getItem("scheduleFiletype") === null) {
    localStorage.setItem("scheduleFiletype", "png");
}

if (localStorage.getItem("appLanguage") === null) {
    localStorage.setItem("appLanguage", "sv-se");
}

SPLASH_SCREEN.style.opacity = "0";
setTimeout(function() {
    SPLASH_SCREEN.style.display = "none";
}, 200);
updateServiceWorker();