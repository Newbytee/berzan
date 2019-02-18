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