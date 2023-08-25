let localStream;
let pConnection = null;
let audioSender;
const offerOptions = {
    offerToReceiveAudio: 1,
};

const createPeerConnection = async (isMuted) => {
    const stream = await navigator.mediaDevices.getUserMedia({
        audio: true, video: false
    });
    localStream = stream;
    if (isMuted) {
        localStream.getAudioTracks()[0].enabled = false;
    }
    pConnection = new RTCPeerConnection();

    pConnection.addEventListener('icecandidate', (e) => {
        connection.invoke("MicRequest", JSON.stringify({ "data": e.candidate }), "candidate");
    });

    pConnection.addEventListener('track', async (e) => {
        var audio = document.getElementById("audio");
        audio.srcObject = e.streams[0];
        audio.play();
    });

    audioSender = await pConnection.addTrack(...localStream.getAudioTracks(), localStream);
}


var connection = new signalR.HubConnectionBuilder().withUrl("/matchingHub").build();
connection.start().then(function () {
    console.log(connection.connection.connectionId);
    const playerId = localStorage.getItem("PlayerId");
    console.log(playerId);
    connection.invoke("ReMatching", playerId);
}).then(async () => {
    createPeerConnection(true).then(async () => {
        const offer = await pConnection.createOffer();
        await pConnection.setLocalDescription(offer);
        await connection.invoke("MicRequest", JSON.stringify({ "data": offer }), "offer");
    }
    );
}).catch(function (err) {
    console.error(err.toString());
});

const getAddPlayerHtml = (player) => {
    return (`
        <div class="card border-secondary mb-2" style="height: 80px" id="${player.id}">
            <div class="card-header d-flex justify-content-center align-items-center" style="height: 30px">${player.name}</div>
            <div class="card-body text-secondary">
                <h5 class="card-title d-flex justify-content-center">
                    <i class="fa fa-microphone" aria-hidden="true" style="width: 20px" onclick="changeMicFunction('${"mic" + player.id}')" id=${"mic" + player.id}></i>
                </h5>
            </div>
        </div>
    `);
}

connection.on("ReMatched", (list) => {
    var listElement = document.getElementById("playersList");
    for (let i = 0; i < list.length; ++i) {
        if (list[i].socketId != connection.connection.connectionId) {
            listElement.innerHTML = listElement.innerHTML + getAddPlayerHtml(list[i]);
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
    var playerListEle = document.getElementById("playersList");
    playerListEle.innerHTML = playerListEle.innerHTML + getAddPlayerHtml(player);
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



connection.on("MicResponse", async (data, type) => {
    data = JSON.parse(data);
    try {
        switch (type) {
            case "offer":
                await pConnection.setRemoteDescription(new RTCSessionDescription(data.data));
                var answer = await pConnection.createAnswer();
                await pConnection.setLocalDescription(answer);
                await connection.invoke("MicRequest", JSON.stringify({ "data": answer }), "answer");
                break;
            case "answer":
                await pConnection.setRemoteDescription(new RTCSessionDescription(data.data));
                break;
            case "candidate":
                await pConnection.addIceCandidate(new RTCIceCandidate(data.data));
                break;
            default:
                break;
        }
    } catch (e) {
        //console.log(e);
    }
});

const changeMicFunction = async (id) => {
    var myMicEle = document.getElementById(id);
    if (myMicEle.classList.contains("fa-microphone-slash")) {
        myMicEle.classList.remove("fa-microphone-slash");
        myMicEle.classList.add("fa-microphone");
        if (id === "myMic") {
            localStream.getAudioTracks()[0].enabled = true;
        }
        else {
        }

    }
    else {
        myMicEle.classList.remove("fa-microphone");
        myMicEle.classList.add("fa-microphone-slash");
        if (id === "myMic") {
            localStream.getAudioTracks()[0].enabled = false;
        }
        else {

        }
    }
};

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
document.getElementById("myMic").onclick = () => changeMicFunction("myMic");
document.getElementById("myVolume").onclick = () => {
    var myMicEle = document.getElementById("myVolume");
    if (myMicEle.classList.contains("fa-volume-off")) {
        myMicEle.classList.remove("fa-volume-off");
        myMicEle.classList.add("fa-volume-up");
    }
    else {
        myMicEle.classList.remove("fa-volume-up");
        myMicEle.classList.add("fa-volume-off");
    }
};