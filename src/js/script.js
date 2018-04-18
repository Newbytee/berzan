'use strict';

Date.prototype.getWeek = function() {
    let onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

let firstLoad = true;
let date = new Date();
let className = "Te16G";
let day = date.getDay();
let week = date.getWeek();
let url;
let schedule = document.getElementById("schedule");
let viewScheduleButton = document.getElementById("searchClass");
let viewScheduleField = document.getElementById("classNameField");
let viewScheduleWeekField = document.getElementById("weekNumberField");

if (!(localStorage.getItem("savedClassName") === null)) {
    
    className = localStorage.getItem("savedClassName");
    
} else {
    
    alert("Du har inte ställt in en standardklass att visa, detta kan göras i inställningarna");
    
}

function changeSchedule() {

    try {
        
        week = viewScheduleWeekField.value;
        
    } catch (e) {
        
        console.log(e);
        
    }
    
    if (week === "") {
        
        week = date.getWeek();
        
    }
    
    if (!(firstLoad)) {
        
        className = viewScheduleField.value;
        
    } else {
        
        firstLoad = false;
        
    }
    
    url = "http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=png&schoolid=89920/sv-se&id=" + className + "&period=&week=" + week + "&colors=32&day=0&width=" + "1000" + "&height=" + "1000" + "";
    schedule.src = url;

}

changeSchedule();