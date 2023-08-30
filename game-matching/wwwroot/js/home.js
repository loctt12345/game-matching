function onGameChange() {
    const gameId = document.getElementById("game").value;
    let teamSize = document.getElementById("teamSize");

    switch (gameId) {
        case "1":
            teamSize.value = "5";
            teamSize.readOnly = true;
            document.body.style.backgroundImage = "url(https://i.kinja-img.com/gawker-media/image/upload/c_fill,f_auto,fl_progressive,g_center,h_675,pg_1,q_80,w_1200/dc1565cd94e2c98927f2141109446455.jpg)";
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundSize = "cover";
            break;
        case "2":
            teamSize.value = "2";
            teamSize.readOnly = true;
            document.body.style.backgroundImage = "url(https://cdn.vn.garenanow.com/web/fo4vn/2020-Nov/Beckham/Beckham.jpg)";
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundSize = "cover";
            break;
        case "3":
            teamSize.value = "1";
            teamSize.readOnly = false;
            document.body.style.backgroundImage = "url(https://cdn.sforum.vn/sforum/wp-content/uploads/2022/07/mobile-game-publishers-1024x480-1.png)";
            document.body.style.backgroundRepeat = "no-repeat";
            document.body.style.backgroundSize = "cover";
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
    if (form.reportValidity()) {
        connection.start().then(function () {
            console.log("Connected!");
                const game = document.getElementById("game").value;
                const teamSize = document.getElementById("teamSize").value;
                const name = document.getElementById("name").value;
                const modalElement = document.getElementById("waitingModel");
                const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
                modal.show();
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
}


document.getElementById("cancelBtn").onclick = () => {
    connection.stop();
}
