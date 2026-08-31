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

let timerInterval = null;
let seconds = 0;
let isPaused = false;

let startTime = null;


// =========================
// GET ELEMENTS
// =========================

const employeeButtons = document.querySelectorAll(".employee button");
const accountButtons = document.querySelectorAll(".account button");
const departmentButtons = document.querySelectorAll(".department button");
const taskButtons = document.querySelectorAll(".task button");

const startButton = document.querySelector("#startButton");
const pauseButton = document.querySelector("#pauseButton");
const stopButton = document.querySelector("#stopButton");
const timerDisplay = document.querySelector("#timerDisplay");


// =========================
// EMPLOYEE SELECTION
// =========================

employeeButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        employeeButtons.forEach(function(employeeButton) {
            employeeButton.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedEmployee = button.textContent.trim();

        console.log("Selected employee:", selectedEmployee);

    });

});


// =========================
// ACCOUNT SELECTION
// =========================

accountButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        accountButtons.forEach(function(accountButton) {
            accountButton.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedAccount = button.textContent.trim();

        console.log("Selected account:", selectedAccount);

    });

});


// =========================
// DEPARTMENT SELECTION
// =========================

departmentButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        departmentButtons.forEach(function(departmentButton) {
            departmentButton.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedDepartment = button.textContent.trim();

        console.log("Selected department:", selectedDepartment);

    });

});


// =========================
// TASK SELECTION
// =========================

taskButtons.forEach(function(button) {

    button.addEventListener("click", function() {

        taskButtons.forEach(function(taskButton) {
            taskButton.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedTask = button.textContent.trim();

        console.log("Selected task:", selectedTask);

    });

});


// =========================
// START TIMER
// =========================

startButton.addEventListener("click", function() {

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

    if (timerInterval !== null) {
        return;
    }

    if (isPaused === true) {
        return;
    }

    startTime = new Date();

    timerInterval = setInterval(function() {
        seconds++;
        updateTimer();
    }, 1000);

    console.log("Timer started");
    console.log("Employee:", selectedEmployee);
    console.log("Account:", selectedAccount);
    console.log("Department:", selectedDepartment);
    console.log("Task:", selectedTask);

});


// =========================
// PAUSE / RESUME
// =========================

pauseButton.addEventListener("click", function() {

    if (timerInterval !== null) {

        clearInterval(timerInterval);
        timerInterval = null;

        isPaused = true;

        pauseButton.textContent = "Resume";

        console.log("Timer paused");

        return;
    }

    if (isPaused === true) {

        timerInterval = setInterval(function() {
            seconds++;
            updateTimer();
        }, 1000);

        isPaused = false;

        pauseButton.textContent = "Pause";

        console.log("Timer resumed");

    }

});


// =========================
// STOP TIMER + SAVE
// =========================

stopButton.addEventListener("click", async function() {

    if (timerInterval === null && isPaused === false) {
        return;
    }

    clearInterval(timerInterval);
    timerInterval = null;

    const endTime = new Date();

    const sessionData = {
        employee: selectedEmployee,
        account: selectedAccount,
        department: selectedDepartment,
        task: selectedTask,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        durationSeconds: seconds
    };

    console.log("Saving session:", sessionData);

    try {

        await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            mode: "no-cors",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(sessionData)
        });

        console.log("Session sent to Google Sheets");

    } catch (error) {

        console.error("Error saving session:", error);

        alert("Could not save time entry.");

        return;
    }


    // =========================
    // RESET
    // =========================

    seconds = 0;
    isPaused = false;
    startTime = null;

    updateTimer();

    pauseButton.textContent = "Pause";


    // KEEP EMPLOYEE SELECTED
    // Only clear account, department, and task

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
// UPDATE TIMER DISPLAY
// =========================

function updateTimer() {

    let hours = Math.floor(seconds / 3600);
    let minutes = Math.floor((seconds % 3600) / 60);
    let remainingSeconds = seconds % 60;

    hours = String(hours).padStart(2, "0");
    minutes = String(minutes).padStart(2, "0");
    remainingSeconds = String(remainingSeconds).padStart(2, "0");

    timerDisplay.textContent =
        hours + ":" + minutes + ":" + remainingSeconds;

}