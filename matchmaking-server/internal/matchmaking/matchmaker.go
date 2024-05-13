package matchmaking

import (
	"context"
	"fmt"
	"log"
	"matchmaking-server/pkg/database" // Assurez-vous que le chemin d'importation est correct

	"go.mongodb.org/mongo-driver/bson"
)

type Player struct {
	Username   string
	SkillLevel int
}

func FindMatch(player Player) {
	collection := database.GetCollection("players")
	// Utilisation de bson.M pour le filtre
	filter := bson.M{"skillLevel": bson.M{"$eq": player.SkillLevel}} // Exemple simpliste
	var opponent Player
	err := collection.FindOne(context.Background(), filter).Decode(&opponent)
	if err != nil {
		log.Println("No match found:", err)
	} else {
		fmt.Println("Match found:", opponent.Username)
	}
}
