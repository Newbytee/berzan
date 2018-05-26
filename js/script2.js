"use strict";

Date.prototype.getWeek = function() {
    let onejan = new Date(this.getFullYear(), 0, 1);
    return Math.ceil((((this - onejan) / 86400000) + onejan.getDay() + 1) / 7);
};

let week;
let className;
let date = new Date();
let navigationButtons = document.getElementsByClassName("navButton");
let navigationButtonsLength = navigationButtons.length;
let iframeContent = document.getElementById("contentIframe");

for (let i = 0; i < navigationButtonsLength; i++) {
    navigationButtons[i].addEventListener("click", function() {
        switch(i) {
        case 0:
            prepareSchedule();
            break;
        case 1:
            prepareLunch();
            break;
        case 2: 
            alert("Övrigt");
            break;
        case 3:
            alert("Inställningar");
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
    };
};

let lunchIframe = function() {
    
    
    
};

function viewSchedule(clickInit = false) {
    try {
        week = scheduleIframe().weekField.value;
    } catch (e) {
        console.log(e);
    }
    
    if (week === "") week = date.getWeek();
    if (clickInit) className = scheduleIframe().schedField.value;

    scheduleIframe().sched.src = "http://www.novasoftware.se/ImgGen/schedulegenerator.aspx?format=png&schoolid=89920/sv-se&type=-1&id=" + className + "&period=&week=" + week + "&mode=0&printer=0&colors=32&head=0&clock=0&foot=0&day=0&width=921&height=872&maxwidth=921&maxheight=872";
    scheduleIframe().sched.onload = () => {
        let iFrameID = document.getElementById('contentIframe');
        if(iFrameID) iFrameID.height = (iFrameID.contentWindow.document.body.scrollHeight + 4) + "px";
    };
    scheduleIframe().sched.onerror = () => {
        alert("Schemat kunde inte laddas. Kolla din anslutning, och stäng av eventuella adblockers.");
    };
}

function prepareSchedule() {
    scheduleIframe().src = "../html/schedule.html";
    scheduleIframe().schedBtn.addEventListener("click", function() {
        viewSchedule(true);
    });
}

function prepareLunch() {
    scheduleIframe().src = "../html/lunch.html";
    alert("Lunch foo");
}

iframeContent.onload = () => {
    if (localStorage.getItem("startPage")) {
        switch(localStorage.getItem("startPage")) {
        case "schedule":
            prepareSchedule();
            break;
        case "lunch":
            prepareLunch();
            break;
        }
    } else {
        prepareSchedule();
    }
};