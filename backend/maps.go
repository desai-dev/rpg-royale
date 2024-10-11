package main

// Maps will define coordinates where collision blocks should be rendered
// Maps are tile maps that are based on a 64x36 grid
var defaultMap = [][2]int{
	{0, 0},
	{63, 0},
}

func initializeDefaultMap() {
	for x := 0; x < 64; x++ {
		defaultMap = append(defaultMap, [2]int{x, 35})
	}
}
