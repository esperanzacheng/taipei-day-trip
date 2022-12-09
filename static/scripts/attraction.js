// get this attraction id
let thisUrl = window.location.href;
let thisId = thisUrl.split("/").pop();

// fetch this attraction's data and append to html
function fetchData(id) {
    let url = `/api/attraction/${id}`;
    fetch(url).then((res) => {
        return res.json();
    })
    .then((data) => {
        let mainContainer = document.getElementById("main-container");
        let imagesList = data["data"]["images"];
        createSlides(imagesList.length);
        let slides = document.getElementById("slides");
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
        let name = document.createElement("div");
        name.classList.add("attraction-main-name");
        name.textContent = data["data"]["name"];
        let cat = document.createElement("div");
        cat.classList.add("attraction-main-cat");
        cat.textContent = data["data"]["category"] + " at " + data["data"]["mrt"];
        mainContainer.appendChild(name);
        mainContainer.appendChild(cat);

        let detailContainer = document.getElementById("detail-container");
        let description = document.createElement("div");
        description.classList.add("detail-description");
        description.textContent = data["data"]["description"];
        let headAddress = document.createElement("div");
        headAddress.classList.add("detail-h-address");
        headAddress.textContent = "景點地址：";
        let address = document.createElement("div");
        address.classList.add("detail-address");
        address.textContent = data["data"]["address"];
        let headTrans = document.createElement("div");
        headTrans.classList.add("detail-h-trans");
        headTrans.textContent = "交通方式：";
        let trans = document.createElement("div");
        trans.classList.add("detail-trans");
        trans.textContent = data["data"]["transport"];
        detailContainer.appendChild(description);
        detailContainer.appendChild(headAddress);
        detailContainer.appendChild(address);
        detailContainer.appendChild(headTrans);
        detailContainer.appendChild(trans);
    })
}

// show fee 2000 if select am
function showFee2000() {
    let feeAm = document.getElementById("fee-am");
    let feePm = document.getElementById("fee-pm");
    feeAm.style.display = "block";
    feePm.style.display = "none";
}

// show fee 2500 if select pm
function showFee2500() {
    let feeAm = document.getElementById("fee-am");
    let feePm = document.getElementById("fee-pm");
    feeAm.style.display = "none";
    feePm.style.display = "block";
}

// create slides to display slide, and append each image to different slide
function createSlides(imgCount) {
    let slides = document.getElementById("slides");
    for (let i = 0; i < imgCount; i++) {
        let control = document.createElement("input");
        control.setAttribute("type", "radio");
        control.setAttribute("id", `control-${i}`);
        control.setAttribute("name", "control");
        slides.appendChild(control);
    }
    let defaultChecked = document.getElementById("control-0");
    defaultChecked.checked = true;

    let buttonLeft = document.createElement("button");
    buttonLeft.classList.add("slide-button-left");
    buttonLeft.setAttribute("id", "btn-left");
    buttonLeft.addEventListener("click", slideLeft);
    let buttonRight = document.createElement("button");
    buttonRight.classList.add("slide-button-right");
    buttonRight.setAttribute("id", "btn-right");
    buttonRight.addEventListener("click", slideRight);
    slides.appendChild(buttonLeft);
    slides.appendChild(buttonRight);
}

// create button to slide image to the left one
function slideLeft(e) {
    e.preventDefault();
    let slidesDeck = document.getElementsByName("control");
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
    let slidesDeck = document.getElementsByName("control");
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

function ajax() {
    let url = "/api/user/auth";
    fetch(url, {
        method: "GET",
        credentials: "include",
    })
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        let logOut = document.getElementById("log-out-button");
        let logIn = document.getElementById("log-in-button");
        console.log("fetch1");
        if (data["data"]) {
            logOut.style.display = "block";
            logIn.style.display = "none";
            
        } else {
            logOut.style.display = "none";
            logIn.style.display = "block";
        }
    })
}

window.onload = function() {
    ajax();
    
    // create link to the home page with head item-1
    let homeButton = document.getElementById("home-button");
    let thisDomain = window.location.hostname;
    let thisProtocol = window.location.protocol;
    let homeUrl = thisProtocol + "//" + thisDomain + ":3000";
    homeButton.setAttribute("href", homeUrl);

    // set the html date input with min == today & max == a year from today
    let dateSelector = document.getElementById("date-selector");
    let today = new Date();
    let aYearFromNow = new Date();
    let todayDate = today.toISOString().split('T')[0];
    aYearFromNow.setDate(today.getDate() + 365)
    let aYearFromNowDate = aYearFromNow.toISOString().split('T')[0];
    dateSelector.min = todayDate;
    dateSelector.max = aYearFromNowDate;

    userRegister();
    userLogin();
    logOut();
}
// register user
function userRegister() {
    const registerButton = document.getElementById("register-form-button");
    registerButton.addEventListener("click", (e) => {
        e.preventDefault();
        let url = "/api/user";
        let name = document.getElementById("register-name").value;
        let email = document.getElementById("register-email").value;
        let password = document.getElementById("register-password").value;
        fetch(url, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "name": name,
                "email": email,
                "password": password,
            })
        })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            const emailIsUsed = document.getElementById("email-is-used");
            if(data["ok"] == true) {
                const registerSuccess = document.getElementById("register-success");
                registerSuccess.style.display = "block";
            } else if (data["message"] == "this email is used") {                
                emailIsUsed.style.display = "block";
            }
        })
    })
}

// login and record token   
function userLogin() {
    const loginButton = document.getElementById("login-form-button");
    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        let url = "/api/user/auth";
        let email = document.getElementById("login-email").value;
        let password = document.getElementById("login-password").value;
        fetch(url, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "email": email,
                "password": password,
            })
        })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            const infoNotFilled = document.getElementById("info-not-filled");
            const infoIsWrong = document.getElementById("info-is-wrong");
            infoNotFilled.style.display = "none";
            infoIsWrong.style.display = "none";
            if(data["ok"] == true) {
                window.location.reload();
            } else if (data["message"] == "info not filled") {                
                infoNotFilled.style.display = "block";
            } else if (data["message"] == "info is wrong") {
                infoIsWrong.style.display = "block";
            }
        })
    })
}

// log out and delete token
function logOut() {
    const logoutButton = document.getElementById("log-out-button");
    logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        let url = "/api/user/auth";
        fetch(url, {
            method: "DELETE",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
        })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            window.location.reload();
        })
    })
}

// click to show the login form
function showLoginForm() {
    const loginForm = document.getElementById("login-form");
    const loginBg = document.getElementById("login-background");
    loginForm.style.display = "grid";
    loginBg.style.display = "block";
    removeAlert()
}

function hideLoginForm() {
    const loginForm = document.getElementById("login-form");
    const loginBg = document.getElementById("login-background");
    loginForm.style.display = "none";
    loginBg.style.display = "none";
    removeAlert()
}

function hideRegisterForm() {
    const RegisterForm = document.getElementById("register-form");
    const loginBg = document.getElementById("login-background");
    RegisterForm.style.display = "none";
    loginBg.style.display = "none";
}

function switchToRegisterForm() {
    const loginForm = document.getElementById("login-form");
    const RegisterForm = document.getElementById("register-form");
    loginForm.style.display = "none";
    RegisterForm.style.display = "grid";
    removeAlert()
}

function switchToLoginForm() {
    const loginForm = document.getElementById("login-form");
    const RegisterForm = document.getElementById("register-form");
    loginForm.style.display = "grid";
    RegisterForm.style.display = "none";
    removeAlert()
}

// remove the alert message once the login form is either switched or closed
function removeAlert() {
    if (document.getElementById("info-not-filled")) {
        document.getElementById("info-not-filled").style.display = "none";
    }
    if (document.getElementById("info-is-wrong")) {
        document.getElementById("info-is-wrong").style.display = "none";
    }
    if (document.getElementById("email-is-used")) {
        document.getElementById("email-is-used").style.display = "none";
    }
}

fetchData(thisId);



