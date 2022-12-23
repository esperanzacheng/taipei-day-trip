let thisUrl = window.location.href;
let thisNb = thisUrl.split("=").pop();

window.onload = function() {
    ajax();
    homeLink();
    bookLink();
    userRegister();
    userLogin();
    userLogOut();
    getOrder(thisNb);
}

function getOrder(nb) {
    let url = `/api/order/${nb}`;
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
        const orderResult = data["data"];
        const orderHead = document.getElementById("order-head");
        const orderNb = document.getElementById("order-nb");
        const orderText = document.getElementById("order-text");
        if (orderResult) {
            if (orderResult["status"] == 0) {
                orderHead.textContent = "行程預定成功，訂單編號如下：";
                orderNb.textContent = data["data"]["number"];
                orderText.textContent = "請收好行囊，我們當天見！";
            } else {
                orderHead.textContent = "付款過程出錯，煩請重新操作";
                orderText.textContent = "請點此回到付款頁面";
                orderText.setAttribute("href", "/booking");
            }
        } else {
            orderHead.textContent = "尚無已預訂之行程";
            orderText.textContent = "請點此回首頁逛逛";
            orderText.setAttribute("href", "/");
        }

    })
    .catch((error) => {
        return error;
    })
}