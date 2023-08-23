var connection = new signalR.HubConnectionBuilder().withUrl("/matchingHub").build();
connection.start().then(function () {
    console.log(connection.connection.connectionId);
    const playerId = localStorage.getItem("PlayerId");
    console.log(playerId);
    connection.invoke("ReMatching", playerId);
}).catch(function (err) {
    console.error(err.toString());
});

connection.on("ReMatched", (list) => {
    var listElement = document.getElementById("playersList");
    for (let i = 0; i < list.length; ++i) {
        if (list[i].socketId != connection.connection.connectionId) {
            listElement.innerHTML = listElement.innerHTML +
                `
            <div class="card border-secondary mb-2" style="height: 80px" id="${list[i].id}">
                <div class="card-header d-flex justify-content-center align-items-center" style="height: 30px">${list[i].name}</div>
                <div class="card-body text-secondary">
                    <h5 class="card-title d-flex justify-content-center">
                        <i class="fa fa-microphone me-3" aria-hidden="true"></i>
                        <i class="fa fa-headphones" aria-hidden="true"></i>
                    </h5>
                </div>
            </div>
            `
        }
    }
});

connection.on("ReMatchedFail", () => {
    location.replace("/");
});

connection.on("MessageCome", (message, playerName) => {
    var chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = chatBox.innerHTML +
    `
    <div class="row message-body">
        <div class="message-main-receiver">
            <div class="receiver">
                <div class="message-text">
                    <b style="font-weight: bold">${playerName}:</b> ${message}
                </div>
            </div>
        </div>
    </div>
    `
    chatBox.scrollTop = chatBox.scrollHeight;
});

connection.on("PlayerAdded", (player) => {
    console.log(player);
    var playerListEle = document.getElementById("playersList");
    playerListEle.innerHTML = playerListEle.innerHTML +
    `
        <div class="card border-secondary mb-2" style="height: 80px" id="${player.id}">
            <div class="card-header d-flex justify-content-center align-items-center" style="height: 30px">${player.name}</div>
            <div class="card-body text-secondary">
                <h5 class="card-title d-flex justify-content-center">
                    <i class="fa fa-microphone me-3" aria-hidden="true"></i>
                    <i class="fa fa-headphones" aria-hidden="true"></i>
                </h5>
            </div>
        </div>
    `
    const toastEle = document.getElementById("newPlayerToast");
    const toast = bootstrap.Toast.getOrCreateInstance(toastEle);
    toast.show();
});

connection.on("PlayerDisconnected", (player) => {
    var playerEle = document.getElementById(player.id);
    playerEle?.remove();
    const toastEle = document.getElementById("removePlayerToast");
    const toast = bootstrap.Toast.getOrCreateInstance(toastEle);
    toast.show();
});


const chatFunction = () => {
    var input = document.getElementById("chatInput");
    var chatBox = document.getElementById("chatBox");
    chatBox.innerHTML = chatBox.innerHTML +
    `
        <div class="row message-body">
            <div class="message-main-sender">
                <div class="sender">
                    <div class="message-text">
                        ${input.value}
                    </div>
                </div>
            </div>
        </div>
    `
    connection.invoke("ChatRequest", input.value);
    input.value = "";
    chatBox.scrollTop = chatBox.scrollHeight;
}

document.getElementById("chatBtn").onclick = chatFunction;
document.getElementById("chatInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        chatFunction();
    }
});
