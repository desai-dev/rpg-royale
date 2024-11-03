package main

import (
	"math"
)

type Gun struct {
	bulletType     string
	reloadTime     float64
	cooldown       float64
	rotationAmount float64
}

func NewGun(bulletType string) *Gun {
	var rotationAmount float64
	if bulletType == "Sniper" { // TODO: get rid of hardcoded stuff
		rotationAmount = sniperRotationAmount
	} else if bulletType == "Wallbreaker" {
		rotationAmount = wallbreakerRotationAmount
	}
	return &Gun{
		bulletType:     bulletType,
		reloadTime:     sniperCooldown,
		cooldown:       0,
		rotationAmount: rotationAmount,
	}
}

func (g *Gun) shootBullet(player *Client, deltaTime float64) *Bullet {
	radians := player.gunRotation * (math.Pi / 180)
	velocityX := math.Cos(radians)
	velocityY := math.Sin(radians)

	if g.bulletType == "Sniper" {
		bulletX := player.position.X + sniperWidth*math.Cos(radians)
		bulletY := player.position.Y + sniperWidth*math.Sin(radians)
		return NewSniperBullet(player.playerId, velocityX, velocityY, bulletX, bulletY, deltaTime)
	} else {
		bulletX := player.position.X + wallbreakerWidth*math.Cos(radians)
		bulletY := player.position.Y + wallbreakerWidth*math.Sin(radians)
		return NewWallbreakerBullet(player.playerId, velocityX, velocityY, bulletX, bulletY, deltaTime)
	}
}
