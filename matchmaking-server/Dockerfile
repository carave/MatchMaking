FROM golang:latest

WORKDIR /app

# Copier seulement les fichiers de dépendance d'abord pour exploiter la mise en cache des couches Docker
COPY go.mod .
COPY go.sum .

# Télécharger les dépendances
RUN go mod download

# Copier le reste des fichiers de l'application
COPY . .

# Changer le répertoire de travail pour correspondre à l'emplacement du main.go
WORKDIR /app/cmd/server

# Compiler l'application
RUN go build -o main .

# Commande pour exécuter l'application
CMD ["/app/cmd/server/main"]