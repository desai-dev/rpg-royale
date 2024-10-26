package main

// Maps will define coordinates where collision blocks should be rendered
// Maps are tile maps that are based on a 64x36 grid
var defaultMap = [][2]int{
	{27, 27},
	{28, 27},
	{29, 27},
	{30, 27},
	{31, 27},
	{32, 27},
	{33, 27},
	{34, 27},
	{35, 27},
	{36, 27},

	{36, 23},
	{37, 23},
	{38, 23},
	{39, 23},
	{40, 23},
	{41, 23},

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

	{50, 31},
	{51, 31},
	{52, 31},
	{53, 31},
	{54, 31},

	{4, 23},
	{5, 23},
	{6, 23},
	{7, 23},
	{8, 23},
	{9, 23},
	{10, 23},
	{11, 23},
	{12, 23},
	{13, 23},
	{14, 23},

	{18, 24},
	{19, 24},
	{20, 24},

	{51, 17},
	{52, 17},
	{53, 17},
	{54, 17},
	{55, 17},
	{56, 17},
	{57, 17},
	{58, 17},

	{45, 20},
	{46, 20},
	{47, 20},
	{48, 20},
	{49, 20},
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
