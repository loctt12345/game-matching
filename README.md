# Game-Matching
:wave: Welcome to my web application :wave: 

Do you love playing games with other people? Do you want to find new friends who share your passion for gaming? If so, you should try Game-Matching, the web app that connects you to any game you want.  Game-Matching is a platform that lets you join or create games with other players around the world. You can also chat with your teammates, use voice chat. Game-Matching is the ultimate web app for matching game lovers.

#### Link demo: https://ed7e-13-211-78-72.ngrok-free.app/

## Table of contents
- [Feature](#feature)
- [Technology](#technology)

## Feature
1. You can choose 2 types of room:
      -  Random room, if you want to matching with random strangers. In this type, you can choose game you want, choose room size.
      -  Existed room, if your friend created a room, he can copy the room id and send to you. And then, you just paste that id to join specific room.
        
![image](https://github.com/loctt12345/game-matching/assets/78459809/a81511e2-b326-4575-bd34-4b3706f684d3)

2. Chatting: When you join a room, you can chat with your teammates in real time.
3. Voice chat: This feature allows you to communicate with other teammates in real time using your microphone. You can access the voice chat function by clicking on the microphone icon. You can also adjust the volume and mute yourself or others in the voice chat.

 ![image](https://github.com/loctt12345/game-matching/assets/78459809/459e51db-408d-4d87-b1c4-3f9ed9f1eb4c)

4. Lock your room: If you don't want everyone access your room randomly or keep your room private, you can lock the room. This feature will prevent random people access your room and just allows who have your room id access.
5. When a teammate leave or join the room, it will have a notification at the right bottom conner. 

![image](https://github.com/loctt12345/game-matching/assets/78459809/e3f970d6-f0ea-488a-b132-525de736a56b)

## Technology
- This is a ASP.NET Core MVC web app in framework .NET 7.
- Websocket using SignalR library.
- WebRTC for processing peer to peer function (Voice chat).
- MS SQLServer to store queue of players and rooms (I'm using in-memory to store data but i also created a MatchingService for storing data in database using Entity Framework).
- I'm using a simple algorithm to match players: it will find the first room which match some information such as type of games, size of room and the room is not locked.

