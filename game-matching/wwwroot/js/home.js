function onGameChange() {
    const gameId = document.getElementById("game").value;
    let teamSize = document.getElementById("teamSize");

    switch (gameId) {
        case "1":
            teamSize.value = "5";
            teamSize.readOnly = true;
            break;
        case "2":
            teamSize.value = "2";
            teamSize.readOnly = true;
            break;
        case "3":
            teamSize.value = "1";
            teamSize.readOnly = false;
            break;
        default:
            break;
    }
}

onGameChange();

var connection = new signalR.HubConnectionBuilder().withUrl("/matchingHub").build();

connection.on("Matched", (room, playerId) => {
    console.log(room);
    const modalElement = document.getElementById("waitingModel");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.hide();
    localStorage.setItem("PlayerId", playerId);
    location.replace("/Home/Room");
});

document.getElementById("game").onchange = () => {
    onGameChange();
}

document.getElementById("findGameBtn").onclick = () => {
    connection.start().then(function () {
        console.log("Connected!");
        const game = document.getElementById("game").value;
        const teamSize = document.getElementById("teamSize").value;
        const name = document.getElementById("name").value;
        const sendMessage = {
            "game": game,
            "teamSize": teamSize,
            "name": name
        }
        connection.invoke("Matching", sendMessage);
    }).catch(function (err) {
        console.error(err.toString());
    });
}


document.getElementById("cancelBtn").onclick = () => {
    connection.stop();
}
