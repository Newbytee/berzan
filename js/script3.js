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
const LANGUAGES = ["sv-se", "en-gb", "de-de", "fr-fr"];
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
    });
    MOBILE_NAV_BUTTONS[i].addEventListener("click", function() {
        loadPage(i);
        slideout.close();
    });
}

document.addEventListener("keydown", function(event) {
    const tabIndex = parseInt(event.key);
    if (!(isNaN(tabIndex)) && tabIndex < NAVIGATION_BUTTONS_LENGTH + 1 && tabIndex > 0) changeTab(tabIndex);
});

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
        slideout = new Slideout({
            "panel": document.getElementById("panel"),
            "menu": document.getElementById("hiddenMenu"),
            "padding": 256,
            "tolerance": 0
        });
        slideoutMenu.classList.remove("slideout-menu-right");
        hamburgerMenu.style.removeProperty("right");
        hamburgerMenu.style.left = "5%";
    } else {
        slideout = new Slideout({
            "panel": document.getElementById("panel"),
            "menu": document.getElementById("hiddenMenu"),
            "padding": 256,
            "tolerance": 0,
            "side": "right"
        });
        slideoutMenu.classList.remove("slideout-menu-left");
        hamburgerMenu.style.removeProperty("left");
        hamburgerMenu.style.right = "5%";
    }
}

function resetPreferences() {
    if (confirm("Är du säker?")) {
        sessionStorage.clear();
        localStorage.clear();
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.getRegistrations().then(function(registrations) {
                for(let registration of registrations) {
                    registration.unregister();
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
        SNACKBAR.innerHTML = text;
        return;
    }
    SNACKBAR.innerHTML = text;
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
    
    /*if (navigator.serviceWorker.controller) {
        console.log("[Berzan.js] Active service worker found, no need to register")
    } else {
        //Register the ServiceWorker
        navigator.serviceWorker.register("../sw.js", {
            scope: './'
        }).then(function(reg) {
            console.log("[Berzan.js] Service worker has been registered for scope: "+ reg.scope);
        });
    }
} else {
    if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then(function(registrations) {
            for(let registration of registrations) {
                registration.unregister();
            }
        });
    }
    */
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
        func();
    });
}

function loadPage(page = 0) {
    CONTENT_IFRAME.onload = null;
    
    switch(page) {
        case 0:
            putPage("html/schedule.html", "Schema", loadSchedulePage());
            break;
        case 1:
            putPage("https://skolmaten.se/berzeliusskolan", "Lunch");
            break;
        case 2:
            putPage("html/etc.html", "Övrigt");
            break;
        case 3:
            putPage("html/settings.html", "Settings", loadSettings());
            break;
        case 4:
            putPage("html/about.html", "Om");
            break;
        default:
            if (typeof page === "string") {
                CONTENT_IFRAME.src = page;
            } else {
                console.error("Invalid parameter passed to loadPage().");
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

function putPage(source, name, func) {
    CONTENT_IFRAME.src = source;
    if (name) {
        PAGE_TITLE.innerHTML = name + " - Berzan.js";
    } else {
        PAGE_TITLE.innerHTML = "Berzan.js";
    }
    if (typeof func === "function") {
        CONTENT_IFRAME.addEventListener("load", function() {
            func();
        });
    }
}

function loadSchedulePage() {
    sessionStorage.setItem("inputField0", DATE.getWeek());
    CONTENT_IFRAME.onload = function() {
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
        SCHEDULE.src = `http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=${localStorage.getItem("scheduleFiletype")}&schoolid=89920/${localStorage.getItem("appLanguage")}&type=-1&id=${className}&period=&week=${currentWeek}&mode=0&printer=0&colors=32&head=0&clock=0&foot=0&day=${weekDay}&width=${window.innerWidth}&height=${window.innerHeight}`;
        SCHEDULE.onload = function() {
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

function loadSettings() {
    CONTENT_IFRAME.onload = function() {
        const IFRAME_DOCUMENT = CONTENT_IFRAME.contentDocument || CONTENT_IFRAME.contentWindow.document;
        const CHANGE_STARTPAGE_BUTTONS = IFRAME_DOCUMENT.getElementsByClassName("startPagePicker");
        const CLASS_SAVE_FIELD = IFRAME_DOCUMENT.getElementById("defaultClass");
        const CHANGE_FILETYPE_BUTTONS = IFRAME_DOCUMENT.getElementsByClassName("filetypePicker");
        const CHANGE_SLIDEOUT_SIDE_BUTTONS = IFRAME_DOCUMENT.getElementsByClassName("slideoutSidePicker");
        const CHANGE_LANGUAGE_SELECTION = IFRAME_DOCUMENT.getElementById("languageSelection");
        const SERVICE_WORKER_SELECTION = IFRAME_DOCUMENT.getElementById("serviceWorkerSelection");
        const STYLE_SELECTION = IFRAME_DOCUMENT.getElementById("styleSelection");
        
        addToggle(STYLE_SELECTION, "newDesign", updateStyle());
        addToggle(SERVICE_WORKER_SELECTION, "serviceWorkerEnabled", updateServiceWorker());

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

        IFRAME_DOCUMENT.getElementById("saveButtonThingy").addEventListener("click", function() {
            saveDefaultClass();
        });

        IFRAME_DOCUMENT.getElementById("resetButton").addEventListener("click", function() {
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

if (localStorage.getItem("scheduleFiletype") === null) {
    localStorage.setItem("scheduleFiletype", "png");
}

if (localStorage.getItem("appLanguage") === null) {
    localStorage.setItem("appLanguage", "sv-se");
}

CONTENT_IFRAME.addEventListener("load", function() {
    let iframeDocument;
    if (CONTENT_IFRAME.src.split("/")[2] === document.location.hostname) {
        iframeDocument = CONTENT_IFRAME.contentDocument || CONTENT_IFRAME.contentWindow.document;
    } else {
        return;
    }
    const IFRAME_INPUT_FIELDS = iframeDocument.getElementsByTagName("INPUT");
    for (let i = 0; i < IFRAME_INPUT_FIELDS.length; i++) {
        IFRAME_INPUT_FIELDS[i].addEventListener("focus", function() {
            allowKeyNav = false;
        });
        IFRAME_INPUT_FIELDS[i].addEventListener("blur", function() {
            allowKeyNav = true;
        });
    }
    iframeDocument.addEventListener("keypress", function(event) {
        const tabIndex = parseInt(event.key);
        if (!(isNaN(tabIndex)) && tabIndex < NAVIGATION_BUTTONS_LENGTH + 1 && tabIndex > 0 && allowKeyNav) changeTab(tabIndex);
    });
});

document.getElementById("splashScreen").style.display = "none";
updateServiceWorker();