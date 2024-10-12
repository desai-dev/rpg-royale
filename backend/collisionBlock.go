package main

type CollisionBlock struct {
	position Position
	width    float64
	height   float64
}

// Initializes a new collision block
func NewCollisionBlock(width float64, height float64, x float64, y float64) *CollisionBlock {
	return &CollisionBlock{
		position: Position{X: x, Y: y},
		width:    width,
		height:   height,
	}
}

//////// ******** Functions for Collider interface implementation ******** ////////

func (c *CollisionBlock) Position() Position {
	return c.position
}

func (c *CollisionBlock) Width() float64 {
	return c.width
}

func (c *CollisionBlock) Height() float64 {
	return c.height
}

//////// ******** End of Functions for Collider interface implementation ******** ////////
