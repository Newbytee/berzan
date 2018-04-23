'use strict';

Date.prototype.getWeek = function() {
    let onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

let firstLoad = true;
let date = new Date();
let currentPage;
let className = "Te16G";
let day = date.getDay();
let week = date.getWeek();
let url;
let schedule = document.getElementById("schedule");
let viewScheduleButton = document.getElementById("searchClass");
let viewScheduleField = document.getElementById("classNameField");
let viewScheduleWeekField = document.getElementById("weekNumberField");
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

contentPages[currentPage].style.display = "block";

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
            break;
        case 1:
            history.pushState(stateObj, "Inställningar", "settings.html");
            break;
        
    }
    
}

changeSchedule();