// =========================
// GOOGLE SHEETS
// =========================

const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw0ca-KwMYEqgmO9GLHw-WwdXLbXiL7_RX3yYVsHfkFRn7GKb2mnUyQy092Bta9bJEo5g/exec";


// =========================
// VARIABLES
// =========================

let selectedEmployee = null;
let selectedAccount = null;
let selectedDepartment = null;
let selectedTask = null;

let activeSessionId = null;
let activeStartTime = null;

let timerInterval = null;


// =========================
// GET ELEMENTS
// =========================

const employeeButtons = document.querySelectorAll(".employee button");
const accountButtons = document.querySelectorAll(".account button");
const departmentButtons = document.querySelectorAll(".department button");
const taskButtons = document.querySelectorAll(".task button");

const startButton = document.querySelector("#startButton");
const stopButton = document.querySelector("#stopButton");
const timerDisplay = document.querySelector("#timerDisplay");


// =========================
// EMPLOYEE SELECTION
// =========================

employeeButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        // Don't change employee while timer is running
        if (activeSessionId !== null) {
            return;
        }

        employeeButtons.forEach(function(employeeButton) {
            employeeButton.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedEmployee = button.textContent.trim();

    });

});


// =========================
// ACCOUNT SELECTION
// =========================

accountButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        if (activeSessionId !== null) {
            return;
        }

        accountButtons.forEach(function(accountButton) {
            accountButton.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedAccount = button.textContent.trim();

    });

});


// =========================
// DEPARTMENT SELECTION
// =========================

departmentButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        if (activeSessionId !== null) {
            return;
        }

        departmentButtons.forEach(function(departmentButton) {
            departmentButton.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedDepartment = button.textContent.trim();

    });

});


// =========================
// TASK SELECTION
// =========================

taskButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        if (activeSessionId !== null) {
            return;
        }

        taskButtons.forEach(function(taskButton) {
            taskButton.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedTask = button.textContent.trim();

    });

});


// =========================
// START
// =========================

startButton.addEventListener("click", async function() {

    // Already running
    if (activeSessionId !== null) {
        alert("A timer is already running.");
        return;
    }


    // Required selections

    if (selectedEmployee === null) {
        alert("Please select an employee.");
        return;
    }

    if (selectedAccount === null) {
        alert("Please select an account.");
        return;
    }

    if (selectedDepartment === null) {
        alert("Please select a department.");
        return;
    }

    if (selectedTask === null) {
        alert("Please select a task.");
        return;
    }


    // =========================
    // CREATE SESSION
    // =========================

    activeSessionId = crypto.randomUUID();

    activeStartTime = new Date();


    const sessionData = {

        action: "start",

        sessionId: activeSessionId,

        employee: selectedEmployee,

        account: selectedAccount,

        department: selectedDepartment,

        task: selectedTask

    };


    // =========================
    // SAVE LOCALLY
    // =========================

    const localSession = {

        sessionId: activeSessionId,

        employee: selectedEmployee,

        account: selectedAccount,

        department: selectedDepartment,

        task: selectedTask,

        startTime: activeStartTime.toISOString()

    };

    localStorage.setItem(
        "nullActiveSession",
        JSON.stringify(localSession)
    );


    // =========================
    // SEND START TO SHEETS
    // =========================

    try {

        await fetch(GOOGLE_SCRIPT_URL, {

            method: "POST",

            mode: "no-cors",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify(sessionData)

        });

        console.log("START sent to Google Sheets");

    } catch (error) {

        console.error("Could not start session:", error);

        localStorage.removeItem("nullActiveSession");

        activeSessionId = null;
        activeStartTime = null;

        alert("Could not start timer.");

        return;

    }


    // =========================
    // START VISUAL TIMER
    // =========================

    startVisualTimer();

    startButton.textContent = "Running";

});


// =========================
// STOP
// =========================

stopButton.addEventListener("click", async function() {

    if (activeSessionId === null) {
        alert("No active timer.");
        return;
    }


    const stopData = {

        action: "stop",

        sessionId: activeSessionId

    };


    // =========================
    // SEND STOP TO SHEETS
    // =========================

    try {

        await fetch(GOOGLE_SCRIPT_URL, {

            method: "POST",

            mode: "no-cors",

            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },

            body: JSON.stringify(stopData)

        });

        console.log("STOP sent to Google Sheets");

    } catch (error) {

        console.error("Could not stop session:", error);

        alert("Could not stop timer.");

        return;

    }


    // =========================
    // CLEAR SESSION
    // =========================

    clearInterval(timerInterval);

    timerInterval = null;

    activeSessionId = null;
    activeStartTime = null;

    localStorage.removeItem("nullActiveSession");


    // Reset display

    timerDisplay.textContent = "00:00:00";

    startButton.textContent = "Start";


    // Keep employee selected
    // Clear account, department and task

    selectedAccount = null;
    selectedDepartment = null;
    selectedTask = null;


    accountButtons.forEach(function(button) {
        button.classList.remove("selected");
    });

    departmentButtons.forEach(function(button) {
        button.classList.remove("selected");
    });

    taskButtons.forEach(function(button) {
        button.classList.remove("selected");
    });

});


// =========================
// VISUAL TIMER
// =========================

function startVisualTimer() {

    clearInterval(timerInterval);

    updateTimerDisplay();


    timerInterval = setInterval(function() {

        updateTimerDisplay();

    }, 1000);

}


// =========================
// UPDATE DISPLAY FROM TIME
// =========================

function updateTimerDisplay() {

    if (activeStartTime === null) {
        timerDisplay.textContent = "00:00:00";
        return;
    }


    const now = new Date();

    const elapsedMilliseconds =
        now.getTime() - activeStartTime.getTime();

    const elapsedSeconds =
        Math.floor(elapsedMilliseconds / 1000);


    const hours =
        Math.floor(elapsedSeconds / 3600);

    const minutes =
        Math.floor((elapsedSeconds % 3600) / 60);

    const seconds =
        elapsedSeconds % 60;


    timerDisplay.textContent =
        String(hours).padStart(2, "0") +
        ":" +
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");

}


// =========================
// RESTORE AFTER REFRESH
// =========================

function restoreActiveSession() {

    const savedSession =
        localStorage.getItem("nullActiveSession");


    if (!savedSession) {
        return;
    }


    try {

        const session =
            JSON.parse(savedSession);


        activeSessionId =
            session.sessionId;

        activeStartTime =
            new Date(session.startTime);


        selectedEmployee =
            session.employee;

        selectedAccount =
            session.account;

        selectedDepartment =
            session.department;

        selectedTask =
            session.task;


        // =========================
        // RESTORE VISUAL SELECTIONS
        // =========================

        employeeButtons.forEach(function(button) {

            if (
                button.textContent.trim() ===
                selectedEmployee
            ) {
                button.classList.add("selected");
            }

        });


        accountButtons.forEach(function(button) {

            if (
                button.textContent.trim() ===
                selectedAccount
            ) {
                button.classList.add("selected");
            }

        });


        departmentButtons.forEach(function(button) {

            if (
                button.textContent.trim() ===
                selectedDepartment
            ) {
                button.classList.add("selected");
            }

        });


        taskButtons.forEach(function(button) {

            if (
                button.textContent.trim() ===
                selectedTask
            ) {
                button.classList.add("selected");
            }

        });


        startButton.textContent = "Running";

        startVisualTimer();


        console.log(
            "Restored active session:",
            activeSessionId
        );


    } catch (error) {

        console.error(
            "Could not restore session:",
            error
        );

        localStorage.removeItem(
            "nullActiveSession"
        );

    }

}


// =========================
// RUN WHEN PAGE LOADS
// =========================

restoreActiveSession();