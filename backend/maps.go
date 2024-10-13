package main

// Maps will define coordinates where collision blocks should be rendered
// Maps are tile maps that are based on a 64x36 grid
var defaultMap = [][2]int{
	{30, 27},
	{31, 27},
	{32, 27},
	{33, 27},
	{34, 27},
	{35, 27},
	{36, 27},
	{37, 27},
	{38, 27},
	{39, 27},
	{40, 27},
	{41, 27},
	{13, 31},
	{14, 31},
	{15, 31},
	{16, 31},
	{17, 31},
	{18, 31},
	{19, 31},
	{20, 31},
	{21, 31},
	{22, 31},
	{23, 31},
}

func initializeDefaultMap() {
	for x := 0; x < 64; x++ {
		defaultMap = append(defaultMap, [2]int{x, 35})
	}

	for y1 := 0; y1 < 36; y1++ {
		defaultMap = append(defaultMap, [2]int{0, y1})
	}

	for y2 := 0; y2 < 36; y2++ {
		defaultMap = append(defaultMap, [2]int{63, y2})
	}
}
