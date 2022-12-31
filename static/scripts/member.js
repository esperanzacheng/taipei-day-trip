window.onload = function() {
    memberCheck();
    homeLink();
    bookLink();
    userRegister();
    userLogin();
    userLogOut();
    ordersGet();
    selectPhoto();
    setTimeout(() => {
        showPhoto(memberId);
    }, 100)
}

// check login status and set username in greeting html item
async function memberCheck() {
    let url = "/api/user/auth";
    let response = await fetch(url, {
        method: "GET",
    })
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        const memberCenter = document.getElementById("member-button");
        const logIn = document.getElementById("log-in-button");
        if (data["data"]) {
            memberCenter.style.display = "block";
            memberCenter.setAttribute("href", "/member");
            logIn.style.display = "none";
            const memberName = document.getElementById("member-name");
            memberName.textContent = data["data"]["name"];
            const memberEmail = document.getElementById("member-email");
            memberEmail.textContent = data["data"]["email"];
            const orderDisplay = document.getElementById("order-display-button");
            orderDisplay.style.display = "block";
        } else {
            window.location = "/";
        }
        return data;
    })
    .catch((error) => {
        console.log(error);
    })

    memberId = response["data"]["id"];
}

// log out and delete token
function userLogOut() {
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
        .catch((error) => {
            console.log(error);
        })
    })
}

// get member's orders in the past
function ordersGet() {
    const orderDisplay = document.getElementById("order-display-button");
    orderDisplay.addEventListener("click", fetchOrders);
    const orderHide = document.getElementById("order-hide-button");
    orderHide.addEventListener("click", hideOrders);
}

function fetchOrders(e) {
    e.preventDefault();
    let url = "/api/order";
    fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
    })
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        const orderHide = document.getElementById("order-hide-button");
        orderHide.style.display = "block";
        const orderDisplay = document.getElementById("order-display-button");
        orderDisplay.style.display = "none";
        const orderContainerBox = document.getElementById("order-container-box");
        if (data["data"] == null) {
            const noOrderAlert = document.createElement("div");
            noOrderAlert.classList.add("order-head");
            noOrderAlert.textContent = "尚無歷史訂單";
            orderContainerBox.appendChild(noOrderAlert);
        } else {
            for (let i = 0; i < data["data"].length; i++) {
                const orderContainer = document.createElement("div");
                orderContainer.classList.add("order-container");
                orderContainerBox.appendChild(orderContainer);
                const orderNumberHead = document.createElement("div");
                orderNumberHead.classList.add("order-head");
                orderNumberHead.textContent = "編號：";
                const orderNumberInfo = document.createElement("div");
                orderNumberInfo.classList.add("order-info");
                orderNumberInfo.textContent = data["data"][i]["number"];
                const orderNameHead = document.createElement("div");
                orderNameHead.classList.add("order-head");
                orderNameHead.textContent = "景點：";
                const orderNameInfo = document.createElement("div");
                orderNameInfo.classList.add("order-info");
                orderNameInfo.textContent = data["data"][i]["name"];
                const orderDateHead = document.createElement("div");
                orderDateHead.classList.add("order-head");
                orderDateHead.textContent = "日期：";
                const orderDateInfo = document.createElement("div");
                orderDateInfo.classList.add("order-info");
                orderDateInfo.textContent = data["data"][i]["date"];
                const date = data["data"][i]["date"];
                const orderTimeHead = document.createElement("div");
                orderTimeHead.classList.add("order-head");
                orderTimeHead.textContent = "時間：";
                const orderTimeInfo = document.createElement("div");
                orderTimeInfo.classList.add("order-info");
                if (data["data"][i]["time"] == "morning") {
                    orderTimeInfo.textContent = "早上 9 點到下午 4 點";
                } else {
                    orderTimeInfo.textContent = "下午 1 點到晚上 8 點";
                }
                orderContainer.appendChild(orderNumberHead);
                orderContainer.appendChild(orderNumberInfo);
                orderContainer.appendChild(orderNameHead);
                orderContainer.appendChild(orderNameInfo);
                orderContainer.appendChild(orderDateHead);
                orderContainer.appendChild(orderDateInfo);
                orderContainer.appendChild(orderTimeHead);
                orderContainer.appendChild(orderTimeInfo);
                if (data["data"][i]["pay_status"] == 0) {
                    const orderPayStatus = document.createElement("img");
                    orderPayStatus.classList.add("pay_status");
                    orderPayStatus.setAttribute("src", "https://cdn-icons-png.flaticon.com/512/4272/4272841.png");
                    orderContainer.appendChild(orderPayStatus);
                }
            }
        }
    })
    .catch((error) => {
        console.log(error);
    })
}

function hideOrders(e) {
    e.preventDefault();
    const orderHide = document.getElementById("order-hide-button");
    orderHide.style.display = "none";
    const orderDisplay = document.getElementById("order-display-button");
    orderDisplay.style.display = "block";
    const orderContainerBox = document.getElementById("order-container-box");
    while (orderContainerBox.firstChild) {
        orderContainerBox.removeChild(orderContainerBox.firstChild);
    }
}

function showPhoto(id) {
    let url = `/api/user/${id}`;
    fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
    })
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        const memberImg = document.getElementById("member-img");
        memberImg.setAttribute("src", data["data"]);
    })
    .catch((error) => {
        console.log(error);
    })
}

function selectPhoto() {
    const memberPhoto = document.getElementById("member-img");
    memberPhoto.addEventListener("click", (e) => {
        e.preventDefault();
        let url = "/api/user/imgs";
        fetch(url, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            },
        })
        .then((res) => {
            return res.json();
        })
        .then((data) => {
            const memberImgForm = document.getElementById("member-img-form");
            memberImgForm.style.display = "grid";
            const memberImgMenu = document.getElementById("img-menu");
            for (let i = 0; i < data["data"].length; i++) {
                const category = document.createElement("div");
                category.classList.add("member-img-category");
                category.textContent = data["data"][i]["breed"];
                category.addEventListener("click", (e) => {
                    e.preventDefault;
                    changePhoto(data["data"][i]["id"]);
                })
                memberImgMenu.appendChild(category);
            }
        })
        .catch((error) => {
            console.log(error);
        })
    })
}

function hideMemberImgForm() {
    const memberImgForm = document.getElementById("member-img-form");
    memberImgForm.style.display = "none";
    const memberImgMenu = document.getElementById("img-menu");
    while (memberImgMenu.firstChild) {
        memberImgMenu.removeChild(memberImgMenu.firstChild);
    }
}

function changePhoto(img_id) {
    let url = "/api/user/imgs";
    fetch(url, {
        method: "PATCH",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "img_id": img_id,
        })
    })
    .then((res) => {
        return res.json();
    })
    .then((data) => {
        const memberImg = document.getElementById("member-img");
        memberImg.setAttribute("src", data["data"]["img"]);
        hideMemberImgForm();
    })
    .catch((error) => {
        console.log(error);
    })
}