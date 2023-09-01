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
            document.body.style.backgroundImage = "url(https://i.pinimg.com/originals/88/99/59/8899591fcde45ec3991ef48efb053e74.jpg)";
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
    const modalElement = document.getElementById("waitingModel");
    const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
    modal.show();
    setTimeout(() => {
        console.log(room);
        modal.hide();
        localStorage.setItem("PlayerId", playerId);
        location.replace("/Home/Room");
    }, 1500);
});

connection.on("MatchedFail", (message) => {
    switch (message) {
        case "error":
            alert("Error ocur!!! Please match again!!!");
            break;
        case "full":
            alert("The room is full!!! Please match again!!!");
            break;
        default:
            break;
    }
    connection.stop();
});

document.getElementById("game").onchange = () => {
    onGameChange();
}

document.getElementById("roomType").onchange = () => {
    const roomType = document.getElementById("roomType").value;
    document.body.style.backgroundImage = "url(https://static.vecteezy.com/system/resources/thumbnails/010/047/365/original/retro-land-80s-retro-futuristic-sci-fi-seamless-loop-retro-background-animation-low-poly-terrain-retro-1980s-background-and-a-luorescent-visual-background-retro-neon-background-in-80-s-style-free-video.jpg)";
    if (roomType === "1") {
        const roomId = document.getElementById("roomIdContainer");
        const game = document.getElementById("gameContainer");
        const teamsize = document.getElementById("teamSizeContainer");
        game.classList.replace("d-none", "d-flex");
        teamsize.classList.replace("d-none", "d-flex");
        roomId.classList.replace("d-flex", "d-none");
    }
    else if (roomType == "2") {
        const roomId = document.getElementById("roomIdContainer");
        const game = document.getElementById("gameContainer");
        const teamsize = document.getElementById("teamSizeContainer");
        roomId.classList.replace("d-none", "d-flex");
        game.classList.replace("d-flex", "d-none");
        teamsize.classList.replace("d-flex", "d-none");
    }
};

document.getElementById("findGameBtn").onclick = () => {
    const roomType = document.getElementById("roomType");
    const game = document.getElementById("game");
    const name = document.getElementById("name");
    const teamSize = document.getElementById("teamSize");
    const roomId = document.getElementById("roomId");
    if (name.reportValidity() && roomType.reportValidity()) {
        if ((roomType.value === "1") && (game.reportValidity()) && (teamSize.reportValidity())
            || ((roomType.value === "2") && (roomId.reportValidity()))) {
            connection.start().then(function () {
                console.log("Connected!");
                if (roomType.value === "1") {
                    const sendMessage = {
                        "game": game.value,
                        "teamSize": teamSize.value,
                        "name": name.value,
                    }
                    connection.invoke("Matching", sendMessage);
                }
                else
                    if (roomType.value === "2") {
                        connection.invoke("MatchingWithRoomId", roomId.value, name.value);
                    }
            }).catch(function (err) {
                console.error(err.toString());
            });
        }
    }
}


document.getElementById("cancelBtn").onclick = () => {
    connection.stop();
}
