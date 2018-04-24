"use strict";

Date.prototype.getWeek = function() {
    let onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

let week;
let className;
let url;
let date = new Date();
let navigationButtons = document.getElementsByClassName("navButton");
let navigationButtonsLength = navigationButtons.length;

for (let i = 0; i < navigationButtonsLength; i++) {
    
    navigationButtons[i].addEventListener("click", function() {
        
        switch(i) {
            
        case 0:
            alert("schedule");
            break;
        case 1:
            alert("settings");
            break;
            
        }
        
    });
    
}

let scheduleIframe = function() {
    
    let iframeContent = document.getElementById("contentIframe");
    let iframeDocument = iframeContent.contentDocument || iframeContent.contentWindow.document;
    let schedule = iframeDocument.getElementById("schedule");
    let viewScheduleButton = iframeDocument.getElementById("searchClass");
    let viewScheduleField = iframeDocument.getElementById("classNameField");
    let viewScheduleWeekField = iframeDocument.getElementById("weekNumberField");
    
    return {
        
        doc: iframeDocument,
        sched: schedule,
        schedBtn: viewScheduleButton,
        schedField: viewScheduleField,
        weekField: viewScheduleWeekField,
        
    }
    
}

function viewSchedule(clickInit) {
    
    let schedIframe = scheduleIframe();
    
    try {
        
        week = schedIframe.weekField.value;
        
    } catch (e) {
        
        console.log(e);
        
    }
    
    if (week === "") week = date.getWeek();
    
    if (clickInit) {
        
        className = schedIframe.schedField.value;
        
    }
    
    url = "http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=png&schoolid=89920/sv-se&id=" + className + "&period=&week=" + week + "&colors=32&day=0&width=" + "1000" + "&height=" + "1000" + "";
    schedIframe.sched.src = url;
    
}

function prepareSchedule() {
    
    let schedIframe = scheduleIframe();
    schedIframe.schedBtn.addEventListener("click", function() {
        
        viewSchedule(true);
        
    });

}

prepareSchedule();