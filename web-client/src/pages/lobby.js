document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("lobby-form");
    const usernameInput = document.getElementById("username");
    const playVsPlayerButton = document.getElementById("play-vs-player");
    const playVsAiButton = document.getElementById("play-vs-ai");
    const queueStatus = document.getElementById("queue-status");
    const leaveButton = document.createElement("button");
    leaveButton.id = "leave-button";
    leaveButton.textContent = "Leave Queue";
    leaveButton.style.display = "none"; // Initialement caché
    document.body.appendChild(leaveButton);

    let socket; // Déclaration de la variable socket en dehors des fonctions

    playVsPlayerButton.addEventListener("click", function() {
        const username = usernameInput.value.trim();
        if (username) {
            joinQueue(username);
        }
    });

    playVsAiButton.addEventListener("click", function() {
        const username = usernameInput.value.trim();
        if (username) {
            window.location.href = `aiGame.html?player=${username}`;
        }
    });

    function joinQueue(username) {
        socket = new WebSocket("ws://localhost:8080/ws");

        socket.onopen = function(event) {
            socket.send(JSON.stringify({ type: "join_queue", username: username }));
            queueStatus.textContent = "Joining queue...";
            form.style.display = "none"; // Cacher le formulaire de join queue
            leaveButton.style.display = "block"; // Afficher le bouton leave queue
        };

        socket.onmessage = function(event) {
            const message = JSON.parse(event.data);
            if (message.type === "queue_size") {
                queueStatus.textContent = `Number of players in queue: ${message.count}`;
            }
            if (message.type === "match_found") {
                queueStatus.textContent = "Match found! Redirecting to game...";
                setTimeout(() => {
                    window.location.href = `game.html?player=${username}&opponent=${message.opponent}`;
                }, 2000);
            }
        };

        socket.onerror = function(event) {
            queueStatus.textContent = "Error connecting to server.";
        };

        socket.onclose = function(event) {
            queueStatus.textContent = "Disconnected from server.";
            leaveButton.style.display = "none"; // Cacher le bouton leave queue
            form.style.display = "block"; // Afficher le formulaire de join queue
        };

        leaveButton.addEventListener("click", function() {
            socket.send(JSON.stringify({ type: "leave_queue", username: username }));
            queueStatus.textContent = "You have left the queue.";
            leaveButton.style.display = "none"; // Cacher le bouton leave queue
            form.style.display = "block"; // Afficher le formulaire de join queue
            socket.close();
        });
    }
});