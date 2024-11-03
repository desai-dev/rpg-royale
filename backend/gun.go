package main

type Gun struct {
	bulletType string
	reloadTime float64
	cooldown   float64
}

func NewGun(bulletType string) *Gun {
	return &Gun{
		bulletType: bulletType,
		reloadTime: sniperCooldown,
		cooldown:   0,
	}
}

func (g *Gun) shootBullet(player *Client, deltaTime float64) *Bullet {
	velocityDir := -1
	if player.lastXMovement == "ArrowRight" { // TODO: remove hardcoded stuff
		velocityDir = 1
	}

	bulletX := player.position.X + player.width + 0.01

	if g.bulletType == "Sniper" {
		if velocityDir == -1 {
			bulletX = player.position.X - sniperBulletWidth - 0.01
		}
		return NewSniperBullet(player.playerId, velocityDir, bulletX, player.position.Y, deltaTime)
	} else {
		if velocityDir == -1 {
			bulletX = player.position.X - wallbreakerBulletWidth - 0.01
		}
		return NewWallbreakerBullet(player.playerId, velocityDir, bulletX, player.position.Y, deltaTime)
	}
}