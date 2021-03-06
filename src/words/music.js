/////////////////////////////////////////////////////////////
// music.js holds all the music logic, playing background music and sound effects
//
// The first part defines defines the music of the single levels. The second is the actual code.
// Following parameters can be used for defining the music metric
//
// Only for background music (background parameter)
//
// intro:           Introduction music, played once
// introLength:     Length of intro music in seconds
// loop:            Music that is looping, can be set as array
// loopLength:      Length of loop music (must be same data type (string/array( as loop
// loopBars:        Number of bars in a loop piece
// loopBeat:        Number of beats per bar, typically 3, 4, 8, 16
// loopBeatLength:  Length of one beat, only used to set length directly when there is no background music
// fadeOutDelay:    Delay time to start fade out
// fadeOutTime:     Time of fade out / should not overlay the start of any level music
// nextSetOn:       times after sound effects that use "time" option change there sets
// delayTime:       Time till start, default 7000
// 
// Only for effects:

// audio:           One or more sound files, changed after each call to playEffect() or after intervalTime
// audioSet:        A set of sound file groups. Can't be used together with audio. A sound file group can be changed after certain events defined by nextSetOn
// nextSetOn:       Defines when a sound file group is changes. Possible values are:
//                  time:       After time specified in nextSetOn parameter array of background
//                  setTile
//                  fullWord
// playNextSlot:    Change the background music: play next slot. Currently only works with:
//                  setTile 
//                  fullWord 
// intervalTime:    Time until the next sound file is played, same file is played when stayWithSound is true
// minInterval:     Sounds are not played when they follow a preliminary sound faster as this 
// stayWithSound:   Prevents switching the sound file when an interval plays next sound
// dontStop:        Doesn't stop the sound at the end on an interval
// delayTime:       Time after which a sound effect starts
// playOnBeat:      Array that defines the beats when a sound is played, in a 4/4 rhythm that is e.g. [1,3] or [1,2,3,4]
//                  playOnBeat currently works with:
//                  setTile     (new tile comes aligned with sound)
//                  fixTile     (tile fixes aligned with sound)
//                  rotate      (only sound aligned)
//                  swipe       (  "    "      "   )
//                  selection   (  "    "      "   )
//                  fullWord    (  "    "      "   )
//                  deleteRow   (  "    "      "   )
//
// playAfterBeats:  Wait for number of beats. Cannot be used together with playOnBeat
//
// Effects:
//
// levelWords:      When the (mostly) three words appear at the beginning of each level
// levelNr:         When the level number rotates
// setTile:         When a new tile is build
// swipe:           When a tile is dragged by the player
// rotate:          When a tile rotates
// fixTile:         When a tile has landed
// selection:       When a three letter selection appears 
// fullWord:        When a word is completed
// presentWord:     When a completed word flies
// lastWord:        When the last word of a level is completed
// deleteRow:       When a row is deleted
// deleteLastRows:  When (mostly seven) rows get destroyed at level end
// final:           When a level is left

$42.MUSIC_VOLUME_GRANULARITY = 10;

////////////////////////////////////////////////
// Music for easy title
$42.MUSIC_TITLE_EASY = {
    audio:  [res.title_easy_intro_mp3, res.title_easy_loop_1_mp3, res.title_easy_loop_2_mp3],
    audioLoopStart:  1,
    audioLength:     [29.520000, 4.824000, 32.652000],
    fadeOutDelay:    0,
    fadeOutTime:     50,      
    //fadeOutTimeEnd:  4000    // must not be more than any delayTime of backgrounds
}

////////////////////////////////////////////////
// Music for intemediate title
$42.MUSIC_TITLE_INTERMEDIATE = {
    audio:  [res.title_intermediate_intro_mp3, res.title_intermediate_loop_1_mp3],
    audioLoopStart:  1,
    audioLength:     [32.182857, 35.395918],
    fadeOutDelay:    0,
    fadeOutTime:     50,      
    //fadeOutTimeEnd:  4000    // must not be more than any delayTime of backgrounds
}

////////////////////////////////////////////////
// Music for expert title
$42.MUSIC_TITLE_EXPERT = {
    audio:  [res.title_expert_intro_mp3, res.title_expert_loop_mp3],
    audioLoopStart:  1,
    audioLength:     [32.182857, 35.395918],
    fadeOutDelay:    0,
    fadeOutTime:     50,      
    //fadeOutTimeEnd:  4000    // must not be more than any delayTime of backgrounds
}

////////////////////////////////////////////////
// Music for tweeting
$42.MUSIC_TWEET = {
    audio:  [res.flames_loop_mp3],
    audioLoopStart: 0,
    audioLength:    [89.103673],
    audioBars:      [24],
    audioBeat:      [4],
    fadeOutTimeEnd:  2000
}

////////////////////////////////////////////////
// Music for tweeting
$42.SOUNDEFFECT_SPEECHBUBBLE = {
	audio: [res.speech_bubble_1_mp3, res.speech_bubble_2_mp3]
}

////////////////////////////////////////////////
// Music for level 1
$42.MUSIC_RED_NOSES = {
    background: {
        audio:           [res.red_noses_background_intro_mp3, res.red_noses_background_loop_C_1_mp3, res.red_noses_background_loop_C_2_mp3],
        audioLoopStart:  1,
        audioLength:     [37.172245, 45.740408, 45.740408],
        audioBars:       [13,16,16],
        audioBeat:       [16,16,16],
        delayTime:       6000,
        fadeOutTime:     30,
        fadeOutDelay:    50,
        nextSetOn:       [45740.408, 45740.408],
        //fadeOutTimeEnd:  1000
    },
    levelWords:     { 
        audio: res.red_noses_words_mp3, 
        delayTime: 4500
    },
    levelNr:        { 
        audio: res.red_noses_level_nr_mp3, 
        delayTime: 1500
    },
    setTile:         { 
        audioSet: [[res.red_noses_set_tile_1a_mp3, res.red_noses_set_tile_1b_mp3],
                   [res.red_noses_set_tile_2a_mp3]],
        playOnBeat: [1,5,9,13],
        nextSetOn:    "time", 
        playNextSlot: false
    },
    swipe:          { 
        audioSet: [[res.red_noses_swipe_1a_mp3, res.red_noses_swipe_1b_mp3, res.red_noses_swipe_1c_mp3, res.red_noses_swipe_1d_mp3],
                   [res.red_noses_swipe_2a_mp3, res.red_noses_swipe_2b_mp3, res.red_noses_swipe_2c_mp3, res.red_noses_swipe_2d_mp3]],
        minInterval: 280,
        playOnBeat: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
        nextSetOn:    "time", 
        stayWithSound:  true,
        dontStop:       true
    },
    rotate:         { 
        audioSet: [[res.red_noses_rotate_1a_mp3, res.red_noses_rotate_1b_mp3, res.red_noses_rotate_1c_mp3, res.red_noses_rotate_1d_mp3, res.red_noses_rotate_1e_mp3, res.red_noses_rotate_1f_mp3, res.red_noses_rotate_1g_mp3, res.red_noses_rotate_1h_mp3
        ],
        [res.red_noses_rotate_2a_mp3, res.red_noses_rotate_2b_mp3, res.red_noses_rotate_2c_mp3, res.red_noses_rotate_2d_mp3, res.red_noses_rotate_2e_mp3, res.red_noses_rotate_2f_mp3, res.red_noses_rotate_2g_mp3, res.red_noses_rotate_2h_mp3]],
        minInterval: 360,
        playOnBeat: [2,4,6,8,10,12,14,16],
        nextSetOn:    "time", 
        stayWithSound:  true,
        dontStop:       true
    },
    fixTile:        { 
        audioSet: [[res.red_noses_fix_tile_1_mp3],
                   [res.red_noses_fix_tile_2_mp3]],
        playOnBeat: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
        nextSetOn:    "time", 
    }, 
    selection:        { 
        audioSet: [[res.red_noses_selection_1_mp3],
                   [res.red_noses_selection_2_mp3]],
        playOnBeat: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16],
        nextSetOn:    "time", 
    }, 
    fullWord:       { 
        audioSet: [[res.red_noses_full_word_1_a_mp3, res.red_noses_full_word_1_b_mp3],
                   [res.red_noses_full_word_2_a_mp3]],
        playOnBeat: [1,3,5,7,9,11,13,15],
        nextSetOn:    "time", 
               },
    //presentWord:    { 
        //audio: res.blue_mountains_present_word_mp3,
        //intervalTime: 3000, 
        //delayTime: 500 
    //},
    lastWord:       { audio: res.red_noses_last_word_mp3 },
        playOnBeat: [1,3,5,7,9,11,13,15],
    deleteRow:      { 
        audioSet: [[res.red_noses_delete_row_1_mp3],
                   [res.red_noses_delete_row_2_mp3]], 
        nextSetOn:    "time", 
               },
    final:          { 
        audioSet: [[res.red_noses_delete_row_1_mp3],
                   [res.red_noses_delete_row_2_mp3]], 
               },
        nextSetOn:    "time", 
    deleteLastRows: { audio: res.red_noses_delete_last_row_1_mp3, },
}; 


////////////////////////////////////////////////
// Music for level 2
$42.MUSIC_FLAMES = {
    background: {
        audio:           [res.flames_loop_mp3],
        audioLoopStart:  0,
        audioLength:     [89.103673],
        audioBars:       [24],
        audioBeat:       [4],
        delayTime:       5000,
        fadeOutTime:     50,
        fadeOutTimeEnd:  1000
    },
    levelWords: { 
        audio:          res.flames_level_words_mp3,
        delayTime:      4500,
    },
    levelNr: { 
        audio:          res.flames_level_nr_mp3, 
        delayTime:      1500
    },
    setTile: { 
        audio:          res.flames_set_tile_mp3,
        playAfterBeats: 1 
    },
    swipe: { 
        audio:          [res.flames_swipe_1_mp3, res.flames_swipe_2_mp3, res.flames_swipe_3_mp3, res.flames_swipe_4_mp3, res.flames_swipe_5_mp3, res.flames_swipe_6_mp3],
        minInterval:    280,
        dontStop:       true
    },
    rotate: { 
        audio:          [res.flames_rotate_1_mp3, res.flames_rotate_2_mp3, res.flames_rotate_3_mp3],
        minInterval:    150,
        stayWithSound:  true,
        dontStop:       true
    },
    fixTile:            { audio: res.flames_fix_tile_1_mp3 }, 
    selection:          { audio: res.flames_selection_mp3 },
    fullWord:           { audio: res.flames_full_word_mp3 },
    //presentWord: { 
        //audio:          null
        //audio:          res.blue_mountains_present_word_mp3,
        //intervalTime:   3000, 
        //delayTime:      500 
    //},
    lastWord:           { audio: res.flames_last_word_mp3 },
    deleteRow:          { audio: res.flames_delete_row_mp3 },
    final:              { audio: res.flames_final_mp3 },
    deleteLastRows:     { audio: res.flames_delete_last_rows_mp3 },
};


////////////////////////////////////////////////
// Music for level 3
$42.MUSIC_YELLOW_STEPS = {
    background: {
        audio:           [res.yellow_steps_background_loop_1_mp3, res.yellow_steps_background_loop_2_mp3],
        audioLoopStart:  0,
        audioLength:     [70.243265, 12.643265],
        audioBars:       [39,7],
        audioBeat:       [9,9],
        nextSetOn:       [19207.945, 1200.496, 7202.979, 10804.472, 3601.490, 3601.490, 9603.973, 2400.993, 4801.985, 4801.987,  6002.484, 4801.985],
        delay:          4000,
        fadeOutTime:     50,
        fadeOutTimeEnd:  1000
    },
    levelWords: { 
        audio:          res.yellow_steps_level_words_mp3,
        delayTime:      4500,
    },
    levelNr: { 
        audio:          res.yellow_steps_level_nr_mp3, 
        delayTime:      1500
    },
    setTile: { 
        audio:          [res.yellow_steps_set_tile_1_mp3, res.yellow_steps_set_tile_2_mp3, res.yellow_steps_set_tile_3_mp3, res.yellow_steps_set_tile_4_mp3],
        playOnBeat: [1,4,7],
    }, 
    swipe: { 
        audio:          [res.yellow_steps_swipe_1_mp3, res.yellow_steps_swipe_2_mp3],
        playOnBeat: [1,4,7],
        dontStop:       true
    },
    rotate: { 
        audio:          [res.yellow_steps_rotate_1_mp3, res.yellow_steps_rotate_2_mp3, res.yellow_steps_rotate_3_mp3, res.yellow_steps_rotate_4_mp3],
        playOnBeat: [1,4,7],
        dontStop:       true
    },
    fixTile: { 
        audioSet:         [[res.yellow_steps_fix_tile_1_a_mp3, res.yellow_steps_fix_tile_1_b_mp3, res.yellow_steps_fix_tile_1_c_mp3, res.yellow_steps_fix_tile_1_d_mp3, res.yellow_steps_fix_tile_1_e_mp3],
                           [res.yellow_steps_fix_tile_2_a_mp3, res.yellow_steps_fix_tile_2_b_mp3, res.yellow_steps_fix_tile_2_c_mp3],
                           [res.yellow_steps_fix_tile_1_e_mp3, res.yellow_steps_fix_tile_1_a_mp3, res.yellow_steps_fix_tile_1_b_mp3, res.yellow_steps_fix_tile_1_c_mp3, res.yellow_steps_fix_tile_1_d_mp3],
                           [res.yellow_steps_fix_tile_2_c_mp3, res.yellow_steps_fix_tile_2_a_mp3, res.yellow_steps_fix_tile_2_b_mp3],
                           [res.yellow_steps_fix_tile_1_d_mp3, res.yellow_steps_fix_tile_1_e_mp3, res.yellow_steps_fix_tile_1_a_mp3, res.yellow_steps_fix_tile_1_b_mp3, res.yellow_steps_fix_tile_1_c_mp3],
                           [res.yellow_steps_fix_tile_2_b_mp3, res.yellow_steps_fix_tile_2_c_mp3, res.yellow_steps_fix_tile_2_a_mp3],
                           [res.yellow_steps_fix_tile_1_c_mp3, res.yellow_steps_fix_tile_1_d_mp3, res.yellow_steps_fix_tile_1_e_mp3, res.yellow_steps_fix_tile_1_a_mp3, res.yellow_steps_fix_tile_1_b_mp3],
                           [res.yellow_steps_fix_tile_2_a_mp3, res.yellow_steps_fix_tile_2_b_mp3, res.yellow_steps_fix_tile_2_c_mp3],
                           [res.yellow_steps_fix_tile_1_a_mp3, res.yellow_steps_fix_tile_1_b_mp3, res.yellow_steps_fix_tile_1_c_mp3, res.yellow_steps_fix_tile_1_d_mp3, res.yellow_steps_fix_tile_1_e_mp3],
                           [res.yellow_steps_fix_tile_2_b_mp3, res.yellow_steps_fix_tile_2_c_mp3, res.yellow_steps_fix_tile_2_a_mp3]],
        playOnBeat: [1,4,7],
        nextSetOn:         "time", 
    }, 
    selection:          { 
        audioSet:       [[res.yellow_steps_selection_1_mp3],
                         [res.yellow_steps_selection_2_mp3]], 
        //playOnBeat: [1,4,7],
        nextSetOn:         "time", 
    },
    fullWord:           { 
        audioSet:       [[res.yellow_steps_full_word_1_a_mp3, res.yellow_steps_full_word_1_b_mp3],
                         [res.yellow_steps_full_word_2_a_mp3, res.yellow_steps_full_word_2_b_mp3]], 
        playOnBeat: [1,3,4,6,7,9],
        nextSetOn:         "time", 
    },
    lastWord:           {  
        audioSet:       [[res.yellow_steps_last_word_1_mp3],
                         [res.yellow_steps_last_word_2_mp3]], 
        playOnBeat: [1,4,7],
        nextSetOn:         "time", 
    },
    deleteRow:          { 
        audioSet:       [[res.yellow_steps_delete_row_1_mp3],
                         [res.yellow_steps_delete_row_2_mp3]], 
        playOnBeat: [1,2,3,4,5,6,7,8,9],
        nextSetOn:         "time", 
    },
    final:          { 
        audioSet:       [[res.yellow_steps_final_1_mp3],
                         [res.yellow_steps_final_2_mp3]], 
    }, 
    deleteLastRows:     { audio: res.yellow_steps_delete_last_rows_mp3 },
};


////////////////////////////////////////////////
// Music for level 4
$42.MUSIC_GREEN_FOREST = {
    background: {
        audio:          res.green_trollworld_loop_mp3,
        audioLoopStart: 0,
        audioLength:    60.048000,
        nextSetOn:      [14.012, 3.753, 7.506, 3.753, 11.259, 3.753, 11.259, 4.753],
        delayTime:       6650,
        fadeOutTime:     50,
        fadeOutTimeEnd:  200
    },
    levelWords: { 
        audio:          res.green_trollworld_level_words_mp3,
        delayTime:      4500
    },
    levelNr: { 
        audio:          res.green_trollworld_level_nr_mp3, 
        delayTime:      1500
    },
    setTile: { 
        audio:          [res.green_trollworld_set_tile_1_mp3, res.green_trollworld_set_tile_2_mp3, res.green_trollworld_set_tile_3_mp3, res.green_trollworld_set_tile_2_mp3],
        stayWithSound:  true,
        playAfterBeats: 1 
    },
    swipe: { 
        audio:          [res.green_trollworld_swipe_1_mp3, res.green_trollworld_swipe_2_mp3, res.green_trollworld_swipe_3_mp3, res.green_trollworld_swipe_4_mp3, res.green_trollworld_swipe_5_mp3],
        minInterval:    150,
        dontStop:       true
    },
    rotate: { 
        audio:          [res.green_trollworld_rotate_1_mp3, res.green_trollworld_rotate_2_mp3, res.green_trollworld_rotate_3_mp3, res.green_trollworld_rotate_4_mp3, res.green_trollworld_rotate_5_mp3, res.green_trollworld_rotate_6_mp3],
        minInterval:    150,
        dontStop:       true
    },
    fixTile:            { 
        audio:          [res.green_trollworld_fix_tile_mp3], 
    }, 
    selection:          { 
        audio: 
                        [res.green_trollworld_selection_mp3], 
    },
    fullWord:           {
        audio:      [res.green_trollworld_full_word_a_mp3, res.green_trollworld_full_word_b_mp3],
    },
    //presentWord: { 
        //audio:          null,
        //audio:          res.blue_mountains_present_word_mp3,
        //intervalTime:   3000,
        //delayTime:      500 
    //},
    lastWord:           { audio: res.green_trollworld_last_word_mp3 },
    deleteRow:          { audio: res.green_trollworld_delete_row_mp3 },
    final:              { audio: res.green_trollworld_final_mp3 },
    deleteLastRows:     { audio: res.green_trollworld_delete_last_rows_mp3 },
};


////////////////////////////////////////////////
// Music for level 5
$42.MUSIC_BLUE_QUADRAT = { 
    background: {
        audio:           [res.blue_quadrat_intro_mp3, res.blue_quadrat_loop_mp3],
        audioLoopStart:  1,
        audioLength:     [39.732245, 38.112653],
        nextSetOn:       
        [1959.184, 600.000, 888.163, 600.000, 1802.449, 1888.163, 1888.163, 966.531, 679.184, 2168.163, 
        600.000, 600.000, 312.993, 1488.980, 992.653, 1436.735, 600.000, 365.011, 862.041, 653.061, 
        1802.449, 600.000, 914.286, 679.184, 312.993, 312.993, 312.993, 992.653, 940.408, 600.000, 
        888.163, 1488.980, 1515.102, 312.993, 600.000, 600.000, 339.002, 966.531, 679.184, 1882.449, 
        600.000, 862.041, 705.306, 940.408, 1671.837, 339.002, 600.000, 888.163, 888.163, 802.449, 
        888.163, 600.000, 600.000, 312.993, 966.531, 679.184, 2168.163, 600.000, 600.000, 339.002, 
        1462.857, 992.653, 1436.735, 600.000, 1175.510, 653.061, 1515.102, 312.993, 600.000, 914.286, 
        679.184, 339.002, 312.993, 1280.000, 940.408, 600.000, 600.000, 312.993, 1488.980, 1515.102, 
        312.993, 600.000, 600.000, 312.993, 992.653, 679.184, 1515.102, 312.993, 600.000, 888.163, 
        1227.755, 390.998, 1671.837],
        delayTime:       7000,
        fadeOutTime:     50,
        fadeOutTimeEnd:  1000
    },
    levelWords: { 
        audio: res.blue_quadrat_level_words_mp3,
        delayTime: 4500,
    },
    levelNr: { 
        audio: res.blue_quadrat_level_nr_mp3, 
        delayTime: 1500
    },
    setTile: { 
        audioSet:       [[res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],

                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_2_mp3],
                         
                         [res.blue_quadrat_set_tile_3_mp3],
                         [res.blue_quadrat_set_tile_1_mp3],
                         [res.blue_quadrat_set_tile_3_mp3]],
        nextSetOn:         "time", 
    },
    swipe: { 
        audioSet:       [[res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_3_mp3, res.blue_quadrat_swipe_4_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_4_mp3, res.blue_quadrat_swipe_3_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],

                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_3_mp3, res.blue_quadrat_swipe_4_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_4_mp3, res.blue_quadrat_swipe_3_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_3_mp3, res.blue_quadrat_swipe_4_mp3],
                         
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_4_mp3, res.blue_quadrat_swipe_3_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_3_mp3, res.blue_quadrat_swipe_4_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_4_mp3, res.blue_quadrat_swipe_3_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_3_mp3, res.blue_quadrat_swipe_4_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_4_mp3, res.blue_quadrat_swipe_3_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_3_mp3, res.blue_quadrat_swipe_4_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         
                         [res.blue_quadrat_swipe_4_mp3, res.blue_quadrat_swipe_3_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_3_mp3, res.blue_quadrat_swipe_4_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_4_mp3, res.blue_quadrat_swipe_3_mp3],
                         
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_3_mp3, res.blue_quadrat_swipe_4_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_4_mp3, res.blue_quadrat_swipe_3_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_3_mp3, res.blue_quadrat_swipe_4_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_4_mp3, res.blue_quadrat_swipe_3_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_3_mp3, res.blue_quadrat_swipe_4_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_4_mp3, res.blue_quadrat_swipe_3_mp3],
                         
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_3_mp3, res.blue_quadrat_swipe_4_mp3],
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_4_mp3, res.blue_quadrat_swipe_3_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3],
                         [res.blue_quadrat_swipe_3_mp3, res.blue_quadrat_swipe_4_mp3],
                         [res.blue_quadrat_swipe_1_mp3, res.blue_quadrat_swipe_2_mp3],
                         [res.blue_quadrat_swipe_4_mp3, res.blue_quadrat_swipe_3_mp3],
                         
                         [res.blue_quadrat_swipe_6_mp3, res.blue_quadrat_swipe_5_mp3],
                         [res.blue_quadrat_swipe_2_mp3, res.blue_quadrat_swipe_1_mp3],
                         [res.blue_quadrat_swipe_5_mp3, res.blue_quadrat_swipe_6_mp3]],
        minInterval:    300,
        dontStop:       true,
        nextSetOn:      "time", 
    },
    rotate: { 
        audioSet:       [[res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3],
                         [res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3],
                         [res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3],
                         [res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3],
                         [res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3],
                         [res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3],
                         [res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3],
                         [res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3],

                         [res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3],
                         [res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3],
                         [res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3],
                         [res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3],
                         [res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3],
                         [res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3],
                         [res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3],
                         [res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3],
                         [res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3],
                         
                         [res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3],
                         [res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3],
                         [res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3],
                         [res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3],
                         [res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3],
                         [res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3],
                         [res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3],
                         [res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3],
                         
                         [res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3],
                         [res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3],
                         [res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3],
                         [res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3],
                         [res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3],
                         [res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3],
                         [res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3],
                         [res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3],
                         [res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3],
                         
                         [res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3],
                         [res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3],
                         [res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3],
                         [res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3],
                         [res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3],
                         [res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3],
                         [res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3],
                         [res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3],
                         
                         [res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3],
                         [res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3],
                         [res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3],
                         [res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3],
                         [res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3],
                         [res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3],
                         [res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3],
                         [res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3],
                         [res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3],
                         
                         [res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3],
                         [res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3],
                         [res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3],
                         [res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3],
                         [res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3],
                         [res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3],
                         [res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3],
                         [res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3],
                         [res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3],
                         
                         [res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3],
                         [res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3],
                         [res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3],
                         [res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3],
                         [res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3],
                         [res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3],
                         [res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3],
                         [res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3],
                         [res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3],
                         
                         [res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3],
                         [res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3],
                         [res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3],
                         [res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3],
                         [res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3],
                         [res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3],
                         [res.blue_quadrat_rotate_4_mp3, res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3],
                         [res.blue_quadrat_rotate_2_mp3, res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3],
                         [res.blue_quadrat_rotate_5_mp3, res.blue_quadrat_rotate_6_mp3, res.blue_quadrat_rotate_4_mp3],
                         
                         [res.blue_quadrat_rotate_9_mp3, res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3],
                         [res.blue_quadrat_rotate_3_mp3, res.blue_quadrat_rotate_1_mp3, res.blue_quadrat_rotate_2_mp3],
                         [res.blue_quadrat_rotate_7_mp3, res.blue_quadrat_rotate_8_mp3, res.blue_quadrat_rotate_9_mp3]],
        minInterval:    300,
        dontStop:       true,
        nextSetOn:      "time", 
    },
    fixTile: { 
        audioSet:       [[res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],

                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                        
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tifix1_mp3],
                         [res.blue_quadrat_fix_tifix3_mp3],
                         [res.blue_quadrat_fix_tifix1_mp3],
                         [res.blue_quadrat_fix_tifix3_mp3],
                         [res.blue_quadrat_fix_tifix1_mp3],
                         [res.blue_quadrat_fix_tifix3_mp3],
                         [res.blue_quadrat_fix_tifix2_mp3],
                         [res.blue_quadrat_fix_tifix3_mp3],
                         [res.blue_quadrat_fix_tifix1_mp3],
                         
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_2_mp3],
                         
                         [res.blue_quadrat_fix_tile_3_mp3],
                         [res.blue_quadrat_fix_tile_1_mp3],
                         [res.blue_quadrat_fix_tile_3_mp3]],
        nextSetOn:      "time", 
    }, 
    selection:      { 
        audioSet:       [[res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],

                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_3_mp3],

                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_2_mp3],
                         
                         [res.blue_quadrat_selection_3_mp3],
                         [res.blue_quadrat_selection_1_mp3],
                         [res.blue_quadrat_selection_3_mp3]], 
        nextSetOn:      "time", 
},
    fullWord:       { 
        audioSet:       [[res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],

                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_2_mp3],
                         
                         [res.blue_quadrat_full_word_3_mp3],
                         [res.blue_quadrat_full_word_1_mp3],
                         [res.blue_quadrat_full_word_3_mp3]], 
        nextSetOn:      "time", 
},
    //presentWord: { 
        //audio: res.blue_mountains_present_word_mp3,
        //intervalTime: 3000, 
        //delayTime: 500 
    //},
    lastWord:       { 
        audioSet:       [[res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],

                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_2_mp3],
                         
                         [res.blue_quadrat_last_word_3_mp3],
                         [res.blue_quadrat_last_word_1_mp3],
                         [res.blue_quadrat_last_word_3_mp3]], 
        nextSetOn:      "time", 
},
    deleteRow:      { 
        audioSet:       [[res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],

                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_2_mp3],
                         
                         [res.blue_quadrat_delete_row_3_mp3],
                         [res.blue_quadrat_delete_row_1_mp3],
                         [res.blue_quadrat_delete_row_3_mp3]],
        nextSetOn:      "time", 
},
    final:          { audio: res.blue_quadrat_final_mp3 },
    deleteLastRows: { audio: res.blue_quadrat_delete_last_rows_mp3 },
};

////////////////////////////////////////////////
// Music for level 6
$42.MUSIC_INKA_TEMPLE = {
    background: {
        audio:              [res.inka_temple_intro_a_mp3,res.inka_temple_intro_b_mp3,res.inka_temple_intro_c_mp3,res.inka_temple_intro_d_mp3,res.inka_temple_intro_e_mp3,res.inka_temple_intro_f_mp3,res.inka_temple_intro_g_mp3,res.inka_temple_intro_h_mp3],
        audioLoopStart:     0,
        audioLength:        [15.595102, 11.650612, 11.650612, 11.075918, 13.635918, 13.635918, 12.773878, 12.773878],
        audioBeatLength:    550,
        delayTime:          6000,
        fadeOutTime:     50,
        fadeOutTimeEnd:  700
    },
    levelWords: { 
        audio: res.inka_temple_level_words_mp3,
        delayTime: 4500
    },
    levelNr: { 
        audio: res.inka_temple_level_nr_mp3,
        delayTime: 1500
    },
    setTile: { 
        audio: [res.inka_temple_set_tile_a_mp3, res.inka_temple_set_tile_b_mp3], 
        playAfterBeats: 1,
        playNextSlot: true
    },
    swipe: { 
        audio: [res.inka_temple_swipe_1_mp3, res.inka_temple_swipe_2_mp3, res.inka_temple_swipe_1_mp3, res.inka_temple_swipe_2_mp3,res.inka_temple_swipe_1_mp3, res.inka_temple_swipe_3_mp3, res.inka_temple_swipe_2_mp3, res.inka_temple_swipe_1_mp3, res.inka_temple_swipe_2_mp3, res.inka_temple_swipe_4_mp3, res.inka_temple_swipe_2_mp3, res.inka_temple_swipe_1_mp3, res.inka_temple_swipe_2_mp3, res.inka_temple_swipe_4_mp3, res.inka_temple_swipe_1_mp3, res.inka_temple_swipe_3_mp3, res.inka_temple_swipe_2_mp3],
        intervalTime: 4500,
        stayWithSound:  true,
        dontStop:       true
    },
    rotate: { 
        audio: [res.inka_temple_rotate_1_mp3, res.inka_temple_rotate_2_mp3, res.inka_temple_rotate_3_mp3, res.inka_temple_rotate_4_mp3, res.inka_temple_rotate_5_mp3, res.inka_temple_rotate_3_mp3, res.inka_temple_rotate_2_mp3, res.inka_temple_rotate_1_mp3, res.inka_temple_rotate_3_mp3, res.inka_temple_rotate_4_mp3, res.inka_temple_rotate_2_mp3, res.inka_temple_rotate_5_mp3, res.inka_temple_rotate_1_mp3, res.inka_temple_rotate_5_mp3, res.inka_temple_rotate_2_mp3, res.inka_temple_rotate_1_mp3, res.inka_temple_rotate_3_mp3, res.inka_temple_rotate_4_mp3, res.inka_temple_rotate_2_mp3, res.inka_temple_rotate_5_mp3],
        minInterval: 0,
        stayWithSound:  true,
        dontStop:       true
    },
    fixTile: { 
        audio: [res.inka_temple_fix_tile_a_mp3, res.inka_temple_fix_tile_b_mp3, res.inka_temple_fix_tile_c_mp3] 
    }, 
    selection:      { audio: res.inka_temple_selection_mp3 },
    fullWord:       { audio: res.inka_temple_full_word_mp3 },
    presentWord:    { 
        audio: res.inka_temple_present_word_mp3,
        delayTime: 500 
    },
    lastWord:       { audio: res.inka_temple_last_word_mp3 },
    nextWord:       { audio: res.inka_temple_next_word_mp3 }, 
    final:          { audio: res.inka_temple_final_mp3 },
    deleteRow:      { audio: res.inka_temple_delete_row_mp3 },
    deleteLastRows: { audio: res.inka_temple_delete_last_rows_mp3 },
};

////////////////////////////////////////////////
// Music for level 7
$42.MUSIC_BLUE_MOUNTAINS = {
    background: {
        audio:          [res.blue_mountains_intro_mp3,res.blue_mountains_loop_a_mp3, res.blue_mountains_loop_b_mp3],
        audioLoopStart: 1,
        audioLength:    [90.59265, 45.324000,45.324000],
        audioBars:      [24,12,12],
        audioBeat:      [8,8,8],
        fadeOutTime:     50,
        fadeOutTimeEnd:  1000
    },
    levelWords: { 
        audio: res.blue_mountains_level_words_mp3,
        delayTime: 4500,
    },
    levelNr: { 
        audio: res.blue_mountains_level_nr_mp3, 
        delayTime: 1500
    },
    setTile: { 
        audio: res.blue_mountains_set_tile_mp3, 
        playOnBeat: [1,3,5,7],
        playAfterBeats: 1
    },
    swipe: { 
        audio: res.blue_mountains_swipe_mp3,
        stayWithSound:  true,
        dontStop:       true
    },
    rotate: { 
        audio: [res.blue_mountains_rotate_1_mp3, res.blue_mountains_rotate_2_mp3, res.blue_mountains_rotate_3_mp3],
        minInterval: 0,
        stayWithSound:  true,
        dontStop:       true
    },
    fixTile: { 
        audio: [res.blue_mountains_fix_tile_1_mp3, res.blue_mountains_fix_tile_1_mp3, res.blue_mountains_fix_tile_2_mp3], 
        playOnBeat: [1,2,3,4,5,6,7,8]
    }, 
    selection:      { audio: res.blue_mountains_selection_mp3 },
    fullWord:       { audio: res.blue_mountains_full_word_mp3 },
    presentWord:    { 
        audio: res.blue_mountains_present_word_mp3,
        intervalTime: 3000, 
        delayTime: 500
    },
    lastWord:       { audio: res.blue_mountains_last_word_mp3 },
    deleteRow:      { audio: res.blue_mountains_delete_row_mp3 },
    deleteLastRows: { audio: res.blue_mountains_delete_last_rows_mp3 },
    final:          { audio: res.blue_mountains_final_mp3 },
};

var _MUSIC_MODULE = function(layer) {
    var musicPlaying = null;

    layer.playEffect = function playEffect(effect, repeat) {
        var mp = musicPlaying,
            time = new Date().getTime();

        if( !effect || !effect.audio && !effect.audioSet ) return;

        if( typeof effect.audio === "string" ) effect.audio = [effect.audio];
        if( effect.audioSet ) {
            if( !effect.currentSet ) effect.currentSet = 0;
            effect.audio = effect.audioSet[effect.currentSet];
			if( !effect.audio ) cc.error("Cannot find audioSet "+effect.currentSet+". Check the definition data.");
        }
        if( effect.currentSlot === undefined ) effect.currentSlot = 0;
        else if( !repeat || !effect.stayWithSound ) effect.currentSlot = ++effect.currentSlot%effect.audio.length;

        var play = function() {
            var cs = effect.currentSlot;
            if( effect.intervalTime && !effect.interval ) {
                if( repeat || !effect.minInterval || time - (effect.lastPlay || 0) >= effect.minInterval ) {
                    effect.id = cc.audioEngine.playEffect(effect.audio[cs]);
                }
                //effect.id.setVolume($42.EFFECTS_VOLUME);
                //if( $42.msg2 ) $42.msg2.setString("Starting interval: "+effect.audio[cs]);
                effect.interval = setInterval(function() {
                    if( effect.intervalIsEnding ) {
                        //if( $42.msg2 ) $42.msg2.setString("Ending interval: "+effect.audio[cs]);
                        clearInterval(effect.interval);
                        effect.interval = null;
                        effect.intervalIsEnding = false;
                    } else {
                        //if( $42.msg2 ) $42.msg2.setString("Playing in interval: "+effect.audio[cs]);
                        playEffect(effect, true);
                    }
                }, effect.intervalTime);
            } else {
                if( !effect.minInterval || time - (effect.lastPlay || 0) >= effect.minInterval ) {
                    effect.id = cc.audioEngine.playEffect(effect.audio[cs]);
                }
                //effect.id.setVolume($42.EFFECTS_VOLUME);
                //if( $42.msg2 ) $42.msg2.setString("Now playing: "+effect.audio[cs]);
            }

            effect.lastPlay = time;
        };

        setTimeout(play, effect.delayTime || 0);
    };

    layer.stopEffect = function(effect) {
        if( !effect || !effect.audio ) return;

        if( effect.interval ) {
            if( !effect.intervalIsEnding ) {
                effect.intervalIsEnding = true;
                if( effect.end ) {
                    var span = new Date().getTime() - effect.lastPlay;
                    setTimeout(function() {
    	                //if( $42.msg2 ) $42.msg2.setString("Playing effect end: "+effect.end);
                        layer.playEffect({audio: effect.end});
                        //effect.id.setVolume($42.EFFECTS_VOLUME);
                    }, effect.endDelay-span || 0 );
                }
            }
        } else if(!effect.dontStop ) {
            if (!cc.sys.isNative) {
                cc.audioEngine.stopEffect(effect.id);
            }
    	    //if( $42.msg2 ) $42.msg2.setString("Stopping effect:"+effect.audio[0]);
            effect.id = null;
        }
    };

    layer.changeAudioSet = function(event) {

        if( !$42.SCENE.mainLayer || !$42.SCENE.mainLayer._gameMode ) return;

        var music = $42.LEVEL_DEVS[$42.SCENE.mainLayer._gameMode][$42.currentLevel-1].music;
        if( !music ) return;

        for (var key in music) {
            if (music.hasOwnProperty(key)) {
                var effect = music[key];

                if( effect.nextSetOn === event ) {
                    if( !effect.currentSet ) effect.currentSet = 0;
                    effect.currentSet = ++effect.currentSet%effect.audioSet.length;
                    effect.currentSlot = 0;
					cc.log("Change audio set of "+event+" to "+effect.currentSet);
                }
            }
        }
    };

    layer.callFuncOnNextBeat = function(cb, sound) {
        var mp = musicPlaying || null,
            time = new Date().getTime();
        if( mp && (sound && sound.playOnBeat) && (mp.audio || mp.audioBeatLength) ) {
            var frame  = mp.audioBeatLength || (mp.audioLength[mp.audioSlot]? mp.audioLength[mp.audioSlot]*1000 / mp.audioBars[mp.audioSlot] / mp.audioBeat[mp.audioSlot]: 0);
            
            if( frame ) {
                var span = time - (mp.startTime || time),
                    frames = Math.floor(span/frame),
                    timeToNextFrame = sound.playOnBeat? (frames+1) * frame - span : sound.playAfterBeats * frame || 0,
                    nextFrame = (frames+1) % (mp.audioBeatLength || mp.audioBeat[mp.audioSlot]),
                    pob = sound && sound.playOnBeat || null;

                if( pob && Object.prototype.toString.call( pob ) === '[object Array]' && pob.length > 0 ) {
                    var i = 0, offset = 0;
                    for( var i=0 ; i < pob.length ; i++ ) if( nextFrame <= pob[i]-1 ) break;

                    timeToNextFrame += ((pob[i%pob.length]-nextFrame-1) + Math.floor(i/pob.length) * mp.audioBeat[mp.audioSlot]) * frame;
                }

                //cc.log("SOUNDTIMING 2: Time is "+time+". Distance to next frame : "+timeToNextFrame+", frames played: "+frames);

                setTimeout(function(shouldbe) {
                    var now = new Date().getTime();
                    //cc.log("SOUNDTIMING 2: Supposed to by playing sound at "+shouldbe);
                    //cc.log("SOUNDTIMING 2:         Really playing sound at "+now);
                    //cc.log("SOUNDTIMING 2: Difference:  "+(shouldbe-now));
                    cb();
                }, timeToNextFrame, time+timeToNextFrame);
            } else {
                cb();
            }
        } else {
            cb();
        }
    };

    layer.playBackgroundMusic = function(mp) {
        var time = new Date().getTime();

        if( !mp ) return;

        if( mp.audio ) {
            if( typeof mp.audio === "string" ) {
                mp.audio = [mp.audio];
                mp.audioLength = [mp.audioLength],
                mp.audioBars = [mp.audioBars];
                mp.audioBeat = [mp.audioBeat];
            }
            mp.audioSlot = 0;
            
            if( mp.audio.length ) {
                if( mp.timeout ) {
                    clearTimeout(mp.timeout);
                    mp.timeout = null;
                }
                mp.startTime   = new Date().getTime();
                
                //if( $42.msg1 ) $42.msg1.setString("Now playing background audio '"+mp.audio[0]+"'");
                if( mp.audio.length === 1 && !mp.audioLoopStart ) {
                    cc.audioEngine.setMusicVolume($42.MUSIC_VOLUME);
                    cc.audioEngine.playMusic(mp.audio[0], true);
                } else {
                    cc.audioEngine.playMusic(mp.audio[0], false);
                    cc.audioEngine.setMusicVolume($42.MUSIC_VOLUME);
                    mp.timeout = setTimeout(function() {
                        layer.playNextMusicSlot(null, !!mp.fadeOutTime);
                    }, mp.audioLength[0] * 1000 - (mp.fadeOutTime || 0));
                }
            }
        }
        
        // timeouts for sets
        if( mp.nextSetOn ) {
            mp.timeoutSet = setTimeout(function() {
                mp.timeoutSet = null;
                mp.nextSetOnSlot = 0;
                (function nextTimeout() {
                    // Missing: timer correction (setTimeout has +- 10ms error)
                    mp.nextSetOnTimeout = setTimeout(function() {
                        layer.changeAudioSet("time");
                        mp.nextSetOnSlot = ++mp.nextSetOnSlot%mp.nextSetOn.length;
                        nextTimeout();
                    }, mp.nextSetOn[mp.nextSetOnSlot]);
                })();
            }, (mp.introLength || 0)*1000 );
        } 
        
        musicPlaying = mp;
    };

    layer.playNextMusicSlot = function nextSlot(effect, fadeOut) {

        var mp = musicPlaying;
        if( !mp || !mp.audio || mp.audio.length < 1 ) return;

        if( effect && !effect.playNextSlot ) return;

        layer.changeAudioSet("slot");

        var playSlot = function() {
            if( ++mp.audioSlot >= mp.audio.length ) mp.audioSlot = mp.audioLoopStart || 0;
            
            mp.startTime   = new Date().getTime();

            diff = mp.endTime || mp.endTime === 0? mp.endTime - mp.startTime : 0;
            mp.endTime = mp.startTime + mp.audioLength[mp.audioSlot]*1000 + diff;

            //cc.log("SOUNDTIMING 1: Starting new slot ("+mp.audioSlot+"). Time: "+mp.startTime+", ending at "+mp.endTime+", diff was "+diff);
            if( mp.timeout ) clearTimeout( mp.timeout );
            cc.audioEngine.setMusicVolume($42.MUSIC_VOLUME);
            //if( $42.msg1 ) $42.msg1.setString("Now playing audio '"+mp.audio[mp.audioSlot]+"'");
            
            if( mp.audioSlot === mp.audioLoopStart && mp.audio.length - (mp.audioLoopStart || 0) === 1 ) {
                cc.audioEngine.playMusic(mp.audio[mp.audioSlot], true);
            } else {
                cc.audioEngine.playMusic(mp.audio[mp.audioSlot]);
                mp.timeout = setTimeout(function() {
                    //cc.log("SOUNDTIMING 1:                                                               ended at "+mp.endTime);
                    mp.timeout = null;
                    nextSlot(null, !!mp.fadeOutTime);
                }, mp.audioLength[mp.audioSlot] * 1000 + diff - (mp.fadeOutTime || 0));
            }
        };

        if( fadeOut && mp.fadeOutTime ) {
            layer.fadeOutBackgroundMusic(mp.fadeOutTime, false, playSlot);
        } else {
            playSlot();
        }
    };

    layer.stopBackgroundMusic = function(time) {
        var mp = musicPlaying;

        if( mp ) {
            if( time ) layer.fadeOutBackgroundMusic(time);
            else cc.audioEngine.stopMusic();
        
            if( mp.timeout ) clearTimeout(mp.timeout);
            if( mp.timeoutSet ) clearTimeout(mp.timeoutSet);
            if( mp.nextSetOnTimeout ) clearTimeout(mp.nextSetOnTimeout); 
            mp.timeout = mp.timeoutSet = mp.nextSetOnTimeout = null;
            mp.startTime = null;
            mp.audioSlot = null;
            musicPlaying = null;
    	    //if( $42.msg1 ) $42.msg1.setString("Background music stopped!");
        }
    };

    var fadeBackgroundMusic = function(time, direction, dontStop, cb) {
        var volume = cc.audioEngine.getMusicVolume(),
            vg = $42.MUSIC_VOLUME_GRANULARITY,
            steps = Math.ceil(time / vg),
            step = volume / steps * direction;

        cc.assert(direction === -1 || direction === 1, "Fade direction must be either 1 or -1.");

        var interval = setInterval(function() {
            volume += step;
            if( direction === -1 && volume < 0 || direction === 1 && volume > $42.MUSIC_VOLUME ) {
                if( !dontStop ) cc.audioEngine.stopMusic();
    	        //if( $42.msg1 ) $42.msg1.setString("Background music stopped");
                clearInterval(interval);
                if( typeof cb === "function" ) cb();
            } else {
                cc.audioEngine.setMusicVolume(volume);
    	        //if( $42.msg1 ) $42.msg1.setString("Background music is fading out ... volume "+Math.floor(volume*100)/100);
            }
        }, $42.MUSIC_VOLUME_GRANULARITY);
    };

    layer.fadeOutBackgroundMusic = function(time, dontStop, cb) {
        fadeBackgroundMusic(time, -1, dontStop, cb);
    };

    layer.fadeInBackgroundMusic = function(time, dontStop) {
        fadeBackgroundMusic(time, 1, dontStop, cb);
    }
}

