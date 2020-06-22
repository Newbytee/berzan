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
