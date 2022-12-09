let curPage = 0;
let curUrl = "/api/attractions?page=";
let nextPage;
let curKeyword;
let thisUrl = window.location.href;

// create function to load attractions data in main
async function loadAttraction(curUrl, curPage, curKeyword) {    
    let condition;
    // see if user fill in keyword to determine the fetch url
    if (curKeyword === undefined ) {
        condition = curUrl + curPage.toString();
    } else {
        condition = curUrl + curPage.toString() + "&keyword=" + curKeyword;       
    }
    
    // fetch data with async command
    let response = await fetch(condition, {
        method: "GET",
        headers:{
            "Content-Type": "application/json"
        },
    })
    .then(res => {
        return res.json();
    })
    .then(data => {
        
        // append attraction data into main
        let container = document.getElementById("main"); 
        let newContainer = document.createElement("div");
        newContainer.classList.add("main-container");
        container.appendChild(newContainer);

        // see if there is matching data
        if (data["message"] == "no more data") {
            container.classList.remove("main")
            container.classList.add("main-alert");
            container.textContent = "查無相關資料";
        } else {
            container.classList.remove("main-alert");
            container.classList.add("main");
            for (let i = 0; i < 12; i++) {
                let newItem = document.createElement("a");
                newItem.classList.add("main-item");
                newItem.setAttribute("href", thisUrl + "attraction/" + data["data"][i]["id"])
                let newItemImg = document.createElement("img");
                newItemImg.classList.add("main-item-img");
                newItemImg.src = data["data"][i]["images"][0];
                let newItemName = document.createElement("div");
                newItemName.classList.add("main-item-name");
                newItemName.textContent = data["data"][i]["name"];
                let newItemMrt = document.createElement("div");
                newItemMrt.classList.add("main-item-mrt");
                newItemMrt.textContent = data["data"][i]["mrt"];
                let newItemCat = document.createElement("div");
                newItemCat.classList.add("main-item-cat");
                newItemCat.textContent = data["data"][i]["category"];
            
                newContainer.appendChild(newItem);
                newItem.appendChild(newItemImg);
                newItem.appendChild(newItemName);
                newItem.appendChild(newItemMrt);
                newItem.appendChild(newItemCat);            
            }
        }
        return data;
    })
    .catch(error => {
        return error;
    })
    nextPage = response["nextPage"];
}

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

// scroll to load more next page
function scrollEvent() {
    window.addEventListener("scroll", () => {
        let scrolledHeight = window.innerHeight + Math.ceil(document.documentElement.scrollTop); // scrolled height
        let viewHeight = document.body.offsetHeight; // total height of the browser
        // if (scrolled height >= total height of the browser) && (nextPage is a valid number), then load next page
        if (scrolledHeight >= viewHeight && !isNaN(nextPage)) {
            curPage = nextPage;
            const searchBar = document.getElementById("search-bar");
            let keyword = searchBar[0].value;
            // see if there is keyword in the search bar
            if (searchBar[0].value) {
                loadAttraction(curUrl, curPage, keyword);
            } else {
                loadAttraction(curUrl, curPage);
            }
        }
    })
}

// activate the search bar event listener (submit)
function searchBarEvent() {
    const searchBar = document.getElementById("search-bar");
    searchBar.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();
        let container = document.getElementById("main"); 
        // remove data in main after new condition if there are attraction data in main
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        // let keyword = searchBar[0].value; // get keyword in search bar
        let keyword = searchBar[0].value;
        curPage = 0;
        curUrl = "/api/attractions?page=";
        loadAttraction(curUrl, curPage, keyword);
    })  
}

// event listener - to pop out category menu if user click the search bar
function catMenuEvent() {
    const formInput = document.getElementById("form-input");
    formInput.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        let url = "/api/categories"
        fetch(url, {
            method: "GET",
            headers:{
                "Content-Type": "application/json"
            },
        })
        .then(res => {
            return res.json();
        })
        .then(data => {
            // get menu element by id
            let clist = data["data"];
            let form = document.getElementById("banner-form");
            let dropDown = document.createElement("div");
            dropDown.classList.add("banner-form-dropdown");
            dropDown.setAttribute("id", "banner-form-dropdown");
            form.appendChild(dropDown);
            // append category data into the menu
            for (let i = 0; i <= clist.length; i++) {
                let dropDownItem = document.createElement("div");
                let text = clist[i];
                dropDownItem.classList.add("banner-form-dropdown-item");
                dropDownItem.setAttribute("onclick", `selectCat(\'' + "${text}" + '\')`);
                dropDownItem.textContent = text;
                dropDown.appendChild(dropDownItem); 
            }
        })
    })   
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

// select category in banner search bar
function selectCat(text) {
    const searchBar = document.getElementById("form-input");
    searchBar.value = text;
    searchBar.setAttribute("placeholder", text);
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

loadAttraction(curUrl, curPage);
scrollEvent();
// after the window is loaded, activate the search bar event listener (submit)
window.onload = function(){
    ajax();
    searchBarEvent();
    catMenuEvent();
    userRegister();
    userLogin();
    logOut();
}

// click anywhere to close the search bar
window.onclick = function(){
    if (document.getElementById("banner-form-dropdown")) {
        let form = document.getElementById("banner-form");
        form.removeChild(form.lastChild);   
    }
}
