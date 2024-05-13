package matchmaking

import (
	"context"
	"matchmaking-server/pkg/database" // Assurez-vous que le chemin d'importation est correct
	"time"

	"go.mongodb.org/mongo-driver/bson"
)

type Player struct {
	Username   string
	SkillLevel int
}

func FindMatchForPlayer(player Player) (*Player, error) {
	collection := database.GetCollection("players")
	filter := bson.M{"skillLevel": bson.M{"$eq": player.SkillLevel}}
	var matchedPlayer Player

	err := collection.FindOne(context.Background(), filter).Decode(&matchedPlayer)
	if err != nil {
		return nil, err // Aucun joueur correspondant trouvé ou erreur de DB
	}
	return &matchedPlayer, nil
}

func FindMatchWithTimeAdjustment(player Player, startTime time.Time) (*Player, error) {
	collection := database.GetCollection("players")
	currentTime := time.Now()
	elapsed := currentTime.Sub(startTime)

	// Augmenter la tolérance de niveau de compétence toutes les 30 secondes
	tolerance := int(elapsed.Seconds() / 30)

	filter := bson.M{
		"skillLevel": bson.M{
			"$gte": player.SkillLevel - tolerance,
			"$lte": player.SkillLevel + tolerance,
		},
	}
	var matchedPlayer Player

	err := collection.FindOne(context.Background(), filter).Decode(&matchedPlayer)
	if err != nil {
		return nil, err // Aucun joueur correspondant trouvé ou erreur de DB
	}
	return &matchedPlayer, nil
}
