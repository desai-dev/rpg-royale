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
	velocityX := math.Cos(radians) * float64(player.direction)
	velocityY := math.Sin(radians)
	var bulletX, bulletY float64

	if g.bulletType == "Sniper" {
		if player.direction == -1 {
			bulletX = player.position.X - (sniperWidth/2)*math.Cos(radians)
			bulletY = player.position.Y + (sniperWidth/2)*math.Sin(radians)
		} else {
			bulletX = player.position.X + (sniperWidth/2)*math.Cos(radians)
			bulletY = player.position.Y + (sniperWidth/2)*math.Sin(radians)
		}
		return NewSniperBullet(player.playerId, velocityX, velocityY, bulletX, bulletY, deltaTime)
	} else {
		if player.direction == -1 {
			bulletX = player.position.X - (wallbreakerWidth/2)*math.Cos(radians)
			bulletY = player.position.Y + (wallbreakerWidth/2)*math.Sin(radians)
		} else {
			bulletX = player.position.X + (wallbreakerWidth/2)*math.Cos(radians)
			bulletY = player.position.Y + (wallbreakerWidth/2)*math.Sin(radians)
		}
		return NewWallbreakerBullet(player.playerId, velocityX, velocityY, bulletX, bulletY, deltaTime)
	}
}
