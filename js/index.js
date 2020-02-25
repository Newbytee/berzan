"use strict";

Date.prototype.getWeek = function() {
    const ONEJAN = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - ONEJAN) / 86400000) + ONEJAN.getDay() + 1) / 7);
};

const DEFAULT_API_URL = "https://berzanjs-api.herokuapp.com/";
const NAVIGATION_BUTTONS = document.getElementsByClassName("navButton");
const MOBILE_NAV_BUTTONS = document.getElementsByClassName("mobileNavButton");
const CONTENT_DIV = document.getElementById("wrapper");
const DATE = new Date();
const MODULES = new ModuleManager();
let allowKeyNav = true;
let scheduleInit = false;
let firstScheduleLoad = true;
let scheduleWidth;
let scheduleHeight;
let scheduleMarginLeft;
let scheduleMarginTop;
let isMobile;
let slideout;
let APIURL;

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
    
    createSlideout();
    checkDeviceType(); // Check orientation fails if slideout hasn't been created, please keep them this order
    updateServiceWorker();

    document.getElementById("hamburgerSvg").addEventListener("click", function () {
        slideout.toggle();
    });

    document.addEventListener("keypress", function (event) {
        const TAB_INDEX = parseInt(event.key);
        if (!(isNaN(TAB_INDEX)) && TAB_INDEX < NAVIGATION_BUTTONS.length + 1 && TAB_INDEX > 0 && allowKeyNav) changeTab(TAB_INDEX);
    });

    window.onresize = function () {
        checkDeviceType();
        // TODO: make schedule re-render when window is resized
    };

    for (let i = 0; i < NAVIGATION_BUTTONS.length; i++) {
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

    if (localStorage.getItem("scheduleFiletype") === null)
        localStorage.setItem("scheduleFiletype", "png");

    if (localStorage.getItem("appLanguage") === null)
        localStorage.setItem("appLanguage", "sv-se");

    if (localStorage.getItem("APIURLOverride") === null)
        localStorage.setItem("APIURLOverride", DEFAULT_API_URL);

    APIURL = localStorage.getItem("APIURLOverride");

    if (location.hostname === "berzan.netlify.com")
        document.getElementById("identity").textContent += " (Canary)";

    SPLASH_SCREEN.style.opacity = "0";
    setTimeout(function() {
        SPLASH_SCREEN.style.display = "none";
    }, 200);

    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.addEventListener("message", evnt => {
            console.log("Message received: " + evnt);
            const URI = evnt.data.URL.split("?")[0];

            console.log(URI);

            switch (evnt.data.URL) {
                case APIURL + "/schema":
                    break;
                case APIURL + "/klasser":
                    break;
                default:
                    break;
            }
        });
        console.log("[Service Worker] Installing service worker ...");
        navigator.serviceWorker.register("/sw.js").then(function(registration) {
            console.log("[Service Worker] ... done  (" + registration + ")");
        }).catch(function(error) {
            console.log("[Service Worker] ... failed (" + error + ")");
        });
    } else {
        console.log("[Service Worker] Service workers are not supported");
    }
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

function APIFetch(query) {
    return fetch(APIURL + query);
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
    } else {
        if (localStorage.getItem("slideoutWarnDisable") !== "on")
            alert("Din webbläsare tycks blockera Slideout.js, ett bibliotek Berzan.js använder. Berzan.js bör fungera ändå, men vissa saker lär vara trasiga. Testa att stäng av din adblocker (eller liknande) och se om problemet kvarstår.");
        document.getElementById("hiddenMenu").style.display = "none";
        slideout = { close() {} }
    }
}

function checkDeviceType() {
    if (window.innerWidth > 768) {
        slideout.close();
        isMobile = false;
    } else {
        isMobile = true;
    }
}

function showSnackbar(text) {
    MODULES.load("utils", function() {
        showSnackbar(text);
    });
}

function updateNeoscheduleVars() {
    if (sessionStorage.getItem("currentView") === "neoschedule") {
        const NAV_HEIGHT = document.getElementsByTagName("nav")[0].offsetHeight;
        const INPUT_FORM = document.getElementById("scheduleInputForm");
        const INPUT_FORM_HEIGHT = INPUT_FORM.offsetHeight;

        scheduleWidth = INPUT_FORM.offsetWidth;
        scheduleHeight = window.innerHeight - NAV_HEIGHT - INPUT_FORM_HEIGHT;
        scheduleMarginLeft = (INPUT_FORM.offsetWidth - window.innerWidth) / 2;
        scheduleMarginTop = NAV_HEIGHT + INPUT_FORM_HEIGHT + 10;
    }
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
            putPage("neoschedule", "Schema", setupNeoschedule);
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
                throw "Invalid argument \"" + page + "\" passed to loadPage()";
            }
            return;
    }
    for (let i = 0; i < NAVIGATION_BUTTONS.length; i++) {
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
            throw "Invalid argument passed to loadHTML()";
        }
    });
}

function createExternalPageViewer(URL) {
    MODULES.load("utils", function() {
        createExternalPageViewer(URL);
    });
}

function setupNeoschedule() {
    const SCHEDULE_INPUT_FORM = document.getElementById("scheduleInputForm");
    const INPUT_FIELDS = document.getElementsByClassName("inputField");
    const SUBMIT_BUTTON = SCHEDULE_INPUT_FORM[2];
    const DAY_DROPDOWN = SCHEDULE_INPUT_FORM[3];
    sessionStorage.setItem("inputField0", DATE.getWeek().toString());

    for (let i = 0; i < INPUT_FIELDS.length; i++) {
        if (sessionStorage.getItem("inputField" + i)) INPUT_FIELDS[i].value = sessionStorage.getItem("inputField" + i);
    }

    if (firstScheduleLoad && localStorage.getItem("defaultClass")) {
        INPUT_FIELDS[1].value = localStorage.getItem("defaultClass");
        firstScheduleLoad = false;
    }

    if (isMobile) {
        SUBMIT_BUTTON.textContent = "Visa";
        if (DATE.getDay() < 6) {
            DAY_DROPDOWN.selectedIndex = DATE.getDay() === 0 ? 1 : DATE.getDay();
        } else {
            DAY_DROPDOWN.selectedIndex = 1;
        }
    } else {
        SUBMIT_BUTTON.textContent = "Visa schema";
        DAY_DROPDOWN.selectedIndex = 0;
    }

    updateNeoscheduleVars();

    if (INPUT_FIELDS[1].value.length !== 0) {
        sessionStorage.setItem("inputField1", INPUT_FIELDS[1].value);
        handleRenderRequest(SCHEDULE_INPUT_FORM);
    }

    for (let i = 0; i < INPUT_FIELDS.length; i++) {
        INPUT_FIELDS[i].addEventListener("blur", function() {
            sessionStorage.setItem("inputField" + i, INPUT_FIELDS[i].value);
        });
    }

    SCHEDULE_INPUT_FORM.addEventListener("submit", function(evnt) {
        evnt.preventDefault();
        handleRenderRequest(SCHEDULE_INPUT_FORM);
    });
    DAY_DROPDOWN.addEventListener("change", function() {
        handleRenderRequest(SCHEDULE_INPUT_FORM);
    });
    INPUT_FIELDS[0].addEventListener("change", function() {
        handleRenderRequest(SCHEDULE_INPUT_FORM);
    });
}

function handleRenderRequest(form) {
    getScheduleJSON(form[1].value, form[0].value, form[3].selectedIndex)
        .then(scheduleJSON => {
            renderSchedule(scheduleJSON);
            if (!localStorage.getItem("defaultClass")) {
                localStorage.setItem("defaultClass", form[1].value);
            }
        })
        .catch(error => {
            showSnackbar(error);
        });
}

function renderSchedule(scheduleJSON) {
    const SCHEDULE_MOUNT = document.getElementById("scheduleMount");
    const SCHEDULE_CONTAINER = document.createElement("DIV");
    const BOXES = scheduleJSON.data.boxList;
    const TEXTS = scheduleJSON.data.textList;

    for (let i = 0; i < BOXES.length; i++) {
        const BOX = intoBox(BOXES[i]);
        SCHEDULE_CONTAINER.appendChild(BOX);
    }

    for (let i = 0; i < TEXTS.length; i++) {
        const TEXT = intoText(TEXTS[i]);
        SCHEDULE_CONTAINER.appendChild(TEXT);
    }

    SCHEDULE_MOUNT.appendChild(SCHEDULE_CONTAINER);
}

function intoBox(obj) {
    const BOX = document.createElement("DIV");
    BOX.style.position = "absolute";
    BOX.style.boxSizing = "content-box";
    BOX.style.backgroundColor = obj.bcolor;
    BOX.style.color = obj.fcolor;
    BOX.style.height = obj.height.toString() + "px";
    BOX.style.width = obj.width.toString() + "px";
    BOX.style.left = (obj.x - scheduleMarginLeft).toString() + "px";
    BOX.style.top = (obj.y + scheduleMarginTop).toString() + "px";
    BOX.style.border = "1px solid rgb(0, 0, 0)";
    return BOX;
}

function intoText(obj) {
    const TEXT = document.createElement("SPAN");
    TEXT.style.position = "absolute";
    TEXT.style.color = obj.fcolor;
    TEXT.style.fontSize = obj.fontsize.toString() + "px";
    TEXT.style.left = (obj.x - scheduleMarginLeft).toString() + "px";
    TEXT.style.top = (obj.y + scheduleMarginTop).toString() + "px";
    TEXT.textContent = obj.text;
    if (/\d+:\d+/.test(obj.text)) {
        TEXT.style.lineHeight = "1.3";
        TEXT.style.marginLeft = "0.15em";
    }
    return TEXT;
}

function getScheduleJSON(className, week, weekDay) {
    return new Promise((resolve, reject) => {
        getClassGUIDByName(className)
            .then(classGUID => {
                const query = "schema?week=" + week +
                    "&week-day=" + weekDay +
                    "&class-name=" + className +
                    "&class-guid=" + classGUID +
                    "&width=" + scheduleWidth +
                    "&height=" + scheduleHeight;

                APIFetch(query)
                    .then(scheduleResp => {
                        return scheduleResp.json();
                    })
                    .then(scheduleJSON => {
                        resolve(scheduleJSON);
                    })
                    .catch(error => {
                        reject(error);
                    });
            })
            .catch(error => reject(error));
    });
}

function getClassGUIDByName(className, retried) {
    return new Promise((resolve, reject) => {
        className = className.toLowerCase();

        getAllClassGUIDs()
            .then(classGUIDs => {
                if (classGUIDs.hasOwnProperty(className)) {
                    resolve(classGUIDs[className]);
                } else {
                    if (retried !== true) {
                        rebuildClassGUIDCache()
                            .then(() => {
                                getClassGUIDByName(className, true)
                                    .then(newClassGUID => resolve(newClassGUID))
                                    .catch(error => reject(error));
                            });
                    } else {
                        reject("Klassen hittades inte :(");
                    }
                }
            })
    });
}

async function getAllClassGUIDs() {
    const CLASSES = localStorage.getItem("classGUIDs");

    if (typeof CLASSES === "string") {
        let classGUIDObj;

        try {
            classGUIDObj = JSON.parse(CLASSES);
        } catch (error) {
            console.log("Class GUID cache invalid, rebuilding …");
            await rebuildClassGUIDCache();
            return await getAllClassGUIDs();
        }

        if (typeof classGUIDObj === "object") {
            return new Promise(resolve => resolve(classGUIDObj));
        } else {
            await rebuildClassGUIDCache();
            return await getAllClassGUIDs();
        }
    } else {
        await rebuildClassGUIDCache();
        return await getAllClassGUIDs();
    }
}

function fetchClassGUIDsFromAPI() {
    return APIFetch("klasser")
        .then(response => {
            return response.json();
        });
}

function rebuildClassGUIDCache() {
    return new Promise(resolve => {
        fetchClassGUIDsFromAPI()
            .then(class_GUIDs => {
                const NEAT_CLASS_GUIDS = getNeatClassGUIDsObject(class_GUIDs);
                localStorage.setItem("classGUIDs", JSON.stringify(NEAT_CLASS_GUIDS));
                resolve();
            });
    });
}

function getNeatClassGUIDsObject(untidyObject) {
    const untidyGroups = untidyObject.data.groups;
    const neatObject = {};

    for (let i = 0; i < untidyGroups.length; i++) {
        neatObject[untidyGroups[i].id.toLowerCase()] = untidyGroups[i].guid;
    }

    return neatObject;
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
