let curPage = 0;
let curUrl = "/api/attractions?page=";
let nextPage;
let curKeyword;

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
                let newItem = document.createElement("div");
                newItem.classList.add("main-item");
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

function selectCat(text) {
    const searchBar = document.getElementById("form-input");
    searchBar.removeAttribute("value");
    searchBar.setAttribute("value", text);
    searchBar.setAttribute("placeholder", text);
}

loadAttraction(curUrl, curPage);
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

// after the window is loaded, activate the search bar event listener (submit)
window.onload = function(){
    const searchBar = document.getElementById("search-bar");
    searchBar.addEventListener("submit", (e) => {
        e.preventDefault();
        e.stopPropagation();
        let container = document.getElementById("main"); 
        // remove data in main after new condition if there are attraction data in main
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        let keyword = searchBar[0].value; // get keyword in search bar
        curPage = 0;
        curUrl = "/api/attractions?page=";
        loadAttraction(curUrl, curPage, keyword);
    })    

    // event listener - to pop out category menu if user click the search bar
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

// click anywhere to close the search bar
window.onclick = function(){
    if (document.getElementById("banner-form-dropdown")) {
        let form = document.getElementById("banner-form");
        form.removeChild(form.lastChild);   
    }
}