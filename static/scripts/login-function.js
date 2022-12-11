// home-link
function homeLink() {
    let homeButton = document.getElementById("home-button");
    let thisDomain = window.location.hostname;
    let thisProtocol = window.location.protocol;
    let homeUrl = thisProtocol + "//" + thisDomain + ":3000";
    homeButton.setAttribute("href", homeUrl);
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

// check if user login
function ajax() {
    let url = "/api/user/auth";
    fetch(url, {
        method: "GET",
    })
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        let logOut = document.getElementById("log-out-button");
        let logIn = document.getElementById("log-in-button");
        if (data["data"]) {
            logOut.style.display = "block";
            logIn.style.display = "none";
            
        } else {
            logOut.style.display = "none";
            logIn.style.display = "block";
        }
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