window.onload = function() {
    loginCheck();
    homeLink();
    bookLink();
    getBooking();
    userRegister();
    userLogin();
    // userLogOut();
}

// check login status and set username in greeting html item
function loginCheck() {
    let url = "/api/user/auth";
    fetch(url, {
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
            const greeting = document.getElementById("main-greeting");
            greeting.style.display = "block";
            const userName = document.getElementById("user-name");
            userName.textContent = data["data"]["name"];
        } else {
            window.location = "/";
        }
    })
}

// check login status and set username in greeting html item
async function getBooking() {
    let url = "/api/booking";
    let response = await fetch(url, {
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
        let bookingData = data["data"];
        const mainContainer = document.getElementById("main-container");
        if (bookingData) {
            let img = document.createElement("img");
            img.classList.add("booking-main-img");
            img.src = bookingData["attraction"]["image"];
            let infoContainer = document.createElement("div");
            infoContainer.classList.add("booking-main-info-container");
            let infoName = document.createElement("div");
            infoName.classList.add("booking-main-info-name");
            infoName.textContent = "台北一日遊：" + bookingData["attraction"]["name"];
            let infoDateHead = document.createElement("div");
            infoDateHead.classList.add("booking-main-info-head");
            infoDateHead.textContent = "日期：";
            let infoDateInfo = document.createElement("div");
            infoDateInfo.classList.add("booking-main-info-date");
            infoDateInfo.textContent = bookingData["date"];
            let infoTimeHead = document.createElement("div");
            infoTimeHead.classList.add("booking-main-info-head");
            infoTimeHead.textContent = "時間：";
            let infoPriceHead = document.createElement("div");
            infoPriceHead.classList.add("booking-main-info-head");
            infoPriceHead.textContent = "費用：";
            let infoTimeInfo = document.createElement("div");
            infoTimeInfo.classList.add("booking-main-info-info");
            let infoPriceInfo = document.createElement("div");
            infoPriceInfo.classList.add("booking-main-info-info");
            let checkoutTotal = document.getElementById("checkout-total");
            if (bookingData["time"] == "morning") {
                infoTimeInfo.textContent = "早上 9 點到下午 4 點";
                infoPriceInfo.textContent = "新台幣 2000 元";
                checkoutTotal.textContent = "總價：新台幣 2000 元";
            } else {
                infoTimeInfo.textContent = "下午 1 點到晚上 8 點";
                infoPriceInfo.textContent = "新台幣 2500 元";
                checkoutTotal.textContent = "總價：新台幣 2500 元";
            }
            let infoAddressHead = document.createElement("div");
            infoAddressHead.classList.add("booking-main-info-head");
            infoAddressHead.textContent = "地點：";
            let infoAddressInfo = document.createElement("div");
            infoAddressInfo.classList.add("booking-main-info-info");
            infoAddressInfo.textContent = bookingData["attraction"]["address"];
            let deleteButton = document.createElement("button");
            deleteButton.classList.add("booking-main-delete-button");
            deleteButton.addEventListener("click", deleteBooking);

            mainContainer.appendChild(img);
            mainContainer.appendChild(infoContainer);
            infoContainer.appendChild(infoName);
            infoContainer.appendChild(infoDateHead);
            infoContainer.appendChild(infoDateInfo);
            infoContainer.appendChild(infoTimeHead);
            infoContainer.appendChild(infoTimeInfo);
            infoContainer.appendChild(infoPriceHead);
            infoContainer.appendChild(infoPriceInfo);
            infoContainer.appendChild(infoAddressHead);
            infoContainer.appendChild(infoAddressInfo);
            mainContainer.appendChild(deleteButton);

            let contactInfo = document.getElementById("contact-info");
            let paymentInfo = document.getElementById("payment-info");
            let checkoutInfo = document.getElementById("checkout-info");
            contactInfo.style.display = "grid";
            paymentInfo.style.display = "grid";
            checkoutInfo.style.display = "grid";
        } else {
            let nonBookedText = document.createElement("div");
            nonBookedText.classList.add("booking-main-non-booking-text");
            nonBookedText.textContent = "目前沒有任何待預訂的行程";
            mainContainer.appendChild(nonBookedText);
        }
        return data;
    })
    .catch((error) => {
        console.log(error);
    })
    attraction = response["data"];
}

function deleteBooking() {
    let url = "/api/booking";
    fetch(url, {
        method: "DELETE",
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
    })
    .then((res) => {
        res.json();
    })
    .then((data) => {
        window.location.reload();
    })
    .catch((error) => {
        return error;
    })
}