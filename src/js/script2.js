"use strict";

Date.prototype.getWeek = function() {
    let onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

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
    
    return {
        
        doc: iframeDocument,
        sched: schedule,
        schedBtn: viewScheduleButton,
        schedField: viewScheduleField,
        
    }
    
}