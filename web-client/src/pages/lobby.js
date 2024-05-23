document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("lobby-form");
    const usernameInput = document.getElementById("username");
    const queueStatus = document.getElementById("queue-status");
    const leaveButton = document.getElementById("leave-button");
    const botOptions = document.getElementById("bot-options");
    const playVsBotButton = document.getElementById("play-vs-bot");
    const difficultySelect = document.getElementById("difficulty-select");

    let socket; // Déclaration de la variable socket en dehors des fonctions
    let joinTime; // Variable pour stocker l'heure de début de l'attente
    let intervalId; // Variable pour stocker l'ID de l'intervalle

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            joinQueue(username);
        }
    });

    function joinQueue(username) {
        socket = new WebSocket("ws://localhost:8080/ws");

        socket.onopen = function(event) {
            socket.send(JSON.stringify({ type: "join_queue", username: username }));
            queueStatus.textContent = "Joining queue...";
            form.style.display = "none"; // Cacher le formulaire de join queue
            leaveButton.style.display = "block"; // Afficher le bouton leave queue
            botOptions.style.display = "none"; // Cacher les options du bot
            joinTime = Date.now(); // Enregistrer l'heure de début de l'attente
            startTimer(); // Démarrer le minuteur
        };

        socket.onmessage = function(event) {
            const message = JSON.parse(event.data);
            if (message.type === "queue_size") {
                queueStatus.textContent = `Number of players in queue: ${message.count} (Waiting for ${getElapsedTime()})`;
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
            stopTimer(); // Arrêter le minuteur
        };

        socket.onclose = function(event) {
            queueStatus.textContent = "Disconnected from server.";
            leaveButton.style.display = "none"; // Cacher le bouton leave queue
            form.style.display = "block"; // Afficher le formulaire de join queue
            botOptions.style.display = "block"; // Afficher les options du bot
            stopTimer(); // Arrêter le minuteur
        };

        leaveButton.addEventListener("click", function() {
            socket.send(JSON.stringify({ type: "leave_queue", username: username }));
            queueStatus.textContent = "You have left the queue.";
            leaveButton.style.display = "none"; // Cacher le bouton leave queue
            form.style.display = "block"; // Afficher le formulaire de join queue
            botOptions.style.display = "block"; // Afficher les options du bot
            socket.close();
            stopTimer(); // Arrêter le minuteur
        });
    }

    function startTimer() {
        intervalId = setInterval(updateWaitTime, 1000);
    }

    function stopTimer() {
        clearInterval(intervalId);
    }

    function updateWaitTime() {
        const elapsedTime = getElapsedTime();
        const currentText = queueStatus.textContent;
        const match = currentText.match(/Number of players in queue: \d+/);
        if (match) {
            queueStatus.textContent = `${match[0]} (Waiting for ${elapsedTime})`;
        } else {
            queueStatus.textContent = `Waiting for ${elapsedTime}`;
        }
    }

    function getElapsedTime() {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - joinTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        return `${minutes}m ${seconds}s`;
    }

    playVsBotButton.addEventListener("click", function() {
        const difficulty = difficultySelect.value;
        window.location.href = `game.html?player=bot&difficulty=${difficulty}`;
    });
});