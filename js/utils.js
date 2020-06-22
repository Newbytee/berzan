function createExternalPageViewer(URL) {
	const EXT_PAGE_IFRAME = document.createElement("IFRAME");
	EXT_PAGE_IFRAME.src = URL;
	EXT_PAGE_IFRAME.id = "contentIframe";
	CONTENT_DIV.innerHTML = "";
	CONTENT_DIV.appendChild(EXT_PAGE_IFRAME);
	sessionStorage.setItem("currentView", "~external")
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
