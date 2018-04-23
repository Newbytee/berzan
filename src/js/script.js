'use strict';

Date.prototype.getWeek = function() {
    let onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

let iframeContent = document.getElementById("contentIframe");
let firstLoad = true;
let date = new Date();
let currentPage;
let className = "Te16G";
let day = date.getDay();
let week = date.getWeek();
let url;
let titleName = document.getElementById("titleName");
let navigationButtons = document.getElementsByClassName("navButton");
let contentPages = document.getElementsByClassName("contentPage");
let nNavigationButtons = navigationButtons.length;
let nContentPages = contentPages.length;

for (let i = 0; i < nNavigationButtons; i++) {

    navigationButtons[i].addEventListener("click", function() {

        alert("hi");
        //open settings

    });

}

viewScheduleButton.addEventListener("click", function() {
    
    changeSchedule();
    
});

if (!(localStorage.getItem("favouritePage") === null)) {
    
    currentPage = Number(localStorage.getItem("favouritePage"));
    
} else {
    
    currentPage = 0;
    
}

if (!(localStorage.getItem("savedClassName") === null)) {
    
    className = localStorage.getItem("savedClassName");
    
} else {

    //replace with something less intrusive later    
    alert("Du har inte ställt in en standardklass att visa, detta kan göras i inställningarna");

}

function changeSchedule() {

    try {
        
        week = viewScheduleWeekField.value;
        
    } catch (e) {
        
        console.log(e);
        
    }
    
    if (week === "") week = date.getWeek();
    
    if (!(firstLoad)) {
        
        className = viewScheduleField.value;
        
    } else {
        
        firstLoad = false;
        
    }
    
    url = "http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=png&schoolid=89920/sv-se&id=" + className + "&period=&week=" + week + "&colors=32&day=0&width=" + "1000" + "&height=" + "1000" + "";
    schedule.src = url;

}

function changePage(pageNumber) {
    
    let stateObj = { foo: "bar" };
    
    switch (pageNumber) {
        
        case 0:
            history.pushState(stateObj, "Schema", "schedule.html");
            titleName.innerHTML = "Schema";
            drawPage(0);
            break;
        case 1:
            history.pushState(stateObj, "Inställningar", "settings.html");
            titleName.innerHTML = "Inställningar";
            drawPage(1);
            break;
        
    }
    
}

function drawPage(number) {
    
    for (let i = 0; i < nContentPages; i++) {
        
        contentPages[i].style.display = (i === number ? "block" : "none");
        
    }
    
}

function loadPage(number) {
    
    let iframeDocument = iframeContent.contentDocument || iframeContent.contentWindow.document;
    let schedule = iframeDocument.getElementById("schedule");
    let viewScheduleButton = iframeDocument.getElementById("searchClass");
    let viewScheduleField = iframeDocument.getElementById("classNameField");
    let viewScheduleWeekField = iframeDocument.getElementById("weekNumberField");
    
    function changeSchedule() {

    try {
        
        week = viewScheduleWeekField.value;
        
    } catch (e) {
        
        console.log(e);
        
    }
    
    if (week === "") week = date.getWeek();
    
    if (!(firstLoad)) {
        
        className = viewScheduleField.value;
        
    } else {
        
        firstLoad = false;
        
    }
    
    url = "http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=png&schoolid=89920/sv-se&id=" + className + "&period=&week=" + week + "&colors=32&day=0&width=" + "1000" + "&height=" + "1000" + "";
    schedule.src = url;

    }
    
}

changePage(1);
changeSchedule();