"use strict";

Date.prototype.getWeek = function() {
    const ONEJAN = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - ONEJAN) / 86400000) + ONEJAN.getDay() + 1) / 7);
};

const NAVIGATION_BUTTONS = document.getElementsByClassName("navButton");
const MOBILE_NAV_BUTTONS = document.getElementsByClassName("mobileNavButton");
const NAVIGATION_BUTTONS_LENGTH = NAVIGATION_BUTTONS.length;
const CONTENT_DIV = document.getElementById("wrapper");
const DATE = new Date();
const LOG = new Log();
const MODULES = new ModuleManager();
let allowKeyNav = true;
let scheduleInit = false;
let firstScheduleLoad = true;
let orientationPortrait;
let slideout;

function Log() {
    this.data = [];
    
    this.generateLog = function(type, message) {
        const TMP_DATE = new Date();
        this.data.push("(" + TMP_DATE.getHours() + ":" + TMP_DATE.getMinutes() + ":" + TMP_DATE.getSeconds() + ") " + type + ": " + message);
    };
    
    this.error = function(err) {
        this.generateLog("ERROR", err);
        return err; // Return the message for easy throwing of error
    };
    
    this.typeError = function(varname, type, expectedType) {
        return this.error(varname + " was " + type + ", expected " + expectedType);
    };
    
    this.info = function(message) {
        this.generateLog("INFO", message);
    };
    
    this.get = function() {
        return this.data;
    };
}

function ModuleManager() {
    this.modules = document.getElementById("modules");
    
    this.load = function(name, callback) {
        const PATH = "js/" + name + ".js";
        
        for (let i = 0; i < this.modules.children.length; i++) {
            if (this.modules.children[i].src.endsWith(PATH))
                return; // Module is already loaded, so return
        }
        
        const SCRIPT = document.createElement("SCRIPT");
        SCRIPT.onload = callback;
        SCRIPT.src = PATH;
    
        this.modules.appendChild(SCRIPT);
    };
}

function init() {
    const SPLASH_SCREEN = document.getElementById("splashScreen");
    
    if (createSlideout()) {
        checkOrientation(); // Check orientation fails if slideout hasn't been created, please keep them this order
        updateServiceWorker();

        document.getElementById("hamburgerSvg").addEventListener("click", function () {
            slideout.toggle();
        });

        document.addEventListener("keypress", function (event) {
            const tabIndex = parseInt(event.key);
            if (!(isNaN(tabIndex)) && tabIndex < NAVIGATION_BUTTONS_LENGTH + 1 && tabIndex > 0 && allowKeyNav) changeTab(tabIndex);
        });

        window.onresize = function () {
            checkOrientation();
            if (sessionStorage.getItem("currentView") === "schedule") {
                viewSchedule(false);
            }
        };

        for (let i = 0; i < NAVIGATION_BUTTONS_LENGTH; i++) {
            NAVIGATION_BUTTONS[i].addEventListener("click", function () {
                loadPage(i);
                NAVIGATION_BUTTONS[i].blur();
            });
            MOBILE_NAV_BUTTONS[i].addEventListener("click", function () {
                loadPage(i);
                slideout.close();
            });
        }

        if (sessionStorage.getItem("currentTab")) {
            loadPage(parseInt(sessionStorage.getItem("currentTab")));
        } else {
            switch (localStorage.getItem("startPage")) {
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
                    loadPage(0);
                    break;
            }
        }
    } else {
        loadHTML("views/emergency.html");
        console.error("Failed to create instance of Slideout! Is the resource blocked?");
        document.getElementById("hiddenMenu").style.display = "none";
    }

    if (localStorage.getItem("scheduleFiletype") === null)
        localStorage.setItem("scheduleFiletype", "png");

    if (localStorage.getItem("appLanguage") === null)
        localStorage.setItem("appLanguage", "sv-se");

    if (location.hostname === "berzan.netlify.com")
        document.getElementById("identity").textContent += " (Canary)";

    SPLASH_SCREEN.style.opacity = "0";
    setTimeout(function() {
        SPLASH_SCREEN.style.display = "none";
    }, 200);
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
    if (window["Slideout"]) {
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

        return true;
    } else {
        return false;
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
    MODULES.load("utils", function() {
        showSnackbar(text);
    });
}

function updateServiceWorker() {
    if (localStorage.getItem("serviceWorkerEnabled") === "on") {
        const DOCUMENT_HEAD = document.getElementsByTagName("HEAD");
        const SW2 = document.createElement("SCRIPT");
        SW2.setAttribute("src", "sw2.js");
        DOCUMENT_HEAD[0].appendChild(SW2);
    }
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

function loadPage(page) {
    switch(page) {
        case 0:
            putPage("schedule", "Schema", setupSchedulePage);
            break;
        case 1:
            putPage("lunch", "Lunch");
            break;
        case 2:
            putPage("etc", "Övrigt");
            break;
        case 3:
            putPage("settings", "Inställningar", setupSettings);
            break;
        case 4:
            putPage("about", "Om");
            break;
        default:
            if (typeof page === "string") {
                createExternalPageViewer(page);
            } else {
                throw LOG.error("Invalid parameter \"" + page + "\" passed to loadPage()");
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
    sessionStorage.setItem("currentTab", page.toString());
}

function putPage(source, name, func) {
    const PAGE_TITLE = document.getElementById("titleName");

    loadHTML("views/" + source + ".html").then(function() {
        if (name) {
            PAGE_TITLE.innerHTML = name + " - Berzan.js";
        } else {
            PAGE_TITLE.innerHTML = "Berzan.js";
        }
        if (typeof func === "function")
            func();
        updateNavBlocking();
    });
    sessionStorage.setItem("currentView", source);
}

function loadHTML(URL) {
    return new Promise(function(resolve) {
        if (typeof URL === "string") {
            AJAXRequest(URL).then(function(requestedHTML) {
                CONTENT_DIV.innerHTML = requestedHTML;
                resolve();
            });
        } else {
            throw LOG.error("Invalid parameter passed to loadHTML()");
        }
    });
}

function createExternalPageViewer(URL) {
    MODULES.load("utils", function() {
        createExternalPageViewer(URL);
    });
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
        viewSchedule();
    });

    DAY_DROPDOWN.onchange = function() {
        scheduleInit = true;
        viewSchedule();
    };
    
    SCHEDULE.addEventListener("error", function() {
        if (scheduleInit)
            showSnackbar("Kunde inte ladda schema :(");
    });
    
    SEARCH_BUTTON.addEventListener("click", function() {
        scheduleInit = true;
        viewSchedule();
    });

    for (let i = 0; i < INPUT_FIELDS.length; i++) {
        INPUT_FIELDS[i].addEventListener("keydown", function(event) {
            if (event.key === "Enter") {
                scheduleInit = true;
                viewSchedule();
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
    
    if (INPUT_FIELDS[1].value.length !== 0) {
        scheduleInit = true;
        viewSchedule();
        sessionStorage.setItem("inputField1", INPUT_FIELDS[1].value);
    }
}

function viewSchedule(prompt) {
    if (scheduleInit === false) return;
    if (typeof prompt === "undefined") prompt = true;
    const WEEK_INPUT_FIELD = document.getElementById("weekNumberField");
    const CLASS_INPUT_FIELD = document.getElementById("classNameField");
    const DAY_DROPDOWN = document.getElementById("dayDropdown");
    const SCHEDULE = document.getElementById("schedule");
    let currentWeek = WEEK_INPUT_FIELD.value;
    let className = CLASS_INPUT_FIELD.value;
    let weekDay;

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

    if (className.length > 0) {
        SCHEDULE.onload = function() {
            SCHEDULE.style.display = "block";
        };
        SCHEDULE.src = getScheduleURL(className, currentWeek, weekDay.toString(), localStorage.getItem("appLanguage"), localStorage.getItem("scheduleFiletype"));
    } else if (prompt === true) {
        showSnackbar("Välj en klass först");
        return;
    }

    if (className === "åsna") {
        loadPage("https://www.youtube.com/embed/L_jWHffIx5E");
        return;
    }

    if (className === "debug") {
        putPage("debug", "Debug", setupDebugMenu);
        return;
    }

    if (!(localStorage.getItem("defaultClass")))
        localStorage.setItem("defaultClass", CLASS_INPUT_FIELD.value);
}

function getScheduleURL(className, week, weekDay, language, filetype) {
    if (typeof filetype !== "string")
        throw LOG.typeError("filetype", typeof filetype, "string");
    
    if (typeof language !== "string")
        throw LOG.typeError("language", typeof language, "string");
    
    if (typeof weekDay !== "string")
        throw LOG.typeError("weekDay", typeof weekDay, "string");
    
    if (typeof week !== "string")
        throw LOG.typeError("week", typeof week, "string.");
    
    if (typeof className !== "string")
        throw LOG.typeError("className", typeof className,"expected string.");
    
    return "http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=" + filetype + "&schoolid=89920/" + language + "&type=-1&id=" + className + "&period=&week=" + week + "&mode=0&printer=0&colors=32&head=0&clock=0&foot=0&day=" + weekDay + "&width=" + window.innerWidth + "&height=" + window.innerHeight;
}

function setupSettings() {
    MODULES.load("settings", function() {
        setupSettings();
    });
}

function setupDebugMenu() {
    MODULES.load("debugMenu", function() {
        setupDebugMenu();
    });
}

init();
