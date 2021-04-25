"use strict";

Date.prototype.getWeek = function() {
	// Taken from https://stackoverflow.com/a/6117889
	const date = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
	date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
	const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
	return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
};

const DEFAULT_API_URL = "https://eduprox.k11m1.eu/";
const SCHEDULE_API_PREFIX = "skola24/v0/";
const BERZAN_UNIT_GUID = "ODUzZGRmNmMtYzdiNy1mZTA3LThlMTctNzIyNDY2Mjk1Y2I2";
const SETTINGS_KEY = "berzanjsConfig";
const SVG_XMLNS = "http://www.w3.org/2000/svg";
const TIMESTAMP_PATTERN = /\d+:\d+/;
const NAVIGATION_BUTTONS = document.getElementsByClassName("navButton");
const MOBILE_NAV_BUTTONS = document.getElementsByClassName("mobileNavButton");
const CONTENT_DIV = document.getElementById("wrapper");
const DATE = new Date();
const CONFIG = new ConfigManager();
const MODULES = new ModuleManager();
let allowKeyNav = true;
let scheduleResizeTimer = null;
let scheduleInit = false;
let scheduleWidth;
let scheduleHeight;
let scheduleMarginLeft;
let scheduleMarginTop;
let storedRenderKey = null;
let isMobile;
let slideout;
let APIURL;

function ConfigManager() {
	let config = localStorage.getItem(SETTINGS_KEY);

	if (typeof config !== "string") {
		config = "{}";
	}

	try {
		this.config = JSON.parse(config);
	} catch (_) {
		this.config = {};
	}

	this.deleteVar = function(varName) {
		delete this.config[varName];
	}

	this.getVar = function(varName) {
		return this.config[varName];
	}

	this.setVar = function(varName, value) {
		this.config[varName] = value;
	}

	this.saveVars = () => {
		const configString = JSON.stringify(this.config);
		localStorage.setItem(SETTINGS_KEY, configString);
	}

	window.addEventListener("beforeunload", this.saveVars);

	this.validateVar = function(varName, value) {
		switch (varName) {
			case "defaultClass":
				const defaultClassType = typeof value;
				return defaultClassType === "string" ||
					defaultClassType === "undefined";
			case "theme":
				return value === "light" || value === "dark";
			case "scheduleColourMode":
				return value === "colourful" || value === "blackAndWhite";
			case "slideoutSide":
				return value === "left" || value === "right";
			case "slideoutWarnDisable":
				return value === "on" || value === "off";
			case "startPage":
				return value === "schedule" || value === "lunch";
			case "switchoverTime":
				const switchoverTime = this.getVar("switchoverTime");
				const switchoverTimeType = typeof switchoverTime;

				switch (switchoverTimeType) {
					case "object":
						for (const timeItem in switchoverTime) {
							if (TIMESTAMP_PATTERN.test(timeItem)) {
								return true;
							}
						}

						return false;
					case "string":
						return TIMESTAMP_PATTERN.test(switchoverTime);
					default:
						return false;
				}
			default:
				console.warn("No validation routine for var " + varName + "!");
				break;
		}
	}

	this.validateVars = function() {
		const currentTheme = this.getVar("theme");

		if (!this.validateVar("theme", currentTheme)) {
			this.setVar("theme", "light");
		}

		const scheduleColourMode = this.getVar("scheduleColourMode");

		if (!this.validateVar("scheduleColourMode", scheduleColourMode)) {
			this.setVar("scheduleColourMode", "colourful");
		}

		const slideoutSide = this.getVar("slideoutSide");

		if (!this.validateVar("slideoutSide", slideoutSide)) {
			this.setVar("slideoutSide", "left");
		}

		const slideoutWarnDisable = this.getVar("slideoutWarnDisable");

		if (!this.validateVar("slideoutWarnDisable", slideoutWarnDisable)) {
			this.setVar("slideoutWarnDisable", "off");
		}

		const startPage = this.getVar("startPage");

		if (!this.validateVar("startPage", startPage)) {
			this.setVar("startPage", "schedule")
		}

		const switchoverTime = this.getVar("switchoverTime");

		if (!this.validateVar("switchoverTime", switchoverTime)) {
			this.setVar("switchoverTime", "00:00");
		}
	}
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

	CONFIG.validateVars();

	if (CONFIG.getVar("theme") === "dark") {
		applyDarkTheme();
	}

	createSlideout();
	checkDeviceType(); // Check orientation fails if slideout hasn't been created, please keep them this order

	document.getElementById("hamburgerSvg").addEventListener("click", function() {
		slideout.toggle();
	});

	document.addEventListener("keypress", function(event) {
		const TAB_INDEX = parseInt(event.key);
		if (
			!(isNaN(TAB_INDEX)) &&
			TAB_INDEX < NAVIGATION_BUTTONS.length + 1 &&
			TAB_INDEX > 0 &&
			allowKeyNav
		) changeTab(TAB_INDEX);
	});

	window.onresize = resizeNeoschedule;

	for (let i = 0; i < NAVIGATION_BUTTONS.length; i++) {
		NAVIGATION_BUTTONS[i].addEventListener("click", function() {
			loadPage(i);
			NAVIGATION_BUTTONS[i].blur();
		});
		MOBILE_NAV_BUTTONS[i].addEventListener("click", function() {
			loadPage(i);
			slideout.close();
		});
	}

	if (sessionStorage.getItem("currentTab")) {
		loadPage(parseInt(sessionStorage.getItem("currentTab")));
	} else {
		switch (CONFIG.getVar("startPage")) {
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

	APIURL = sessionStorage.getItem("APIURLOverride") || DEFAULT_API_URL;

	if (location.hostname === "berzan.netlify.app")
		document.getElementById("identity").textContent += " (Canary)";

	SPLASH_SCREEN.style.opacity = "0";
	setTimeout(function() {
		SPLASH_SCREEN.style.display = "none";
	}, 200);

	console.info("%cNyfiken på källkoden? https://github.com/Newbytee/berzan", "font-size: 25px")

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
			console.log("[Service Worker] ... done (" + registration + ")");
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

function APIFetch(query, options = {}) {
	return fetch(APIURL + query, options);
}

function applyDarkTheme() {
	document.documentElement.style.setProperty("--normal-text-colour", "#FFF");
	document.documentElement.style.setProperty("--global-bg-colour", "#000");
	document.documentElement.style.setProperty("--invert-bg-colour", "#FFF");
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
		if (CONFIG.getVar("slideoutSide") === "left") {
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
		if (CONFIG.getVar("slideoutWarnDisable") !== "on")
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

function resizeNeoschedule() {
	checkDeviceType();

	if (sessionStorage.getItem("currentView") === "neoschedule") {
		const INPUT_FORM = document.getElementById("scheduleInputForm");
		if (scheduleResizeTimer !== null) {
			window.clearTimeout(scheduleResizeTimer);
		}
		scheduleResizeTimer = window.setTimeout(function() {
			updateNeoscheduleVars();
			if (scheduleInit) {
				handleRenderRequest(INPUT_FORM);
			}
		}, 150);
	}
}

function updateNeoscheduleVars() {
	if (sessionStorage.getItem("currentView") === "neoschedule") {
		const NAV_HEIGHT = document.getElementsByTagName("nav")[0].offsetHeight;
		const INPUT_FORM = document.getElementById("scheduleInputForm");
		const MAIN_WRAPPER_HEIGHT = document.getElementById("wrapper").offsetHeight;
		const OFFSET = 5;

		// -1 is needed to not produce scollbars for some reason
		scheduleWidth = INPUT_FORM.offsetWidth - 1;
		scheduleHeight = window.innerHeight - NAV_HEIGHT - OFFSET -
			INPUT_FORM.offsetHeight - 6;
		scheduleMarginLeft = (INPUT_FORM.offsetWidth - window.innerWidth) / 2;
		scheduleMarginTop = INPUT_FORM.offsetHeight + NAV_HEIGHT + OFFSET + 5;
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
	scheduleInit = false;

	for (let i = 0; i < INPUT_FIELDS.length; i++) {
		if (sessionStorage.getItem("inputField" + i))
			INPUT_FIELDS[i].value = sessionStorage.getItem("inputField" + i);
	}

	const defaultClass = CONFIG.getVar("defaultClass");

	if (defaultClass && INPUT_FIELDS[1].value.length === 0) {
		INPUT_FIELDS[1].value = defaultClass;
	} else {
		const scheduleMount = document.getElementById("scheduleMount");
		updateNeoscheduleVars();
		setScheduleStatusText(
			scheduleMount,
			"Välj klass för att visa ditt schema"
		);
	}

	if (isMobile) {
		SUBMIT_BUTTON.textContent = "Visa";

		const currentDay = DATE.getDay();

		if (currentDay < 6) {
			DAY_DROPDOWN.selectedIndex = currentDay === 0 ? 1 : currentDay;
		} else {
			DAY_DROPDOWN.selectedIndex = 1;
		}

		const switchoverTime = CONFIG.getVar("switchoverTime");

		const [
			switchoverHourString,
			switchoverMinuteString
		] = switchoverTime.split(":");

		const switchoverHour = parseInt(switchoverHourString);
		const switchoverMinute = parseInt(switchoverMinuteString);

		const currentHour = DATE.getHours();

		if (
			!(switchoverTime === "00:00" ||
			(switchoverHour === currentHour &&
			switchoverMinute >= DATE.getMinutes()) ||
			switchoverHour > currentHour) &&
			currentDay !== 0 &&
			currentDay !== 6
		) {
			DAY_DROPDOWN.selectedIndex++;
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
		renderIfReasonable(SCHEDULE_INPUT_FORM);
	});
	INPUT_FIELDS[0].addEventListener("change", function() {
		renderIfReasonable(SCHEDULE_INPUT_FORM);
	});
}

function renderIfReasonable(inputForm) {
	if (inputForm[1].value.length !== 0) {
		handleRenderRequest(inputForm);
	}
}

function handleRenderRequest(form) {
	const SCHEDULE_MOUNT = document.getElementById("scheduleMount");
	scheduleInit = true;

	while (SCHEDULE_MOUNT.firstChild) {
		SCHEDULE_MOUNT.firstChild.remove();
	}

	setScheduleStatusText(SCHEDULE_MOUNT, "Laddar…");

	const className = form[1].value;

	if (className.length === 0) {
		showSnackbar("Välj en klass först");
		removeScheduleStatusText(SCHEDULE_MOUNT);
		return;
	}

	getScheduleJSON(className, form[0].value, form[3].selectedIndex)
		.then(scheduleJSON => {
			if (scheduleJSON.validation.length !== 0) {
				const message = scheduleJSON.validation[0].message;
				setScheduleStatusText(SCHEDULE_MOUNT, "Något gick snett: " + message);
				return;
			}
			removeScheduleStatusText(SCHEDULE_MOUNT);
			renderSchedule(scheduleJSON, SCHEDULE_MOUNT);
			if (!CONFIG.getVar("defaultClass")) {
				CONFIG.setVar("defaultClass", form[1].value);
			}
		})
		.catch(error => {
			removeScheduleStatusText(SCHEDULE_MOUNT);
			setScheduleStatusText(SCHEDULE_MOUNT, error);
		});
}

function setScheduleStatusText(scheduleMount, text) {
	scheduleMount.style.height = scheduleHeight + "px";
	scheduleMount.style.lineHeight = scheduleHeight * 0.8 + "px";
	scheduleMount.style.fontSize = "2.5em";
	scheduleMount.style.fontWeight = "lighter";
	scheduleMount.textContent = text;
}

function removeScheduleStatusText(scheduleMount) {
	scheduleMount.textContent = "";
	scheduleMount.removeAttribute("style");
}

function renderSchedule(scheduleJsonString, scheduleMount) {
	const scheduleJson = scheduleJsonString.data;

	const scheduleSvg = document.createElementNS(SVG_XMLNS, "svg");
	scheduleSvg.setAttributeNS(null, "viewBox", "0 0 " + scheduleWidth + " " + scheduleHeight);
	scheduleSvg.setAttributeNS(null, "shape-rendering", "crispEdges");
	scheduleSvg.setAttributeNS(null, "width", scheduleWidth);
	scheduleSvg.setAttributeNS(null, "height", scheduleHeight);

	const boxes = scheduleJson.boxList;
	const lines = scheduleJson.lineList;
	const texts = scheduleJson.textList;

	for (let i = 0; i < boxes.length; i++) {
		const box = intoBox(boxes[i]);
		scheduleSvg.appendChild(box);
	}

	for (let i = 0; i < lines.length; i++) {
		const line = intoLine(lines[i]);
		scheduleSvg.appendChild(line);
	}

	for (let i = 0; i < texts.length; i++) {
		const text = intoText(texts[i]);
		scheduleSvg.appendChild(text);
	}

	scheduleMount.appendChild(scheduleSvg);
}

function intoBox(obj) {
	const box = document.createElementNS(SVG_XMLNS, "rect");
	box.style.fill = obj.bColor;
	box.style.stroke = obj.fColor;
	box.setAttributeNS(null, "height", obj.height);
	box.setAttributeNS(null, "width", obj.width);
	box.setAttributeNS(null, "x", obj.x);
	box.setAttributeNS(null, "y", obj.y);
	return box;
}

function intoLine(obj) {
	const line = document.createElementNS(SVG_XMLNS, "line");
	line.setAttributeNS(null, "x1", obj.p1x);
	line.setAttributeNS(null, "x2", obj.p2x);
	line.setAttributeNS(null, "y1", obj.p1y);
	line.setAttributeNS(null, "y2", obj.p2y);
	line.setAttributeNS(null, "stroke", obj.color);
	return line;
}

function intoText(obj) {
	const text = document.createElementNS(SVG_XMLNS, "text");
	text.style.fontSize = obj.fontsize + "px";
	text.style.fontFamily = "Open Sans";
	text.style.fill = obj.fColor;
	text.style.pointerEvents = "none";
	// Why is it necessary to add these arbitary numbers? Ask Skola24
	text.setAttributeNS(null, "x", obj.x + 1);
	text.setAttributeNS(null, "y", obj.y + 14);
	text.textContent = obj.text;
	if (obj.bold) {
		text.style.fontWeight = "bold";
	}
	if (obj.italic) {
		text.style.fontStyle = "italic";
	}
	return text;
}

function getScheduleJSON(className, week, weekDay) {
	return new Promise(async (resolve, reject) => {
		let renderKey;
		let selectionSignature;

		const requests = [ fetchSignatureFromAPI(className) ];

		if (storedRenderKey === null) {
			requests.push(fetchRenderKeyFromAPI());
		}

		try {
			const resp = await Promise.all(requests);

			selectionSignature = resp[0].data.signature;

			if (storedRenderKey === null) {
				renderKey = resp[1].data.key;
				storeRenderKey(renderKey);
			} else {
				renderKey = storedRenderKey;
			}
		} catch (error) {
			return reject(error);
		}

		const springAutumnSwitchoverWeek = 25;
		const currentYear = DATE.getFullYear();
		const selectedYear =
			DATE.getWeek() > springAutumnSwitchoverWeek &&
			week < springAutumnSwitchoverWeek ?
			currentYear + 1 : currentYear;
		// I'll explain myself:
		// If we're in Autumn term, add one year to current year if requesting
		// schedule for Spring term. I did it this way since you probably don't
		// want to see last year's Spring term during Autumn term.

		console.assert(renderKey !== null, "Render key was null");

		APIFetch(SCHEDULE_API_PREFIX + "schedule", {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: "{\"render_key\":\"" + renderKey +
				"\",\"unit_guid\":\"" + BERZAN_UNIT_GUID +
				"\",\"selection_signature\":\"" + selectionSignature +
				"\",\"width\":" + parseInt(scheduleWidth) +
				",\"height\":" + parseInt(scheduleHeight) +
				",\"black_and_white\":" + getScheduleColourMode() +
				",\"year\":" + selectedYear +
				",\"week\":" + parseInt(week) +
				",\"day\":" + parseInt(weekDay) + "}"
			}).then(scheduleResp => {
				return scheduleResp.json();
			})
			.then(scheduleJSON => {
				resolve(scheduleJSON);
			})
			.catch(error => {
				reject(error);
			});
	});
}

function storeRenderKey(renderKey) {
	storedRenderKey = renderKey;

	setTimeout(function() {
		storedRenderKey = null;
	}, 5000);
}

function getScheduleColourMode() {
	return (CONFIG.getVar("scheduleColourMode") === "blackAndWhite").toString();
}

function fetchRenderKeyFromAPI() {
	return APIFetch(SCHEDULE_API_PREFIX + "render-key")
		.then(response => {
			return response.json();
		});
}

function fetchSignatureFromAPI(to_sign) {
	return APIFetch(SCHEDULE_API_PREFIX + "signature", {
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: "\"" + to_sign + "\""
	})
	.then(response => {
		return response.json();
	});
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
