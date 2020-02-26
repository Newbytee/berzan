function setupSettings() {
    const CHANGE_STARTPAGE_BUTTONS = document.getElementsByClassName("startPagePicker");
    const CLASS_SAVE_FIELD = document.getElementById("defaultClass");
    const CHANGE_SLIDEOUT_SIDE_BUTTONS = document.getElementsByClassName("slideoutSidePicker");
    const STYLE_SELECTION = document.getElementById("styleSelection");
    const SLIDEOUT_FAIL_SELECTION = document.getElementById("slideoutFailWarn");

    addToggle(STYLE_SELECTION, "newDesign", updateStyle);
    addToggle(SLIDEOUT_FAIL_SELECTION, "slideoutWarnDisable");

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

    CLASS_SAVE_FIELD.addEventListener("keydown", function(event) {
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
        if (typeof func === "function")
            func();
    });
}

function resetPreferences() {
    if (confirm("Är du säker att du vill återställa dina inställningar?")) {
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
