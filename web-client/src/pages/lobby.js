document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("lobby-form");
    const usernameInput = document.getElementById("username");
    const queueStatus = document.getElementById("queue-status");

    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const username = usernameInput.value.trim();
        if (username) {
            joinQueue(username);
        }
    });

    function joinQueue(username) {
        const socket = new WebSocket("ws://localhost:8080/ws");

        socket.onopen = function(event) {
            socket.send(JSON.stringify({ type: "join_queue", username: username }));
            queueStatus.textContent = "Joining queue...";
        };

        socket.onmessage = function(event) {
            const message = JSON.parse(event.data);
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
        };
    }
});