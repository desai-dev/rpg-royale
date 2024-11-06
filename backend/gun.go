package main

import (
	"math"
)

// A Gun
type Gun struct {
	bulletType     *BulletType
	reloadTime     float64
	cooldown       float64
	rotationAmount float64
	width          float64
	height         float64
}

// Initializes a new gun
func NewGun(bulletType *BulletType, reloadTime float64, rotationAmount float64, width float64, height float64) *Gun {
	return &Gun{
		bulletType:     bulletType,
		reloadTime:     reloadTime,
		cooldown:       0,
		rotationAmount: rotationAmount,
		width:          width,
		height:         height,
	}
}

// Creates a Bullet based on client position and gun angle
func (g *Gun) shootBullet(player *Client, deltaTime float64) *Bullet {
	radians := player.gunRotation * (math.Pi / 180)
	velocityX := math.Cos(radians) * float64(player.direction)
	velocityY := math.Sin(radians)

	// Adjust initial position based on direction and bullet width
	var offsetX, offsetY float64
	if player.direction == -1 {
		offsetX = -g.width / 2 * math.Cos(radians)
		offsetY = g.height / 2 * math.Sin(radians)
	} else {
		offsetX = g.width / 2 * math.Cos(radians)
		offsetY = g.height / 2 * math.Sin(radians)
	}

	bulletX := player.position.X + offsetX
	bulletY := player.position.Y + offsetY

	return NewBullet(player.playerId, g.bulletType, velocityX, velocityY, bulletX, bulletY, deltaTime)
}
