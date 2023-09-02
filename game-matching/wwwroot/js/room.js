let localStream = null;
let pConnection = {};
const offerOptions = {
    offerToReceiveAudio: 1,
};
let soundTriggers = {};
let analysers = {};
var audioCtx = new AudioContext();

const checkSound = (socketId) => {
    var dataArray = new Float32Array(analysers[socketId].fftSize);
    analysers[socketId].getFloatTimeDomainData(dataArray);
    var sum = 0;
    for (var i = 0; i < analysers[socketId].fftSize; i++) {
        sum += Math.abs(dataArray[i]);
    }
    return (sum / analysers[socketId].fftSize) > 0.001;
}

var connection = new signalR.HubConnectionBuilder().withUrl("/matchingHub").build();
connection.start().then(function () {
    const playerId = localStorage.getItem("PlayerId");
    if (playerId == null) {
    window.location.replace("/");
    }
    localStorage.removeItem("PlayerId");
    if (localStream == null) {
        navigator.mediaDevices.getUserMedia({
            audio: true, video: false
        }).then((stream) => {
            localStream = stream;
            connection.invoke("ReMatching", playerId);
        });
    }
});

const createPeerConnection = async (isMuted, socketId) => {
    if (isMuted) {
        localStream.getAudioTracks()[0].enabled = false;
    }
    pConnection[socketId] = new RTCPeerConnection();

    pConnection[socketId].addEventListener('icecandidate', (e) => {
        connection.invoke("MicRequest", JSON.stringify({ "data": e.candidate }), "candidate", socketId);
    });

    pConnection[socketId].addEventListener('track', (e) => {
        let audio = document.getElementById(`audio${socketId}`);
        audio.srcObject = e.streams[0];
        var source = audioCtx.createMediaStreamSource(audio.srcObject);
        if (analysers[socketId] == null) {
            analysers[socketId] = audioCtx.createAnalyser();
        }
        source.connect(analysers[socketId]);
        const trigger = setInterval(() => {
            var ele = document.getElementById(socketId);
            if (checkSound(socketId)) {
                ele.classList.remove("border-secondary");
                ele.classList.add("border-success");
                ele.classList.add("shadow-sm");
                ele.classList.add("border-2");
            }
            else {
                ele.classList.remove("border-success");
                ele.classList.remove("shadow-sm");
                ele.classList.remove("border-2");
                ele.classList.add("border-secondary");
            }
        });
        soundTriggers[socketId] = trigger;
        audio.play();
    });

    await pConnection[socketId].addTrack(...localStream.getAudioTracks(), localStream);
}

const handShake = async (socketId) => {
    const offer = await pConnection[socketId].createOffer();
    await pConnection[socketId].setLocalDescription(offer);
    await connection.invoke("MicRequest", JSON.stringify({ "data": offer }), "offer", socketId);
}

const getAddPlayerHtml = (player) => {
    let audioEle = document.createElement("audio");
    audioEle.id = "audio" + player.socketId;
    audioEle.className = "audioClass";
    document.body.appendChild(audioEle);
    return (`
        <div class="card border-secondary mb-2" style="height: 80px" id="${player.socketId}">
            <div class="card-header d-flex justify-content-center align-items-center" style="height: 30px">
                <div class="col-md-11">${player.name}</div>
                <div class="d-none col-md-1 ownerSignal"  id="${"owner" + player.socketId}">
                    <i class="fa fa-diamond" aria-hidden="true"></i>
                </div>
                <div class="d-none col-md-1 kickBtn" style="cursor: pointer;" onclick="kick('${player.socketId}')" id="${"kick" + player.socketId}">
                    <i class="fa fa-times" aria-hidden="true"></i>
                </div>
            </div>
            <div class="card-body text-secondary">
                <h5 class="card-title d-flex justify-content-center">
                    <i class="fa fa-microphone" aria-hidden="true" style="width: 20px" onclick="changeMicFunction('${"mic" + player.socketId}')" id=${"mic" + player.socketId}></i>
                </h5>
            </div>
        </div>
    `);
}

const kick = (socketId) => {
    if (window.confirm("Are you sure to let your teammate leave this room?")) {
        connection.invoke("KickPlayer", socketId);
    }
};

connection.on("ReMatched", async (list, roomOnwer, isBlock) => {
    var listElement = document.getElementById("playersList");
    if (isBlock) {
        const lock = document.getElementById("lockBtn");
        lock.innerHTML = `<i class="fa fa-lock" aria-hidden="true"></i>`;
    }
    for (let i = 0; i < list.length; ++i) {
        if (list[i].socketId != connection.connection.connectionId) {
            listElement.innerHTML = listElement.innerHTML + getAddPlayerHtml(list[i]);
        }
        else {
            switch (list[i].game) {
                case "1":
                    document.body.style.backgroundImage = "url(https://i.kinja-img.com/gawker-media/image/upload/c_fill,f_auto,fl_progressive,g_center,h_675,pg_1,q_80,w_1200/dc1565cd94e2c98927f2141109446455.jpg)";
                    document.body.style.backgroundRepeat = "no-repeat";
                    document.body.style.backgroundSize = "cover";
                    break;
                case "2":
                    document.body.style.backgroundImage = "url(https://cdn.vn.garenanow.com/web/fo4vn/2020-Nov/Beckham/Beckham.jpg)";
                    document.body.style.backgroundRepeat = "no-repeat";
                    document.body.style.backgroundSize = "cover";
                    break;
                case "3":
                    document.body.style.backgroundImage = "url(https://cdn.sforum.vn/sforum/wp-content/uploads/2022/07/mobile-game-publishers-1024x480-1.png)";
                    document.body.style.backgroundRepeat = "no-repeat";
                    document.body.style.backgroundSize = "cover";
                    break;
                default:
                    break;
            }

        }
    }

    await setTimeout(async () => {
        for (let i = 0; i < list.length; ++i) {
            if (list[i].socketId != connection.connection.connectionId) {
                if (list[i].socketId === roomOnwer.socketId) {
                    const ownerEle = document.getElementById("owner" + list[i].socketId);
                    ownerEle.classList.replace("d-none", "d-flex");
                }
                await createPeerConnection(true, list[i].socketId);
                await handShake(list[i].socketId);
            }
            else {
                if (list[i].socketId === roomOnwer.socketId) {
                    myOnwer.classList.replace("d-none", "d-flex");
                    const kickList = document.getElementsByClassName("kickBtn");
                    for (let j = 0; j < kickList.length; ++j) {
                        kickList[j].classList.replace("d-none", "d-flex");
                    }
                }
            }
        }
    }, 1000);
});

connection.on("ReMatchedFail", () => {
    console.log("fail");
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

connection.on("PlayerAdded", async (player) => {
    var playerListEle = document.getElementById("playersList");
    playerListEle.innerHTML = playerListEle.innerHTML + getAddPlayerHtml(player);
    if (pConnection[player.socketId] == null) {
        let isMuted = document.getElementById("myMic").classList.contains("fa-microphone-slash");
        await createPeerConnection(isMuted, player.socketId);
    }
    if (myOnwer.classList.contains("d-flex")) {
        console.log("abc");
        var kickEle = document.getElementById("kick" + player.socketId);
        kickEle.classList.replace("d-none", "d-flex");
    }
    const toastEle = document.getElementById("newPlayerToast");
    const toast = bootstrap.Toast.getOrCreateInstance(toastEle);
    toast.show();
});

const updateNewOwner = (newOwnerSocketId) => {
    if (newOwnerSocketId === connection.connection.connectionId) {
        myOnwer.classList.replace("d-none", "d-flex");
        const kickList = document.getElementsByClassName("kickBtn");
        for (let j = 0; j < kickList.length; ++j) {
            kickList[j].classList.replace("d-none", "d-flex");
        }
    }
    else {
        var playerListEle = document.getElementsByClassName("ownerSignal");
        for (var i = 0; i < playerListEle.length; ++i) {
            if (playerListEle[i].id === ("owner" + newOwnerSocketId)) {
                playerListEle[i].classList.replace("d-none", "d-flex");
            }
        }
    }
};

connection.on("PlayerDisconnected", (player, newOwnerSocketId) => {
    var playerEle = document.getElementById(player.socketId);
    playerEle?.remove();
    const toastEle = document.getElementById("removePlayerToast");
    const toast = bootstrap.Toast.getOrCreateInstance(toastEle);
    if (pConnection[player.socketId] != null) {
        pConnection[player.socketId].close();
        delete pConnection[player.socketId];
        document.getElementById(`audio${player.socketId}`).remove();
    }
    if (soundTriggers[player.socketId] != null) {
        clearInterval(soundTriggers[player.socketId]);
        delete soundTriggers[player.socketId];
    }
    if (analysers[player.socketId] != null) {
        delete analysers[player.socketId];
    }
    updateNewOwner(newOwnerSocketId);
    toast.show();
});

connection.on("MicResponse", async (data, type, socketId) => {
    data = JSON.parse(data);
    if (pConnection[socketId] == null) {
        let checkExisted = setInterval(() => {
            if (pConnection[socketId] != null) {
                clearInterval(checkExisted);
            }
        });
    }

    try {
        switch (type) {
            case "offer":
                await pConnection[socketId].setRemoteDescription(new RTCSessionDescription(data.data));
                var answer = await pConnection[socketId].createAnswer();
                await pConnection[socketId].setLocalDescription(answer);
                await connection.invoke("MicRequest", JSON.stringify({ "data": answer }), "answer", socketId);
                break;
            case "answer":
                await pConnection[socketId].setRemoteDescription(new RTCSessionDescription(data.data));
                break;
            case "candidate":
                await pConnection[socketId].addIceCandidate(new RTCIceCandidate(data.data));
                break;
            default:
                break;
        }
    } catch (e) {
        //console.log(e);
    }
});

connection.on("IsChatting", () => {
    var chatBox = document.getElementById("chatting");
    chatBox.style.visibility = "visible";
    setTimeout(() => {
        chatBox.style.visibility = "hidden";
    }, 1000);
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
            var audio = document.getElementById(`audio${id.substring(3)}`);
            audio.srcObject.getAudioTracks()[0].enabled = true;
        }
    }
    else {
        myMicEle.classList.remove("fa-microphone");
        myMicEle.classList.add("fa-microphone-slash");
        if (id === "myMic") {
            localStream.getAudioTracks()[0].enabled = false;
        }
        else {
            var audio = document.getElementById(`audio${id.substring(3)}`);
            audio.srcObject.getAudioTracks()[0].enabled = false;
        }
    }
};

const chatFunction = () => {
    var input = document.getElementById("chatInput");
    if (input.value.length > 0) {
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
}

document.getElementById("chatBtn").onclick = chatFunction;
document.getElementById("lockBtn").onclick = () => {
    const lock = document.getElementById("lockBtn");
    if (lock.innerHTML.includes("fa-unlock")) {
        connection.invoke("LockRoom");
    } else {
        connection.invoke("UnlockRoom");
    }
};
document.getElementById("chatInput").addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        chatFunction();
    }
    else {
        connection.invoke("OnChatting");
    }
});
document.getElementById("exitBtn").onclick = () => {
    window.location.replace("/");
};
document.getElementById("copyBtn").onclick = () => {
    connection.invoke("GetRoomId");
};

connection.on("LockedRoom", () => {
    const lock = document.getElementById("lockBtn");
    lock.innerHTML = `<i class="fa fa-lock" aria-hidden="true"></i>`;
});

connection.on("UnlockedRoom", () => {
    const lock = document.getElementById("lockBtn");
    lock.innerHTML = `<i class="fa fa-unlock" aria-hidden="true"></i>`;
});

connection.on("NotOwner", () => {
    alert("You are not the room owner!!!");
});

connection.on("Kicked", () => {
    alert("You have kicked by room owner :D!!!!");
    connection.stop();
    setTimeout(() => {
        location.replace("/");
    }, 2000);
});

connection.on("ReceiveRoom", (roomId) => {
    document.getElementById("copyBtn").innerHTML = `<i class="fa fa-check" aria-hidden="true"></i>`;
    setTimeout(() => {
        document.getElementById("copyBtn").innerHTML = `<i class="fa fa-clone" aria-hidden="true"></i>`;
    }, 1000);
    navigator.clipboard.writeText(roomId);
});

document.getElementById("myMic").onclick = () => changeMicFunction("myMic");
document.getElementById("myVolume").onclick = () => {
    var myMicEle = document.getElementById("myVolume");
    if (myMicEle.classList.contains("fa-volume-off")) {
        myMicEle.classList.remove("fa-volume-off");
        myMicEle.classList.add("fa-volume-up");
        var audioList = document.getElementsByClassName("audioClass");
        for (let i = 0; i < audioList.length; ++i) {
            audioList[i].srcObject.getAudioTracks()[0].enabled = true;
        }
    }
    else {
        myMicEle.classList.remove("fa-volume-up");
        myMicEle.classList.add("fa-volume-off");
        var audioList = document.getElementsByClassName("audioClass");
        for (let i = 0; i < audioList.length; ++i) {
            audioList[i].srcObject.getAudioTracks()[0].enabled = false;
        }
    }
};

