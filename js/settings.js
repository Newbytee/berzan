function setupSettings() {
	const CHANGE_STARTPAGE_RADIO = document.getElementsByClassName("startPagePicker");
	const DEFAULT_CLASS_FORM = document.getElementById("defaultClassForm");
	const CHANGE_SLIDEOUT_SIDE_RADIO = document.getElementsByClassName("slideoutSidePicker");
	const SLIDEOUT_FAIL_RADIO = document.getElementsByClassName("slideoutBehaviourPicker");
	const STYLE_RADIO = document.getElementsByClassName("stylePicker");
	const DELETE_CACHES_BUTTON = document.getElementById("deleteCaches");
	const SWITCH_DAY_TIME_FORM = document.getElementById("switchDayTimeForm");

	if (typeof localStorage.getItem("defaultClass") === "string")
		DEFAULT_CLASS_FORM[0].value = localStorage.getItem("defaultClass");

	setupRadio(
		CHANGE_STARTPAGE_RADIO,
		"startPage",
		function(value) {
			switch (value) {
				case "schedule":
					showSnackbar("Startsida bytt till schema");
					break;
				case "lunch":
					showSnackbar("Startsida bytt till lunch");
					break;
			}
		}
	);
	setupRadio(
		CHANGE_SLIDEOUT_SIDE_RADIO,
		"slideoutSide",
		function(value) {
			slideout.destroy();
			createSlideout();

			switch (value) {
				case "left":
					showSnackbar("Mobilmenyn flyttad till vänster");
					break;
				case "right":
					showSnackbar("Mobilmenyn flyttad till höger");
					break;
			}
		}
	);
	setupRadio(
		SLIDEOUT_FAIL_RADIO,
		"slideoutWarnDisable"
	);
	setupRadio(
		STYLE_RADIO,
		"theme"
	);

	SWITCH_DAY_TIME_FORM
		.addEventListener("submit", saveDayTimeSwitch);

	DEFAULT_CLASS_FORM
		.addEventListener("submit", saveDefaultClass);

	DELETE_CACHES_BUTTON
		.addEventListener("click", deleteCaches);

	document.getElementById("resetButton")
		.addEventListener("click", resetPreferences);
}

function saveDefaultClass(evnt) {
	evnt.preventDefault();
	const CLASS_TEXT = evnt.target[0].value;
	if (CLASS_TEXT.length > 0) {
		localStorage.setItem("defaultClass", CLASS_TEXT);
		showSnackbar(CLASS_TEXT + " sparad som standardklass");
	} else {
		localStorage.removeItem("defaultClass");
		showSnackbar("Standardklass borttagen");
	}
}

function saveDayTimeSwitch(evnt) {
	evnt.preventDefault();
	const SETTINGS = getSettingsObj();

	SETTINGS.switchoverTime.type = "global";
	SETTINGS.switchoverTime.values.all = evnt.target[0].value;

	saveSettingsObj(SETTINGS);
	updateDateObject();
}

function setupRadio(elementsCollection, storageKey, onchangeCallback) {
	const ELEMENTS = Array.prototype.slice.call(elementsCollection);

	const VALUES = ELEMENTS.map(element => {
		return element.value;
	});

	const STORAGE_INDEX = VALUES.indexOf(
		CONFIG.getVar(storageKey));

	if (STORAGE_INDEX !== -1) {
		ELEMENTS[STORAGE_INDEX].checked = true;
	} else {
		ELEMENTS[0].checked = true;
	}

	for (let i = 0; i < ELEMENTS.length; i++) {
		const ELEMENT = ELEMENTS[i];

		ELEMENT.addEventListener("change", function() {
			CONFIG.setVar(storageKey, ELEMENT.value);

			CONFIG.saveVars();

			if (typeof onchangeCallback === "function") {
				onchangeCallback(ELEMENT.value);
			}
		})
	}
}

async function deleteCaches() {
	if (confirm("Detta kommer ta bort all cachelagrad data. Inga inställningar försvinner, men det kan ta längre tid att ladda saker eftersom allt behöver hämtas igen. Fortsätt?")) {
		await caches.keys()
			.then(keys => {
				keys.map(key => {
					caches.delete(key);
				})
			});

		reloadPage();
	}
}

function saveSettingsObj(object) {
	localStorage.setItem(SETTINGS_KEY, JSON.stringify(object));
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
		reloadPage();
	}
}

function reloadPage() {
	location.reload();
}
