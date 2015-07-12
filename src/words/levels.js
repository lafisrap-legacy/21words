$42.LEVEL_TYPE_GIVEN    = 1;
$42.LEVEL_TYPE_PREFIX   = 2;
$42.LEVEL_TYPE_FREE     = 3;
$42.LEVEL_MIN_PREFIX_CANDIDATES = 5;
$42.LEVEL_DEVS = [{             // Level 1
    type: $42.LEVEL_TYPE_GIVEN,
    words: 3,
    minValue:   0,        // min word value that is shown
    minDemand:  0,        // min word value that is enough for winning
    maxValue:   0,
    minLength:  4,
    maxLength:  4
},{                             // Level 2
    type: $42.LEVEL_TYPE_GIVEN,
    words: 4,
    minValue:   0,
    minDemand:  0,
    maxValue:   0,
    minLength:  5,
    maxLength:  6
},{                             // Level 3
    type: $42.LEVEL_TYPE_GIVEN,
    words: 5,
    minValue:   0,
    minDemand:  0,
    minLength:  7,
    maxLength:  9
},{                             // Level 4
    type: $42.LEVEL_TYPE_PREFIX,
    words: 5,
    minValue:   0,
    minDemand:  0,
    minLength:  4,
    maxLength:  0
},{                             // Level 5
    type: $42.LEVEL_TYPE_PREFIX,
    words: 5,
    minValue:   0,
    minDemand:  0,
    minLength:  6,
    maxLength:  0
},{                             // Level 6
    type: $42.LEVEL_TYPE_PREFIX,
    words: 5,
    minValue:   10,
    minDemand:  10,
    minLength:  0,
    maxLength:  0
},{                             // Level 7
    type: $42.LEVEL_TYPE_FREE,
    words: 5,
    minValue:   0,
    minDemand:  0,
    minLength:  4,
    maxLength:  0
},{                             // Level 8
    type: $42.LEVEL_TYPE_FREE,
    words: 5,
    minValue:   10,
    minDemand:  10,
    minLength:  0,
    maxLength:  0
},{                             // Level 9
    type: $42.LEVEL_TYPE_FREE,
    words: 4,
    minValue:   15,
    minDemand:  15,
    minLength:  4,
    maxLength:  0
},{                             // Level 10
    type: $42.LEVEL_TYPE_GIVEN,
    words: 1,
    minValue:   14,
    minDemand:  42,
    minLength:  0,
    maxLength:  0
}];

