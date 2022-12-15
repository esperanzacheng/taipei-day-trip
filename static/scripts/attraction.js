// get this attraction id
let thisUrl = window.location.href;
let thisId = thisUrl.split("/").pop();

window.onload = function() {
    checkLoginSetButton();
    homeLink();
    setCalendar()
    userRegister();
    userLogin();
    userLogOut();
    showFee();
}

fetchData(thisId);

// fetch this attraction's data and append to html
function fetchData(id) {
    let url = `/api/attraction/${id}`;
    fetch(url).then((res) => {
        return res.json();
    })
    .then((data) => {
        const mainContainer = document.getElementById("main-container");
        let imagesList = data["data"]["images"];
        createSlides(imagesList.length);
        const slides = document.getElementById("slides");
        // append images to slides element
        for (let i = 0; i < imagesList.length; i++) {
            let img = document.createElement("img");
            img.classList.add("slide");
            img.setAttribute("src", `${imagesList[i]}`);
            img.setAttribute("id", `slide-${i}`);
            img.style.left = `${i * 100}%`;
            slides.appendChild(img);
        }        
        // append other basic info about this attraction;
        const name = document.createElement("div");
        name.classList.add("attraction-main-name");
        name.textContent = data["data"]["name"];
        const cat = document.createElement("div");
        cat.classList.add("attraction-main-cat");
        cat.textContent = data["data"]["category"] + " at " + data["data"]["mrt"];
        mainContainer.appendChild(name);
        mainContainer.appendChild(cat);

        const detailContainer = document.getElementById("detail-container");
        const description = document.createElement("div");
        description.classList.add("detail-description");
        description.textContent = data["data"]["description"];
        const headAddress = document.createElement("div");
        headAddress.classList.add("detail-h-address");
        headAddress.textContent = "景點地址：";
        const address = document.createElement("div");
        address.classList.add("detail-address");
        address.textContent = data["data"]["address"];
        const headTrans = document.createElement("div");
        headTrans.classList.add("detail-h-trans");
        headTrans.textContent = "交通方式：";
        const trans = document.createElement("div");
        trans.classList.add("detail-trans");
        trans.textContent = data["data"]["transport"];
        detailContainer.appendChild(description);
        detailContainer.appendChild(headAddress);
        detailContainer.appendChild(address);
        detailContainer.appendChild(headTrans);
        detailContainer.appendChild(trans);
    })
    .catch((error) => {
        return error;
    })
}

// show fee 2000 if select am
function showFee() {
    const amOption = document.getElementById("am-time-selector");
    const pmOption = document.getElementById("pm-time-selector");
    const feeAm = document.getElementById("fee-am");
    const feePm = document.getElementById("fee-pm");
    amOption.checked = true;
    amOption.addEventListener("click", (e) => {
        amOption.checked = true;
        feeAm.style.display = "block";
        feePm.style.display = "none";
    })
    pmOption.addEventListener("click", (e) => {
        pmOption.checked = true;
        feeAm.style.display = "none";
        feePm.style.display = "block";
    })
}

// create slides to display slide, and append each image to different slide
function createSlides(imgCount) {
    const slides = document.getElementById("slides");
    for (let i = 0; i < imgCount; i++) {
        let control = document.createElement("input");
        control.setAttribute("type", "radio");
        control.setAttribute("id", `control-${i}`);
        control.setAttribute("name", "control");
        slides.appendChild(control);
    }
    const defaultChecked = document.getElementById("control-0");
    defaultChecked.checked = true;

    const buttonLeft = document.createElement("button");
    buttonLeft.classList.add("slide-button-left");
    buttonLeft.setAttribute("id", "btn-left");
    buttonLeft.addEventListener("click", slideLeft);
    const buttonRight = document.createElement("button");
    buttonRight.classList.add("slide-button-right");
    buttonRight.setAttribute("id", "btn-right");
    buttonRight.addEventListener("click", slideRight);
    slides.appendChild(buttonLeft);
    slides.appendChild(buttonRight);
}

// create button to slide image to the left one
function slideLeft(e) {
    e.preventDefault();
    const slidesDeck = document.getElementsByName("control");
    for (let i = 0; i < slidesDeck.length; i++) {
        if (slidesDeck[i].checked) { // if image.checked == true
            if (i !== 0) { // if not the first image
                slidesDeck[i].checked = false;
                slidesDeck[i-1].checked = true; // select the left one
                break; // stop the for loop
            } else {
                break;
            }
        }
    }
}

// create button to slide image to the right one
function slideRight(e) {
    e.preventDefault();
    const slidesDeck = document.getElementsByName("control");
    for (let i = 0; i < slidesDeck.length; i++) {
        if (slidesDeck[i].checked) { // if image.checked == true
            if (i !== slidesDeck.length - 1) { // if not the last image
                slidesDeck[i].checked = false;
                slidesDeck[i+1].checked = true; // select the right one
                break; // stop the for loop
            } else {
                break;
            }
        }
    }
}

// set the html date input with min == today & max == a year from today
function setCalendar() {
    const dateSelector = document.getElementById("date-selector");
    let today = new Date();
    let aYearFromNow = new Date();
    let todayDate = today.toISOString().split('T')[0];
    aYearFromNow.setDate(today.getDate() + 365)
    let aYearFromNowDate = aYearFromNow.toISOString().split('T')[0];
    dateSelector.min = todayDate;
    dateSelector.max = aYearFromNowDate;
}

function submitBooking() {
    const submitButton = document.getElementById("booking-button");    
    submitButton.addEventListener("click", (e) => {
        e.preventDefault();
        let url = "/api/booking";
        const dateInput = document.getElementById("date-selector");
        const timeInput = document.querySelector('input[name="fee"]:checked');
        let time;
        if (timeInput.value == 2000) {
            time = "morning"
        } else {
            time = "afternoon"
        }
        const timeSlotAlert = document.getElementById("time-slot-alert");
        const missingDataAlert = document.getElementById("missing-data-alert");
        if (dateInput.value && timeInput.value) {
            fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "attractionId": thisId,
                    "date": dateInput.value,
                    "time": time,
                    "price": timeInput.value
                })
            })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                if (data["ok"] == true) {
                    window.location = "/booking";
                } else if (data["message"] == "time slot conflict") {
                    timeSlotAlert.style.display = ("block");
                    missingDataAlert.style.display = ("none");
                    timeSlotAlert.setAttribute("href", "/booking")
                }
            })
            .catch((error) => {
                return error;
            })
        } else {
            missingDataAlert.style.display = ("block");
            timeSlotAlert.style.display = ("none");
        }
    })
}

// check if user login
function checkLoginSetButton() {
    let url = "/api/user/auth";
    fetch(url, {
        method: "GET",
    })
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        const logOut = document.getElementById("log-out-button");
        const logIn = document.getElementById("log-in-button");
        if (data["data"]) {
            logOut.style.display = "block";
            logIn.style.display = "none";
            bookLink();
            submitBooking();
        } else {
            logOut.style.display = "none";
            logIn.style.display = "block";
            const bookButton = document.getElementById("booking-checkout");
            bookButton.setAttribute("onclick", "showLoginForm()");
            const submitButton = document.getElementById("booking-button");
            submitButton.setAttribute("onclick", "showLoginForm()");
        }
    })
    .catch((error) => {
        return error;
    })
}