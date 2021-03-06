////////////////////////////////////////////////////////////////////
// words.js contains the basic code for the 42words game, built upon the plain vanilla tetris app in app.js
//

// $42.LETTER_NAMES and $42.LETTERS must have corresponding elements 
$42.LETTER_NAMES = ["space","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z","ae","oe","ue","6","ao"];
$42.LETTERS =      [" ","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","Ä" ,"Ö" ,"Ü" ,"Õ","Å"];
$42.MARKER_SET = 1;                         // Marker under a letter is set, meaning that the letter is obligatory
$42.MARKER_OPT = 2;                         // Letter can be chosen (?)
$42.MARKER_SEL = 3;                         // Letter was chosen (!)
$42.START_MARKER_X_OFFSET = -18;            // X offset of start marker on screen
$42.START_MARKER_Y_OFFSET = $42.BS/2;       // Y offset 
$42.MARKER_X_OFFSET = $42.BS/2;             // X offset of markers under letters
$42.MARKER_Y_OFFSET = -25;                  // Y offset
$42.UNSELECTED_BOX_OPACITY = 150;           // Opacity of an unselected box (not part of a chosen word)
$42.GIVEN_WORDS_OPACITY = 70;               // Opacity of word displayed on the background
$42.NEEDED_LETTERS_PROBABILITY = 0.15;      // additional probability that a needed letter appear (needed for the currently possible words)
$42.MAX_WORDS_BLOWN = 1;                    // How many words are blown up after a row is deleted
$42.WORD_FRAME_WIDTH = 4;                   // Weight of the frame of a completed word
$42.WORD_FRAME_MOVE_TIME = 0.8;             // Animation time of a completed word
$42.SCORE_COLOR_DIMM = cc.color(160,120,55);    // Score color when not bright
$42.SCORE_COLOR_BRIGHT = cc.color(240,170,70);  // same for bright
$42.SCORE_COLOR_WHITE = cc.color(255,255,255);  // same for white
$42.NEXT_PROFILE_LETTERS = 5;               // Number of next new letter candidates
$42.NEXT_PROFILE_LETTER_CNT = 3;            // A new letter after n words
$42.SCOREBAR_LETTERS_PER_ROW = 13;           // Show n small letters in the score bar per row
$42.SCOREBAR_LETTERS_PER_COL = 2;           // Show max n columns
$42.SCOREBAR_LETTERS_PADDING = 7;          // Padding of small letters
$42.SCOREBAR_LETTERS_SCALE = 0.45;          // Size difference to real normal letters
$42.SCOREBAR_ROLLING_LAYER_DELAY = 3.0;     // Seconds till the next score bar roll
$42.BACKGROUND_MOVEMENTS = [cc.p(0,-1136), cc.p(0,1136), cc.p(-640, 0), cc.p(640, 0)];
$42.BACKGROUND_SPEED = 1.33;
$42.BACKGROUND_MOVE = 0.66;
$42.BACKGROUND_NEXT_TILE = 2.5;
$42.WORDFOUND_PADDING = 30;
$42.WORDFOUND_LINE_HEIGHT = 40;
$42.WORDFOUND_COLOR = cc.color(0,0,50);   
$42.WORDFOUND_MOSTAFA_SPACE = 70;  
$42.WORDS_FLYING_IN_COLOR1 = cc.color(255,255,255);
$42.WORDS_FLYING_IN_COLOR2 = cc.color(233,255,233);
$42.MAX_BOXES_CHECKED = 150;
$42.MAX_ROW_FOR_WEIRD_TILES = 9;

// Order of multipliers
$42.MULTIPLIER = [[2,"letter"],[2,"letter"],[2,"letter"],[3,"letter"],[2,"word"],[3,"letter"],[5,"letter"],[3,"word"],[3,"letter"],[5,"letter"],[10,"letter"]];

//////////////////////////////////////////////////////////////////////////////////////////////////////
// The game plugin module 
//
var _42_MODULE = function(_42Layer) {

	var ml = _42Layer,          // ml is the standard shortcut for the game layer
		nextTile = null;
	
    /////////////////////////////////////////////
    // Internal function: go through box array and look for posible prefixes of words
    //
	var setSelections = function( dontSelectWord ) {
		var s = [],
			sw = ml.selectedWord,
			nsw = null;

        //////////////////////////////////
        // Look through all rows ...
		for( var i=0 ; i<$42.BOXES_PER_COL ; i++) {
            //////////////////////////
			// dim (deselect) all boxes in a row
			for( var j=0 ; j<$42.BOXES_PER_ROW ; j++ ) {
				var box = ml.boxes[i][j];				
				if( box && box.sprite ) box.sprite.setOpacity($42.UNSELECTED_BOX_OPACITY);				
			}

            //////////////////////////////
			// check all boxes in a row for word beginnings (prefixes)
			for( var j=0 ; j<$42.BOXES_PER_ROW-2 ; j++ ) {
				var box = ml.boxes[i][j];				
				if(!box) continue;
				
                //////////////////////////////
                // get current prefix of a box
				var oldPrefix = box.words && box.words[0] && box.words[0].word.substring(0,3) || null;
				box.words = null;

                //////////////////////////////
                // Check if a prefix starts a current box (checkForPrefixes callback return a list of all possible words)
				checkForPrefixes({row:i,col:j}, function(brc, words) {
					
                    box.words = words;
                    /////////////////////////////////////////
					// don't highlight possible selections in the row of the selected word
					if( sw && sw.brc.row === i ) return;

					var newPrefix = words[0].word.substring(0,3);

                    /////////////////////////////////
					// let a newly found sprite blink
					for( var k=0 ; k<3 ; k++ ) {
						var box1 = ml.boxes[brc.row][brc.col+k];
						if( box1.sprite ) box1.sprite.setOpacity(255);
						if( newPrefix != oldPrefix ) {
							box1.sprite.runAction(cc.blink(0.5,3));
						}
					}
					
                    /////////////////////////////////
					// fill the possible selection and put it on the list
                    /*
                    var sprite = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("marker4.png"));
                    sprite.setPosition(cc.p(96,-26));
                    ml.boxes[brc.row][brc.col].sprite.addChild(sprite);
                    _42_retain(sprite, "... sprite");
                    */
					s.push({
						brc: brc,
						width: $42.BS * 3,
						height: $42.BS,
						words: words,
						pos: {
							x: $42.BOXES_X_OFFSET + brc.col * $42.BS,
							y: $42.BOXES_Y_OFFSET + brc.row * $42.BS,
						},
						box: [
					      	ml.boxes[brc.row][brc.col],
					      	ml.boxes[brc.row][brc.col+1],
					      	ml.boxes[brc.row][brc.col+2],
						],
                        //sprite: sprite
					});

				});
			}
		}
		
        ////////////////////////
        // The result of the function is a list with possible selections (enlighted on the playground)
		ml.selections = s;
	};
	
    //////////////////////////////////////////////////////////////////
	// look for words at a specified position
    //
	var checkForPrefixes = function(brc, cb) {

		var prefix = (ml.boxes[brc.row][brc.col]   && ml.boxes[brc.row][brc.col].userData || " ")+
					 (ml.boxes[brc.row][brc.col+1] && ml.boxes[brc.row][brc.col+1].userData || " ")+
					 (ml.boxes[brc.row][brc.col+2] && ml.boxes[brc.row][brc.col+2].userData || " "),
			words = [];
		
		// copy word object
        var pref = ml.levelPool[prefix];
		for( var i=0 ; pref && i<pref.length ; i++ ) {
			words.push({
				word: pref[i].word,
				value: pref[i].value,
				group: pref[i].group,
				profile: pref[i].profile,
				deleted: pref[i].deleted
			});
		}

		if( !(ml.boxes[brc.row][brc.col] && ml.boxes[brc.row][brc.col].words) && words.length && cb ) {

			for( var i=words.length-1 ; i>=0 ; i-- ) {
				if( brc.col + words[i].word.length > $42.BOXES_PER_ROW || 
					words[i].deleted ||
					$42.wordProfile < ($42.wordProfile | words[i].profile) ) {
					words.splice(i,1);
				}
			}
			
			if( words.length > 0 ) {
				cb(brc,words);
			}
		}
	};

    ///////////////////////////////////////////////////////////////////    
	// update markers of selected word, look if a full word was found, process it ...
    //
	var updateSelectedWord = function(options) {
		var sw = ml.selectedWord,
            level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];
		
        //cc.log("ml.wordIsBeingSelected: "+ml.wordIsBeingSelected+", ml.unselectedWord: "+ml.unselectedWord );
		if( ml.wordIsBeingSelected || ml.unselectedWord ) return false;

        if( !sw ) {
            return false;
        }
		
		// Define sprites and show word start sprite
		var setMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker0.png"),
			optMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker1.png"),
			selMarkerFrame = cc.spriteFrameCache.getSpriteFrame("marker3.png");
				
		if( !sw.startMarker ) {
			sw.startMarker = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("marker2.png"),cc.rect(0,0,$42.BS,$42.BS));
			_42_retain(sw.startMarker, "words: sw.startMarker.png");	
			sw.startMarker.setPosition(cc.p($42.BOXES_X_OFFSET + sw.brc.col * $42.BS + $42.START_MARKER_X_OFFSET,
											$42.BOXES_Y_OFFSET + sw.brc.row * $42.BS + $42.START_MARKER_Y_OFFSET));
			ml.addChild(sw.startMarker,5);
		}
		var pos = sw.startMarker.getPosition(),
			row = Math.round(pos.y-$42.BOXES_Y_OFFSET-$42.START_MARKER_Y_OFFSET)/$42.BS;
		if( row != sw.brc.row ) {
			var rows = row - sw.brc.row;
			sw.startMarker.runAction(cc.moveBy($42.MOVE_SPEED*rows, cc.p(0,-$42.BS*rows)));			
		}

		// Mark letters
		// First look for all words that are still possible, looking at the
		// markers set
		var curWords = sw.words.slice(),
			missingLetters = "";
		for( var i=sw.brc.col ; i<$42.BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			if( sw.markers[col] === $42.MARKER_SEL ) {
				var letter = ml.boxes[sw.brc.row][i].userData;
				// take out all words that don't match the letters where markers
				// are set
				for( var j=curWords.length-1 ; j>=0 ; j-- ) {
					if( curWords[j].word[col] != letter ) curWords.splice(j,1);
				}
			}
		}
		// if no words are found with currently selected markers, than the last
		// fitting word was removed
		// so all selected markers and start with all words a new
		if( curWords.length === 0 ) {
			curWords = sw.words.slice();
			for( var i=3 ; i<sw.markers.length ; i++ ) if( sw.markers[i] === $42.MARKER_SEL || sw.markers[i] === $42.MARKER_SET ) sw.markers[i] = null;
		}
		for( var i=sw.brc.col ; i<$42.BOXES_PER_ROW ; i++) {
			var col = i-sw.brc.col;
			// remove old sprite
			if( sw.sprites[col] ) {
				_42_release(sw.sprites[col]);
				ml.removeChild( sw.sprites[col] );
			}
			sw.sprites[col] = null;
			for( var j=curWords.length-1,hits=0 ; j>=0 ; j-- ) {
				// look if the letter in the box matches the letter in the word
				if(ml.boxes[sw.brc.row][i] && curWords[j].word[col] === ml.boxes[sw.brc.row][i].userData ) hits++;
				else if( curWords[j].word[col] ) missingLetters += curWords[j].word[col];
			}
			//if( sw.markers[col] === $42.MARKER_SET || col < 3 ) {
            if( sw.markers[col] === $42.MARKER_SEL && hits > 0 ) {
				// if the user marked the letter, than show marker select sprite
				sw.sprites[col] = new cc.Sprite(selMarkerFrame,cc.rect(0,0,$42.BS,$42.BS));
				ml.boxes[sw.brc.row][i].sprite.setOpacity(255);	
			} else if( hits === curWords.length ) {
				// letter in box matches with all words, draw sprite
				sw.markers[col] = $42.MARKER_SET;
				sw.sprites[col] = new cc.Sprite(setMarkerFrame,cc.rect(0,0,$42.BS,$42.BS));
				ml.boxes[sw.brc.row][i].sprite.setOpacity(255);	
				sw.markers[col] = $42.MARKER_SET;
			} else if( hits === 0 ) {
				// letter in box matches with no word
				sw.markers[col] = null;
			} else {
				// letter in box matches with some words, draw marker option
				sw.markers[col] = $42.MARKER_OPT;
				sw.sprites[col] = new cc.Sprite(optMarkerFrame,cc.rect(0,0,$42.BS,$42.BS));					
				ml.boxes[sw.brc.row][i].sprite.setOpacity($42.UNSELECTED_BOX_OPACITY);	
			}
			
			if( hits > 0 ) {
				_42_retain(sw.sprites[col],"words: sw.sprites["+col+"]");	
				ml.addChild(sw.sprites[col],5);
				sw.sprites[col].setPosition(cc.p($42.BOXES_X_OFFSET + i * $42.BS + $42.MARKER_X_OFFSET, 
						   						 $42.BOXES_Y_OFFSET + row * $42.BS + $42.MARKER_Y_OFFSET));
				if( row !== sw.brc.row ) {
					var rows = row - sw.brc.row;
					sw.sprites[col].runAction(cc.moveBy($42.MOVE_SPEED*rows, cc.p(0,-$42.BS*rows)));					
				}
			}	
		}
		
		sw.missingLetters = missingLetters;
		
        /////////////////////////////////////////////
		// look if all marked letters form a complete word
		for( var i=0 ; i<curWords.length ; i++ ) {
			var word = curWords[i].word,
				group = curWords[i].group;
			for( var j=0 ; j<word.length ; j++ ) {
				if( !ml.boxes[sw.brc.row][j+sw.brc.col] || 
					word[j] !== ml.boxes[sw.brc.row][j+sw.brc.col].userData ) 
						break;
			}

            ///////////////////////////////////////////////
            // Full word found?
			if( j === word.length ) {

                var ll = ml.levelLabels;

                if( word === ml.tmpLastWordFound ) {
                    //cc.log("ERROR: Word '"+word+"' found twice.");
                    debugger;
                }
                ml.tmpLastWordFound = word;

                if( ll.length === 1 && level.type === $42.LEVEL_TYPE_GIVEN ) $42.SCENE.playEffect(level.music.lastWord);
                else {
                    $42.SCENE.callFuncOnNextBeat(function() {
                        $42.SCENE.playEffect(level.music.fullWord);
                        $42.SCENE.playNextMusicSlot(level.music.fullWord, true);
                        $42.SCENE.changeAudioSet("fullWord");
                    }, level.music.fullWord);
                }
                if( level.music.presentWord ) $42.SCENE.playEffect(level.music.presentWord);
                ml.playEffectSelection = false;
                
                ////////////////////////////////////
                // FULL WORD FOUND!
				// First delete word from global word list and selected word list
				var ret = deleteWordFromList(word);
				cc.assert(ret,"42words, updateSelectedWord: "+word+" is not in the list!");	
				sw.words.splice(i,1);
				if( !sw.words.length ) ml.unselectWord();
				
                /////////////////////////////////////
                // Let the word fly ...
				ml.wordIsBeingSelected = true;
				showFullWordAndAsk( sw.brc , word , group, options && options.rowsDeleted || 0 , function( takeWord ) {	
					ml.wordIsBeingSelected = false;
                    //////////////////////////////////
                    // Was the word taken, or ok pressed?
					if( takeWord ) {
                        /////////////////////////
						// calculate word value
						for( var wordMul=1,value=0,k=0 ; k<word.length ; k++ ) {
							var val = $42.letterValues[word[k]] && $42.letterValues[word[k]].value || 0,
								m = ml.multipliers;
							
							for( var l=0 ; l<m.length ; l++ ) {
								if( m[l].brc.row === sw.brc.row && m[l].brc.col === sw.brc.col+k ) {
									if( m[l].word ) wordMul = m[l].mul;
									else {
										val *= m[l].mul;
									}
									// release and delete it
									_42_release(m[l].sprite);
									ml.removeChild(m[l].sprite);
									m.splice(l,1);
									break;
								}
							}
							
							value += val;
						}

                        ////////////////////
                        // Remember the word
                        ml.levelWords.push({ 
                            word: word,
                            value: value
                        });

                        if( level.music.presentWord ) $42.SCENE.stopEffect(level.music.presentWord);
                        
                        ml.unselectWord(false);
                        ml.checkForAndRemoveCompleteRows(sw.brc.row);
                        setSelections();
                        
                        ////////////////////////////////////
                        // Check level conditions
                        if( checkLevelConditions(word, value) ) {
						    var ls = cc.sys.localStorage;
                            
                            for( var i=0 ; level.newLetters && i<level.newLetters ; i++ ) setNextProfileLetter();

                            if( level.music.final ) $42.SCENE.playEffect(level.music.final);
                            
                            $42.wordTreasure = $42.wordTreasure.concat(ml.levelWords);
                            ml.levelWords = [];
                            if( ++$42.currentLevel > $42.LEVEL_DEVS[ml._gameMode].length ) {
                                ml.drawScorebar(false);

                                youWonTheGame();
                                ls.removeItem("wordTreasure");
                                ls.removeItem("currentLevel");
                                ls.removeItem("wordProfile");

                                if( ml._gameMode === "easy" ) {
                                    var mode = "intermediate";
                                    ls.setItem("currentDifficulty", mode);
                                    ls.setItem("maxDifficulty", mode);
                                } else if( ml._gameMode === "intermediate" ) {
                                    var mode = "expert";
                                    ls.setItem("currentDifficulty", mode);
                                    ls.setItem("maxDifficulty", mode);
                                }

                                return true;
                            } else {
                                ls.setItem("wordTreasure",JSON.stringify($42.wordTreasure));
                                ls.setItem("currentLevel",$42.currentLevel);
                                ls.setItem("wordProfile",$42.wordProfile);
                                
                                setTimeout(function() {
                                    stopBackgroundMusic($42.currentLevel-1);
                                    endLevel($42.currentLevel-1); // level number switched already
                                    startNewLevel();
                                }, $42.BACKGROUND_SPEED*1.2*1000);
                            }
                        } else {
                            if( level.music.nextWord ) $42.SCENE.playEffect(level.music.nextWord);
                            
                            ml.pauseBuildingTiles = false; 
                            //cc.log("pauseBuildingtiles set to "+this.pauseBuildingTiles+" at nextTile no new level." );
                            ml.wordsForTilesCnt = level.wordFreq-1;
                            ml.fillWordsForTiles();
                        }

                        ml.drawScorebar(false);
					} else {
                        ml.pauseBuildingTiles = false; 
                        //cc.log("pauseBuildingtiles set to "+this.pauseBuildingTiles+" at rejected word." );
						ml.checkForAndRemoveCompleteRows();
						ml.unselectWord(true);
						moveSelectedWord(sw.brc);
					}
				});

				return true; // a word was found
			}
		}
		
        if( ml.playEffectSelection ) {
            $42.SCENE.callFuncOnNextBeat(function() {
                $42.SCENE.playEffect(level.music.selection);
            }, level.music.selection);
            ml.playEffectSelection = false;
        }

        ml.pauseBuildingTiles = false;
        //cc.log("pauseBuildingtiles set to "+this.pauseBuildingTiles+" at no word found." );
		
        return false; // no word was found
	};
	
    ////////////////////////////////////////////////////////////////////////////////////////
    // startNewLevel prepares for level set in $42.currentLevel 
    //
    //
    var startNewLevel = function() {

        var self = this,
            level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];

        //////////////////////////
        // Set globals ...
		ml.lettersForNextTile = [];
        ml.levelLabels = [];
        ml.levelPool = [];
        ml.levelWords = []; 
        ml.selections = [];
        ml.wordsForTilesCnt = level.wordFreq && level.wordFreq-1 || 1;

        /////////////////////////////
        // Calculate pool of possible words
        var wp = $42.wordProfile,
            tmpPool = [],
            pool = [],
            prefixes = [];

        /////////////////////////////
        // filter conditions
        for( var i=0,prefGroups=0 ; level.prefGroups && i<level.prefGroups.length ; i++ ) prefGroups += (1 << parseInt(level.prefGroups[i]) >>> 0);
        var cnt = 0;
        for( var p in $42.words ) {
            cnt++;
            setTimeout( function(p) {
                var prefix = $42.words[p],
                    levelWords = [];

                for( var i=0 ; prefix && i<prefix.length ; i++ ) {
                    var word = prefix[i];

                    if( level.minValue && word.value < level.minValue ) continue;
                    if( level.minLength && word.word.length < level.minLength ) continue;
                    if( level.maxLength && word.word.length > level.maxLength ) continue;
                    if( (wp & word.profile) < word.profile ) continue; 
                    //if( prefGroups && (prefGroups & word.groups) === 0) continue; 

                    levelWords.push(word);
                }

                if( levelWords.length ) { 
                    tmpPool[p] = levelWords;

                    prefixes.splice(Math.floor(Math.random()*prefixes.length),0,p);
                }

                if( --cnt === 0 ) prepareLevel();
            },1,p);
        }

        var prepareLevel = function() {
            /////////////////////////////
            // Draw sun
            var element1 = new cc.Sprite(res.background_element1_png);
            element1.setPosition(cc.p(cc.width/2,cc.height*0.67));
            element1.setOpacity(0);
            element1.setScale(0.5);
            element1.setCascadeOpacityEnabled(true);
            ml.addChild(element1,5);
            _42_retain(element1,"Background sun");
            element1.runAction(
                cc.sequence(
                    cc.delayTime($42.BACKGROUND_SPEED*1.5),
                    cc.EaseSineOut.create(
                        cc.spawn(
                            cc.scaleTo($42.BACKGROUND_SPEED*0.67, 0.6),
                            cc.fadeTo($42.BACKGROUND_SPEED*0.67,128)
                        )
                    ),
                    cc.delayTime($42.BACKGROUND_SPEED),
                    cc.EaseSineIn.create(
                        cc.fadeOut($42.BACKGROUND_SPEED*0.67)
                    ),
                    cc.callFunc(function() {
                        ml.removeChild(element1);
                        _42_release(element1);
                    })
                )
            );

            var oldLevelnr = ml._levelNr,
			    levelnr = ml._levelNr = cc.LabelTTF.create($42.currentLevel, _42_getFontName(res.exo_regular_ttf) , 150);
            levelnr.setPosition(cc.p(cc.width/2, cc.height*0.67));
            levelnr.setOpacity(0);
            levelnr.setColor(cc.color(44,18,44,255));
            ml.addChild(levelnr,10);
            _42_retain(levelnr,"Background level nr");
            levelnr.runAction(
                cc.sequence(
                    cc.delayTime($42.BACKGROUND_SPEED*2.0),
                    cc.sequence(
                        cc.spawn(
                            cc.fadeIn($42.BACKGROUND_SPEED*1.0),
                            cc.EaseSineOut.create(cc.scaleTo($42.BACKGROUND_SPEED*1.0, 1.3, 1.6))
                        ),
                        cc.EaseSineIn.create(cc.scaleTo($42.BACKGROUND_SPEED*0.22, 0)),
                        cc.scaleTo(0, 0.4),
                        cc.moveTo(0,cc.p(30,cc.height-41))
                    ),
                    cc.callFunc(function() {
                        if( oldLevelnr ) oldLevelnr.runAction(
                            cc.sequence(
                                cc.delayTime($42.BACKGROUND_SPEED*0.05),
                                cc.spawn(
                                    cc.rotateBy($42.BACKGROUND_SPEED*0.33,720),
                                    cc.moveBy($42.BACKGROUND_SPEED*0.33,cc.p(-100,50))
                                ),
                                cc.callFunc(function() {
                                    ml.removeChild(oldLevelnr);
                                    _42_release(oldLevelnr);
                                })
                            )
                        );
                        levelnr.setColor(cc.color(128,128,128));
                        levelnr.setOpacity(128);
                    })
                )
            );

            var element2 = new cc.Sprite(res.background_element2_png);
            element2.setPosition(cc.p(cc.width/2,cc.height*0.67));
            element2.setOpacity(0);
            element2.setScale(0.5);
            ml.addChild(element2,5);
            _42_retain(element2,"Background beams");
            element2.runAction(
                cc.sequence(
                    cc.delayTime($42.BACKGROUND_SPEED*1.5),
                    cc.EaseSineOut.create(
                        cc.spawn(
                            cc.scaleTo($42.BACKGROUND_SPEED*0.67, 0.6),
                            cc.fadeTo($42.BACKGROUND_SPEED*0.67,128)
                        )
                    ),
                    cc.delayTime($42.BACKGROUND_SPEED),
                    cc.EaseSineIn.create(
                        cc.fadeOut($42.BACKGROUND_SPEED*0.67)
                    ),
                    cc.callFunc(function() {
                        ml.removeChild(element2);
                        _42_release(element2);
                    })
                )
            );

            element1.runAction(cc.rotateBy($42.BACKGROUND_SPEED*4.5,-450));
            element2.runAction(cc.rotateBy($42.BACKGROUND_SPEED*4.5,450));
            
            /////////////////////////////
            // Remove old background if there is one
            var oldBackground = ml.getChildByTag($42.TAG_BACKGROUND_SPRITE),
                movement = $42.BACKGROUND_MOVEMENTS[($42.currentLevel-1)%$42.BACKGROUND_MOVEMENTS.length];
            if( oldBackground ) {
                oldBackground.runAction(
                    cc.sequence( 
                        cc.delayTime($42.BACKGROUND_SPEED/4),
                        cc.EaseSineOut.create(
                            cc.moveBy($42.BACKGROUND_SPEED,movement)
                        ),
                        cc.callFunc(function() {
                            ml.removeChild(oldBackground);
                            _42_release(oldBackground);
                        })
                    )
                );
            }

            ////////////////////////////
            // Introduce new background
            var background = new cc.Sprite(res["background"+("0"+$42.currentLevel).slice(-2)+"_png"]) ||
                             new cc.Sprite(res.background01_png);
            background.attr({
                x: cc.width/2 - movement.x,
                y: cc.height/2 - movement.y,
                scale: 1,
                rotation: 0
            });
            background.setCascadeOpacityEnabled(true);
            ml.addChild(background, 0, $42.TAG_BACKGROUND_SPRITE);
            _42_retain(background, "background");
            background.runAction(
                cc.sequence(
                    cc.delayTime($42.BACKGROUND_SPEED/4),
                    cc.EaseSineOut.create(
                        cc.moveBy($42.BACKGROUND_SPEED,movement)
                    )
                )
            );

            var levelnrCorner  = new cc.Sprite(res.background_levelnr_png);
            levelnrCorner.setPosition(cc.p(46,cc.height-41));
            levelnrCorner.setOpacity(180);
            background.addChild(levelnrCorner,5);

            /////////////////////////////////
            // Look for specific words and prefixes 
            for( var i=0 ; i<level.words ; i++ ) {

                for( var j=0 ; j<prefixes.length ; j++ ) {
                    var prefix = tmpPool[prefixes[j]],
                        cand = [];

                    // look if there is another prefix with the first two letters swaped?
                    var swaped = false;
                    for( var p in pool ) {
                        if( prefix[j] && p[0] === prefix[j].word[1] && p[1] === prefix[j].word[0] ) {
                            swaped = true;
                            break;
                        }
                    }
                    if( swaped ) continue;

                    for( var k=0; k<prefix.length ; k++ ) {
                        var word = prefix[k];
                        
                        if( level.minValue && word.value < level.minValue ) continue;
                        if( level.minLength && word.word.length < level.minLength ) continue;
                        if( level.maxLength && word.word.length > level.maxLength ) continue;

                        cand.push(word);
                    }

                    switch(level.type) {
                        case $42.LEVEL_TYPE_GIVEN:
                            if( cand.length > 0 ) {
                                var word = cand[Math.floor(Math.random()*cand.length)],
                                    text = word.word;
                                pool[prefixes[j]] = [word];
                            } else continue;
                            break;
                        case $42.LEVEL_TYPE_PREFIX:
                            if( cand.length >= $42.LEVEL_MIN_PREFIX_CANDIDATES ) {
                                var text = prefixes[j];
                                if( level.minLength ) text += " - - - - - - -".substr(0,(level.minLength-3)*2); 

                                pool[prefixes[j]] = prefix;
                            } else continue;
                            break;
                        case $42.LEVEL_TYPE_FREE:
                            if( !cand.length ) continue;

                            var text = "----?";
                            if( level.minLength ) text = " - - - - - - - - - -".substr(0,level.minLength*2)+"?"; 
                            break;
                    }

                    break;
                }

                cc.assert(j<prefixes.length, "startNewLevel: Not enough candidates found. Stopping in round "+i);
                prefixes.splice(j,1);

                /////////////////////////////////
                // Draw word on screen
                var label = ml.levelLabels[i] = cc.LabelTTF.create(text, _42_getFontName(res.exo_regular_ttf) , 72);
                label.setPosition(cc.width/2,cc.height*0.8-i*150);
                label.setColor(cc.color(0,0,0));
                label.setOpacity(0);
                label.setScale(0.8);
                _42_retain(label, "Level label ("+i+")");	
                background.addChild(label, 0);
                label.runAction(
                    cc.sequence(
                        cc.delayTime(4.5+i*0.33),
                        cc.spawn(
                            cc.scaleTo(1,1),
                            cc.fadeTo(1,$42.GIVEN_WORDS_OPACITY)
                        )
                    )
                );

                //////////////////////////////////
                // Add condition
                if( level.type !== $42.LEVEL_TYPE_GIVEN && (level.minValue || level.minLength) ) { 
                    if( level.minValue ) var cond = cc.LabelTTF.create($42.t.level_min_value.replace(/\%d/,level.minValue), _42_getFontName(res.exo_regular_ttf) , 36);
                    else if( level.minLength ) var cond = cc.LabelTTF.create($42.t.level_min_length.replace(/\%d/,level.minLength), _42_getFontName(res.exo_regular_ttf) , 36);

                    cond.setPosition(label.getContentSize().width/2, 0);
                    cond.setColor(cc.color(0,0,0));
                    cond.setOpacity(0);
                    cond.setScale(0.8);
                    _42_retain(cond, "Level cond ("+i+")");	
                    label.addChild(cond, 0);
                    cond.runAction(
                        cc.sequence(
                            cc.delayTime(2.16+i*0.33),
                            cc.spawn(
                                cc.scaleTo(1,1),
                                cc.fadeTo(1,$42.GIVEN_WORDS_OPACITY+60)
                            )
                        )
                    );
                }
            }

            ml.levelPool = level.type===$42.LEVEL_TYPE_FREE? tmpPool : pool;

            ml.fillWordsForTiles();
            setTimeout( function() {
                ml.pauseBuildingTiles = false;
                //cc.log("pauseBuildingtiles set to "+self.pauseBuildingTiles+" at new level start." );
            }, (5.5+i*0.50) * 1000 );

            checkForTutorial();
        };

        setTimeout(function() {
            $42.SCENE.playBackgroundMusic(level.music.background);
        }, level.music.background.delayTime || 7000);
        $42.SCENE.playEffect(level.music.levelWords);
        $42.SCENE.playEffect(level.music.levelNr);
        
        cc.audioEngine.setMusicVolume($42.MUSIC_VOLUME);
        cc.audioEngine.setEffectsVolume($42.EFFECTS_VOLUME);
    };

    ml.fillWordsForTiles = function() {

        var wordList = ml.levelPool,
            level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1],
            prefixes = [],
            words = [];

        if( level.type === $42.LEVEL_TYPE_FREE ) return;
        if( level.type === $42.LEVEL_TYPE_GIVEN && $42.currentLevel <= 3 ) {
            for( prefix in wordList ) {
                ml.wordsForTiles = {
                    index: 0,
                    words: [wordList[prefix][0].word]
                };
                return;
            }
        }

        //////////////////////////////////
        // Get all available prefixes in random order
        for( prefix in wordList ) prefixes.splice(Math.floor(Math.random()*prefixes.length),0,prefix);
        
        ml.wordsForTiles = {
            index: 0,
            words: words
        };
        
        for( var i=0 ; i<level.words ; i++ ) {
            var prefix = wordList[prefixes[i%prefixes.length]];
           
            if( prefix ) {
                var index = Math.floor(Math.random()*prefix.length);
                for( var j=0 ; j<prefix.length ; j++ ) {
                    word = prefix[(index+j)%prefix.length];
                    if( !level.minLength ||  word.word.length <= level.minLength+1 ) {
                        words.push(word.word);
                        break;
                    }
                }
                // if nothing found, take the last ...
                if( j === prefix.length ) words.push(prefix[prefix.length-1].word);
            } 
        }

    	//$42.msg1.setString("ml.wordForTiles: "+JSON.stringify(words));
    };

    var endLevel = function(level) {
        var level = $42.LEVEL_DEVS[ml._gameMode][level-1]; 
        ml.currentLevelForDeleteRow = $42.currentLevel-1;
        $42.SCENE.playEffect(level.music.deleteLastRows);
        switch( ml._gameMode ) {
        case "easy":
            ml.unselectWord();
            for( var i=0 ; i<7 ; i++ ) {
                setTimeout( function(i) {
                    ml.checkForAndRemoveCompleteRows([0]);
                    if( i === 6 ) {
                        ml.currentLevelForDeleteRow = null;
                    }
                }, $42.MOVE_SPEED * i * 1.1 * 1000, i );
            }
            break;
        case "intermediate":
            ml.unselectWord();
            for( var i=0 ; i<7 ; i++ ) {
                setTimeout( function(i) {
                    ml.checkForAndRemoveCompleteRows([0]);
                    if( i === 6 ) ml.currentLevelForDeleteRow = null;
                }, $42.MOVE_SPEED * i * 1.1 * 1000, i);
            }
            break;
        case "expert":
            ml.unselectWord();
            for( var i=0 ; i<7 ; i++ ) {
                setTimeout( function(i) {
                    ml.checkForAndRemoveCompleteRows([0]);
                    if( i === 6 ) ml.currentLevelForDeleteRow = null;
                }, $42.MOVE_SPEED * i * 1.1 * 1000, i);
            }
        }
    };

    var stopBackgroundMusic = function(currentLevel) {
        var level = $42.LEVEL_DEVS[ml._gameMode][(currentLevel || $42.currentLevel)-1];
        setTimeout(function() {
            $42.SCENE.stopBackgroundMusic(level.music.background.fadeOutTimeEnd);
        }, level.music.background.fadeOutDelay || 1);
    };

    var checkLevelConditions = function(word, value) {

        var ll = ml.levelLabels,
            lp = ml.levelPool,
            level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1],
            prefix = lp[word.substr(0,3)];

        /////////////////////////////
        // Find word in level pool and remove it from there
        for( var i=0; i<prefix.length ; i++ ) if( prefix[i].word === word ) break;
        cc.assert( i<prefix.length, "Solved word was not found in level pool.");
        prefix.splice(i,1);
        if( prefix.length === 0 || level.type === $42.LEVEL_TYPE_PREFIX ) delete lp[word.substr(0,3)];

        //////////////////////////////
        // Find corresponding label
        var found = false;
        for( var i=0 ; i<ll.length ; i++ ) {
            switch( level.type ) {
                case $42.LEVEL_TYPE_GIVEN:
                    if( ll[i].getString() === word ) found = true;
                    break; 
                case $42.LEVEL_TYPE_PREFIX:
                    if( ll[i].getString().substr(0,3) === word.substr(0,3) &&
                        (!level.minLength || word.length >= level.minLength) &&
                        (!level.maxLength || word.length <= level.maxLength) &&
                        (!level.minValue  || value >= level.minValue )) found = true;
                    break; 
                case $42.LEVEL_TYPE_FREE:
                    if( (!level.minLength || word.length >= level.minLength) &&
                        (!level.maxLength || word.length <= level.maxLength) &&
                        (!level.minValue  || value >= level.minValue )) found = true;
                    break; 
            }

            if( found ) break;
        }

        cc.assert(found, "Found word is not in the pool!");

        var label = ll[i],
            cond = label.getChildren()[0];
        label.runAction(
            cc.sequence(
                cc.fadeOut(2),
                cc.callFunc(function() {
                    label.getParent().removeChild(label);
                    _42_release(label);
                })
            )
        );

        if( cond ) cond.runAction(cc.fadeOut(2));
        
        ll.splice(i,1)
    
        for( var j=0 ; j<ll.length ; j++ ) {
            ll[j].runAction(
                cc.moveTo(2, cc.width/2 , cc.height*0.8-j*150)
            );
        }

        if( ll.length === 0 ) return true;
        else return false;
    };

    ////////////////////////////////////////////////////////////////////////////////////////
    // Game end
    //
	var youWonTheGame = function() {
		
		var self = this,
			ls = cc.sys.localStorage;
	       
        ml.pause();
        ml.unscheduleUpdate();

		showAllWordsFlyingIn(function() {
            var self = this,
                endGame = function() {
                    ml.hideAndEndGame($42.TWEET_TEXT_HIDING_TIME+0.1);
                    $42._titleLayer.show();
                }, 
                hide = function() {
                    menu.setEnabled(false);
                    layer.runAction(
                        cc.fadeOut($42.TWEET_TEXT_HIDING_TIME)
                    );
                },
                menuItems = [{
				    label: $42.t.won_tweet_yes, 
				    cb: function(sender) {
                        hide();
                        $42.SCENE.hookTweet(endGame);
		            }
			    },{
				    label: $42.t.won_tweet_no, 
				    cb: function() { 
                        hide();
                        endGame();
                    }
                }];
            var layer = new _42MenuLayer([
            	    $42.t.won_congrats,
                    $42.t.won_tweet,
            	],menuItems),
                menu = layer.getMenu();
            
            layer.setCascadeOpacityEnabled(true);
            ml.getParent().addChild( layer, 1 );
		});		
	};

    //////////////////////////////////////////////////////////////////////////7
    // Show word list at the end
    //
	var showAllWordsFlyingIn = function(cb) {
		var wt = $42.wordTreasure,
            c1 = $42.WORDS_FLYING_IN_COLOR1,
            c2 = $42.WORDS_FLYING_IN_COLOR2;
		
		for( var i=20 ; i>=0 /* wt.length */ ; i-- ) {
			var label = cc.LabelTTF.create(wt[i%wt.length].word, _42_getFontName(res.shadows_into_light_ttf) , 128);
			label.setPosition(cc.width/2,0);
			label.setColor(c1);
			label.setOpacity(0);
            label.setScale(0.25);
			_42_retain(label, "flying word");	
			ml.addChild(label, 5);
			label.i = i;
			label.runAction(
				cc.sequence(
					cc.delayTime(i * 0.85),
					cc.moveTo(1.5,cc.width/2,200),
					cc.spawn(
						cc.moveTo(1.8,cc.width/2,600),
						cc.EaseSineOut.create(
							cc.scaleTo(1.8,1.4)
						),
						cc.EaseSineIn.create(
							cc.fadeTo(1.8,255)
						),
						cc.tintTo(1.8,c2.r,c2.g,c2.b)
					),
					cc.spawn(
							cc.moveTo(1.8,cc.width/2,1000),
							cc.EaseSineIn.create(
								cc.scaleTo(1.8,0.25)
							),
							cc.EaseSineOut.create(
								cc.fadeTo(1.8,0)
							)
						),
					cc.moveTo(1.5,cc.width/2,1200),
					cc.callFunc(function() {
				        _42_release(this);
						ml.removeChild(this);
						if( cb && this.i === 16 ) cb();
					}, label)
				)
			);
		}		
	};
	
    //////////////////////////////////////////////////////////////////////////////////////////
    // Blow the new level value in big letters 
    //
	var blowLevelAndWordValue = function(blow,cb) {
		
		var text = [];
		
		if( blow.allwords ) {
			var wt = $42.wordTreasure;
			for( var i=0 ; i<42 /* wt.length */ ; i++ ) 
				text = text.concat([{t:(i+1)+" "+wt[0].word , scale:3 , color : cc.color(160 - ((i*7)%80), 0 + ((i*4)%40) , 0 + ((i*9)%100))}]);
		}
		
		if( blow.info ) {
			var lines = blow.info;
			for( var i=0 ; i<lines.length ; i++ ) text = text.concat([{t:lines[i],scale: blow.scale? blow.scale 	: 2,color:blow.color?blow.color:cc.color(0,0,128)}]);			
		}
		
		for( var i=0 ; i<text.length ; i++ ) {
			var label = cc.LabelTTF.create(text[i].t, "res/fonts/American Typewriter.ttf", 160);
			label.setPosition(cc.width/2,cc.height/2);
			label.setScale(0,0);
			label.setColor(text[i].color);
			_42_retain(label, "blow up word");	
			ml.addChild(label, 5);
			label.i = i;
			label.setRotation(8.57*i*2);
			label.runAction(
				cc.sequence(
					cc.delayTime(i * 0.88),
					cc.spawn(
						cc.scaleTo(3, text[i].scale),
						cc.fadeTo(3,0),
						cc.rotateBy(3,45,30)
					),
					cc.callFunc(function() {
				        _42_release(this);
						ml.removeChild(this);
						if( cb && this.i === text.length-1 ) cb();
					}, label)
				)
			);
		}		
	};
	
	var deleteWordFromList = function(word) {
		var prefix = word.substr(0,3);

        ////////////////////////////
		// delete word from full word list
		var words = $42.words[prefix];
		for( var i=0 ; i<words.length ; i++ ) {
			if( words[i].word === word ) {
				words[i].deleted = true;
				return true;
			}
		}
		return false;
	};

	var showFullWordAndAsk = function( brc , word , group , rowsDeleted , cb ) {
		var width = word.length * $42.BS,
			height = $42.BS,
			x = $42.BOXES_X_OFFSET + brc.col * $42.BS + width/2,
			y = $42.BOXES_Y_OFFSET + brc.row * $42.BS + height/2;
		
		// create yellow frame sprite
		var wordFrameFrame  = cc.spriteFrameCache.getSpriteFrame("wordframe.png");
		
		var	wordFrameSprite = new cc.Sprite(wordFrameFrame),
			rect = wordFrameSprite.getTextureRect();
		_42_retain(wordFrameSprite, "words: wordFrameSprite");	
		rect.width = width + $42.WORD_FRAME_WIDTH * 2;
		rect.height = height + $42.WORD_FRAME_WIDTH * 2;
		wordFrameSprite.setTextureRect(rect);
		wordFrameSprite.setPosition(x,y);
		ml.addChild(wordFrameSprite,15);
        wordFrameSprite.setOpacity(0);
		
		// add sprites of word
		for( var i=0 ; i<word.length ; i++) {
			cc.assert( ml.boxes[brc.row][brc.col+i].sprite , "42words, showFullword: Sprite is missing in box at position "+brc.row+"/"+brc.col );
			
			var orgSprite = ml.boxes[brc.row][brc.col+i].sprite,
				sprite = new cc.Sprite(orgSprite.getTexture(),orgSprite.getTextureRect());
			sprite.setPosition($42.BS/2+i*$42.BS+$42.WORD_FRAME_WIDTH,$42.BS/2+$42.WORD_FRAME_WIDTH);
			_42_retain(sprite, "words: sprite "+i);	
			wordFrameSprite.addChild( sprite );
		}
		
        var background = new cc.Sprite(res.wordfound_png);
        _42_retain(background, "Word found background");
        background.setPosition(cc.p(cc.width/2, cc.height/2));
        background.setScale(0);
        background.setOpacity(0);
        ml.addChild(background,10);
        fillBackgroundWithWords(background);

		// move, rotate and scale word
		var wordBezier = [
		      cc.p(x<cc.width/2?x+200:x-200,y+200),
              cc.p(x<cc.width/2?x+200:x-200,cc.height-300),
              cc.p(cc.width/2,cc.height-300)];

		wordFrameSprite.runAction(cc.EaseSineIn.create(
			cc.sequence(
                cc.callFunc(function() {
                    rotateCircles(word.length,cc.p(x,y));
                }),
				cc.EaseSineOut.create(
                    cc.spawn(
                        cc.fadeIn ($42.WORD_FRAME_MOVE_TIME*0.05),
                        cc.scaleTo($42.WORD_FRAME_MOVE_TIME*0.05,1.2)
                    )
				),
				cc.EaseSineIn.create(
					cc.scaleTo($42.WORD_FRAME_MOVE_TIME*0.05,1)
				),
				cc.EaseSineIn.create(
				    cc.scaleTo($42.MOVE_SPEED*rowsDeleted + $42.WORD_FRAME_MOVE_TIME*1.0, 1.2)
                ),
                cc.spawn(
                    cc.bezierTo($42.WORD_FRAME_MOVE_TIME*1.4,wordBezier),
                    cc.sequence(
                        cc.EaseSineOut.create(
                            cc.scaleTo($42.WORD_FRAME_MOVE_TIME*0.7,2.3)
                        ),
                        cc.EaseSineIn.create(
                            cc.scaleTo($42.WORD_FRAME_MOVE_TIME*0.7,0.95)
                        )
                    )
				),
				cc.callFunc(function() {
					
					// play sound
					//cc.audioEngine.playEffect(res.pling_mp3);
					
	   				var sprite = null,
                        levelType = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1].type;
	   					resume = function(menuLayer,takeWord) {
					        ml.resume();
					        ml.scheduleUpdate();
					        
					        // release and remove sprites
							s = sprite.getChildren();
					        for( var i=0 ; i<s.length ; i++ ) {
						        if( s[i].__retainId ) _42_release(s[i]);
					        }
					        _42_release(sprite);

							// remove sprites and layer
				            ml.getParent().removeChild(menuLayer);
					        sprite.removeAllChildren(true);
					        ml.getParent().removeChild(sprite);

                            background.runAction(
                                cc.sequence(
                                    cc.EaseQuinticActionOut.create(
                                        cc.spawn(
                                            cc.scaleTo($42.WORD_FRAME_MOVE_TIME,0),
                                            cc.fadeOut($42.WORD_FRAME_MOVE_TIME)
                                        )
                                    ),
                                    cc.callFunc(function() {
                                        ml.removeChild(background);
                                        _42_release(background);
                                    })
                                )
                            );

                            stopCircles();

					        cb( takeWord );					        
	   					},
	   					menuItems = (levelType !== $42.LEVEL_TYPE_GIVEN? [{
	    					label: $42.t.take_word_yes, 
	    					cb: function(sender) {
					            //menuLayer.removeAllChildren();
	    						
	    						resume(this,true);	    							
	    			        }
	    				},{
	    					label: $42.t.take_word_no, 
	    					cb: function(sender) {
	    						resume(this,false);
	    			        }
	    				}] : [{
	    					label: $42.t.take_word_ok, 
	    					cb: function(sender) {
	    						resume(this,true);	    							
	    			        }
	    				}]);
	   				
	   				var menuLayer = new _42MenuLayer(levelType !== $42.LEVEL_TYPE_GIVEN? $42.t.take_word_question: $42.t.take_word_congrats[Math.floor(Math.random()*$42.t.take_word_congrats.length)],menuItems); 
    	            ml.getParent().addChild( menuLayer , 2);

                    menuLayer.setOpacity(0);
                    var items = menuLayer.getChildren();
                    
                    if( items[2] ) {
                        items[0].setColor(cc.color(0,0,0,255));
                        items[0].setPosition(cc.p(cc.width/2,cc.height*0.50));
                        items[1].setColor(cc.color(0,0,0,255));
                        items[1].setPosition(cc.p(cc.width/2,cc.height*0.36));
                        items[2].setColor(cc.color(0,0,0,255));
                        items[2].setPosition(cc.p(cc.width/2,cc.height*0.28));
                    } else {
                        items[0].setColor(cc.color(0,0,0,255));
                        items[0].setPosition(cc.p(cc.width/2,cc.height*0.50));
                        items[1].setColor(cc.color(0,0,0,255));
                        items[1].setPosition(cc.p(cc.width/2,cc.height*0.34));
                    }

    	            if( ml.hookResumeAskForWord ) ml.hookResumeAskForWord( resume , menuLayer );
    	            
    				sprite = new cc.Sprite(this.getTexture(),this.getTextureRect());
    				var children = this.getChildren(),
    					childSprites = [];
    				for( var i=0 ; i<children.length ; i++ ) {
    					childSprites[i] = new cc.Sprite(children[i].getTexture(),children[i].getTextureRect());
    					_42_retain(childSprites[i],"words: childSprites["+i+"] ");	
    					childSprites[i].setPosition(children[i].getPosition());
    					childSprites[i].setColor(children[i].getColor());
    					childSprites[i].setScale(children[i].getScale());

        				sprite.addChild(childSprites[i],2);    					
    				}
    				sprite.setPosition(this.getPosition());
    				_42_retain(sprite, "words: sprite");	
    				sprite.setScale(0.95,0.95);
    				ml.getParent().addChild(sprite,2);
					
                    // release and remove word sprite that is not visible anymore
			        var s = wordFrameSprite.getChildren();
			        for( var i=0 ; i<s.length ; i++ ) {
				        _42_release(s[i]);
			        }
			        _42_release(wordFrameSprite);
			        wordFrameSprite.removeAllChildren(true);
			        ml.removeChild(wordFrameSprite);	  

        	        ml.pause();
        	        ml.unscheduleUpdate();

				}, wordFrameSprite)
			)
		));

        background.runAction(
            cc.sequence(
				cc.delayTime($42.MOVE_SPEED*rowsDeleted+$42.WORD_FRAME_MOVE_TIME*2),
                cc.callFunc(function() {
                }),
                cc.EaseQuinticActionOut.create(
                    cc.spawn(
                        cc.scaleTo($42.WORD_FRAME_MOVE_TIME/2,1),
                        cc.fadeTo($42.WORD_FRAME_MOVE_TIME/2,255)
                    )
                )
            )
        );

	};

    var fillBackgroundWithWords = function(background) {

        var wt = $42.wordTreasure,
            words = wt.concat(ml.levelWords);

        for( var i=0,x=cc.width-$42.WORDFOUND_PADDING,y=$42.WORDFOUND_PADDING ; i<words.length ; i++ ) {

		    var word = cc.LabelTTF.create(words[i].word, _42_getFontName(res.exo_regular_ttf), 32),
                mostafa = new cc.Sprite(res.murbiks_single_png),        
                width = word.getContentSize().width;

            x = x - width/2;
            if( x < width/2 + $42.WORDFOUND_PADDING ) {
                x = cc.width - $42.WORDFOUND_PADDING - width/2;
                y += $42.WORDFOUND_LINE_HEIGHT;
            }

		    word.setPosition(cc.p(x,y));
		    word.setColor($42.WORDFOUND_COLOR);
		    background.addChild(word);

            x = x - width/2 - $42.WORDFOUND_MOSTAFA_SPACE/2;
            if( x < $42.WORDFOUND_PADDING ) {
                x = cc.width - $42.WORDFOUND_MOSTAFA_SPACE / 3;
                y += $42.WORDFOUND_LINE_HEIGHT;
            }

            mostafa.setPosition(cc.p(x,y));
            mostafa.setScale(0.4);
            background.addChild(mostafa);
            
            x -= $42.WORDFOUND_MOSTAFA_SPACE/2;
        }
	};
	
	var selectBestWord = function() {
		var s = ml.selections,
			sw = ml.selectedWord,
			nsw = null;

		if( !s.length ) return false;
		if( sw ) ml.unselectWord();
		
		for( var i=s.length-1 ; i>=0 ; i-- ) {
			var words = s[i].words;
			for( var j=0,max=0 ; j<words.length ; j++ ) max = Math.max(max,words[j].value);

			if( !nsw || max > nsw.maxValue ) {
				nsw = {
					brc: s[i].brc,
					words: words,
					markers: [],
					sprites: [],
					maxValue: max
				} 
			}
		}
		
		cc.assert(nsw, "42words, selectBestWord: No word to select.");

		ml.selectedWord = nsw;		
		var x = $42.BOXES_X_OFFSET + nsw.brc.col*$42.BS + 1.5*$42.BS,
			y = $42.BOXES_Y_OFFSET + nsw.brc.row*$42.BS + 1.5*$42.BS;
		
		updateSelectedWord();
	};

    var selectFreeWord = function() {
		var s = ml.selections,
			sw = ml.selectedWord,
			nsw = null,
            level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];

		if( !s.length ) return false;
		if( sw ) ml.unselectWord();
       
		for( var i=s.length-1 ; i>=0 ; i-- ) {
			var words = s[i].words,
                brc = s[i].brc;

			for( var j=0,max=0 ; j<words.length ; j++ ) {
                var word = words[j].word,
                    max = Math.max(max, words[j].value);

                for( var k=word.length-1 ; k>=3 ; k-- ) {
                    var box = ml.boxes[brc.row][brc.col+k];
                    if( box && box.userData !== word[k] ) break;
                    if( !box ) var index = k;
                }
                if( k < 3 ) {
                    ////////////////////
                    // free space around?
                    for( var k=0, fs=0; k<6; k++ ) if( ml.boxes[brc.row+Math.floor(k/3)][brc.col+index+k%3] ) fs++;

                    if( fs <= 2 || !ml.boxes[brc.row+1][brc.col+index] ) break;
                }
            }
            if( j<words.length ) {
                ml.selectedWord = {
                    brc: brc,
                    words: words,
                    markers: [],
                    sprites: [],
                    maxValue: max
                } 
                ml.playEffectSelection = true;
		        updateSelectedWord();
                return
            }
		}
    };

	var moveSelectedWord = function(brc, selectedByUser) {
		var sw = ml.selectedWord,
            sbu = selectedByUser === undefined && sw? sw.selectedByUser : selectedByUser;
		
		if( sw ) {
			ml.boxes[sw.brc.row][sw.brc.col].markers = sw.markers;
			
			// delete old sprites
			if( sw.startMarker ) {
				_42_release(sw.startMarker);

				ml.removeChild( sw.startMarker );				
			}
			for( var i=0 ; i<sw.sprites.length ; i++ ) if( sw.sprites[i]  ) {
				_42_release(sw.sprites[i]);
				ml.removeChild( sw.sprites[i] );
				sw.sprites[i] = null;
			}
		}
			
		// define a new one
		if( brc ) {
			// var words =
			// $42.words[ml.boxes[brc.row][brc.col].words[0].word.substr(0,3)];
			var box = ml.boxes[brc.row][brc.col],
				words = box.words,
				markers = box.markers;
			if( words ) {
				ml.selectedWord = {
						brc: brc,
						words: words,
						markers: markers || [],
						sprites: [],
                        selectedByUser: sbu
				};
				
				updateSelectedWord();

			} else {
				ml.selectedWord = null;
			}
		} else {
			ml.selectedWord = null;
		}		
	};
	
	ml.unselectWord = function(refresh) {
		moveSelectedWord(null);

	    if( refresh ) setSelections();
	}
	
	var blowWords = function(pos, words) {

		var angle = Math.random() * 360;
		for( var i=0 ; i<Math.min(words.length,$42.MAX_WORDS_BLOWN) ; i++ ) {
			var word = cc.LabelTTF.create(words[i].word, _42_getFontName(res.exo_regular_ttf), 38),
	        	x = pos.x + Math.sin(cc.degreesToRadians(angle))*100,
	        	y = pos.y + Math.cos(cc.degreesToRadians(angle))*100;
			
			word.setPosition(x,y);
	        word.setRotation(angle+90);
	        _42_retain(word, "blow word "+i);	
	        angle = (angle+79)%360;
	        ml.addChild(word, 5);
	        var x2 = Math.random()>0.5? -400 : cc.width + 400,
	        	y2 = Math.random()*cc.height,
	        	x1 = x2<0? cc.width:0,
	        	y1 = Math.random()*cc.height,
	        	bezier = [cc.p(word.x,word.y),
	                      cc.p(x1,y1),
	                      cc.p(x2,y2)],
	            rotateAction = cc.rotateBy(5,-720,-720),
	            bezierAction = cc.bezierTo(5-Math.random(),bezier),
	            fadeTime = Math.random()+1,
	            fadeAction = cc.sequence(
    				cc.spawn(
						cc.fadeTo((fadeTime-1)*2,255),
						cc.scaleTo((fadeTime-1)*2,1.1)
    				),
    				cc.spawn(
						cc.fadeTo(fadeTime,128),
						cc.scaleTo(fadeTime,0.4)
    				),
    				cc.spawn(
						cc.fadeTo(fadeTime,255),
						cc.scaleTo(fadeTime,1.2)
    				),
    				cc.spawn(
						cc.fadeTo(fadeTime,128),
						cc.scaleTo(fadeTime,0.6)
    				),
    				cc.spawn(
						cc.fadeTo(fadeTime,255),
						cc.scaleTo(fadeTime,1.1)
    				),
    				cc.spawn(
						cc.fadeTo(fadeTime,128),
						cc.scaleTo(fadeTime,0.5)
    				)
	            );
	        word.runAction(fadeAction);
	        word.runAction(rotateAction);
	        word.runAction(cc.sequence(bezierAction,cc.callFunc(function(){
				_42_release(this);

	        	ml.removeChild(this);
	        },word)));
		}
	};
		
    var rotateCircles = function(len, wordPos) {
        var ROUNDS = 4,
            yOffset = (856 - wordPos.y) / (ROUNDS-1),
            pos = [
                cc.p(320-3.5*len*10,856+ 5),
                cc.p(320-2.5*len*10,856+10),
                cc.p(320-1.5*len*10,856-15),
                cc.p(320-0.5*len*10,856-20),
                cc.p(320+0.5*len*10,856+15),
                cc.p(320+1.5*len*10,856-25),
                cc.p(320+2.5*len*10,856+10),
                cc.p(320+3.5*len*10,856- 5)
            ],
            zIndex = [
                20,
                11,
                12,
                18,
                14,
                15,
                16,
                17
            ];

        ml._wordFoundCircles = [];
        for( var i=0 ; i<8 ; i++ ) {
            var c = ml._wordFoundCircles[i] = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("circle"+(i+1)+".png"));
            ml.addChild(c, zIndex[i]);
            c.setPosition(cc.p(cc.width*1.2, cc.height/2));
            _42_retain(c, "Circle "+i);

            for( var j=0, bezier=[] ; j<ROUNDS ; j++ ) {
                var radius = cc.size(cc.width*0.5-j*cc.width*0.5/(ROUNDS-1), cc.height/8-j*cc.height/8/(ROUNDS-1)),
                    deviation  = { 
                        left: cc.p((0.5-Math.random()) * radius.width, (0.5-Math.random()) * radius.height),
                        right:cc.p((0.5-Math.random()) * radius.width, (0.5-Math.random()) * radius.height)
                    }
                bezier[j] = { 
                    upper: [
                        cc.p(pos[i].x + radius.width + deviation.right.x, pos[i].y + radius.height + deviation.right.y - (ROUNDS-j-1)*yOffset),
                        cc.p(pos[i].x - radius.width + deviation.left.x , pos[i].y + radius.height + deviation.left.y  - (ROUNDS-j-1)*yOffset),
                        cc.p(pos[i].x - radius.width, pos[i].y - (ROUNDS-j-1)*yOffset)
                    ], 
                    lower: [
                        cc.p(pos[i].x - radius.width - deviation.left.x , pos[i].y - radius.height - deviation.left.y  - (ROUNDS-j-1)*yOffset),
                        cc.p(pos[i].x + radius.width - deviation.right.x, pos[i].y - radius.height - deviation.right.y - (ROUNDS-j-1)*yOffset),
                        cc.p(pos[i].x + radius.width, pos[i].y - (ROUNDS-j-1)*yOffset)
                    ]
                };
            }

            var speed = (50+Math.random()*50)*(i%2?-1:1),
                time = 0.280;

            c.runAction(
                cc.sequence(
                    cc.rotateBy(time*2, speed*4/ROUNDS),
                    cc.rotateBy(time*2, speed*3/ROUNDS),
                    cc.rotateBy(time*2, speed*2/ROUNDS),
                    cc.rotateBy(time*2000, speed*1000/ROUNDS)
                )
            );
            
            c.setScale(0);
            c.runAction(
                cc.sequence(
                    cc.EaseQuinticActionOut.create(
                        cc.scaleTo(time*2,0.08)
                    ),
                    cc.EaseQuinticActionOut.create(
                        cc.scaleTo(time*2,0.18)
                    ),
                    cc.EaseQuinticActionOut.create(
                        cc.scaleTo(time*2,0.28)
                    ),
                    cc.EaseQuinticActionOut.create(
                        cc.scaleTo(time*2,1)
                    )
                )
            );

            setTimeout(function(c, bezier, i) {
                c.runAction(
                    cc.sequence(
                        cc.bezierTo(time, bezier[0].upper),
                        cc.bezierTo(time, bezier[0].lower),
                        cc.bezierTo(time, bezier[1].upper),
                        cc.bezierTo(time, bezier[1].lower),
                        cc.bezierTo(time, bezier[2].upper),
                        cc.bezierTo(time, bezier[2].lower),
                        cc.bezierTo(time, bezier[3].upper),
                        cc.bezierTo(time, bezier[3].lower)
                    )
                )
            }, i*time*500, c, bezier, i);
        } 
    };

    var stopCircles = function() {
        for( var i=0 ; i<8 ; i++ ) {
            var c = ml._wordFoundCircles[i];
            c.runAction(
                cc.sequence(
                    cc.EaseSineOut.create(
                        cc.fadeOut($42.WORD_FRAME_MOVE_TIME + Math.random())
                    ),
                    cc.callFunc(function(c) {
                        ml.removeChild(c);
                        _42_release(c);
                    },c)
                )
            )
        }
    };

	var drawLetterBoxes = function(options) {

        if( !$42.newWordProfileLetters && $42.displayedProfileLetters.length !== 0  ) return;

        ///////////////////////////////////
        // first delete old boxes if there some
        var wpl = $42.wordProfileLetters,
            dpl = $42.displayedProfileLetters,
            boxes = options.boxesPerRow * options.boxesPerCol,
		    rl = $42._rollingLayer;
        
        for( var i=0 ; i<dpl.length ; i++ ) {
            _42_release(dpl[i]);
            dpl[i].getParent().removeChild(dpl[i]);
        }
        dpl = [];
        
        ////////////////////////////////////////
        // fill display with letter boxes (two rows normal size, one row small size)
        for( var i=0 ; i<wpl.length ; i++ ) {
            var normalSizeStart = Math.max(wpl.length - boxes, 0);

            ///////////////////////////
            // create frame around letter
            var letterFrameFrame  = cc.spriteFrameCache.getSpriteFrame("wordframe.png"),
                letterFrameSprite = new cc.Sprite(letterFrameFrame),
                rect = letterFrameSprite.getTextureRect();
            _42_retain(letterFrameSprite, "letterFrameSprite ("+i+")");	
            rect.width  = ($42.BS + $42.WORD_FRAME_WIDTH*2) * options.scale;
            rect.height = ($42.BS + $42.WORD_FRAME_WIDTH*2) * options.scale;
            letterFrameSprite.setTextureRect(rect);
            rl.addChild(letterFrameSprite,4);
            dpl.push(letterFrameSprite);
            
            ////////////////////////////
            // draw letter
            var letter = wpl[i],
                file = $42.LETTER_NAMES[$42.LETTERS.indexOf(letter)],
                spriteFrame = cc.spriteFrameCache.getSpriteFrame(file+".png"),
                sprite = new cc.Sprite(spriteFrame,cc.rect(0,0,$42.BS,$42.BS)),
                pos = cc.p(($42.BS/2+$42.WORD_FRAME_WIDTH)*options.scale,
                           ($42.BS/2+$42.WORD_FRAME_WIDTH)*options.scale);
            
            cc.assert(spriteFrame,"42Words, drawLetterBoxes: Couldn't load sprite for letter '"+letter+"', file: "+file+", spriteFrame: "+spriteFrame);
            sprite.setPosition(pos);
            sprite.setScale(options.scale);
            letterFrameSprite.addChild( sprite );
            
            /////////////////////////////
            // Find position and scale (mini or normal letters)
            if( i<normalSizeStart ) {
                letterFrameSprite.setPosition(options.pos.x + i*($42.BS+options.padding*2)/2*options.scale,
                                              options.pos.y + $42.BS*options.scale);	
                letterFrameSprite.setScale(0.5);
            } else {
                letterFrameSprite.setPosition(options.pos.x + (((i-normalSizeStart)%options.boxesPerRow>>>0)*($42.BS+options.padding*4))*options.scale,
                                              options.pos.y - (((i-normalSizeStart)/options.boxesPerRow>>>0)*($42.BS+options.padding*1.3))*options.scale);

                /////////////////////////////
                // draw value
                //var label = new cc.LabelBMFont( $42.letterValues[letter] && $42.letterValues[letter].value || "0" , "res/fonts/amtype24.fnt" , cc.LabelAutomaticWidth, cc.TEXT_ALIGNMENT_LEFT );
                //label.setPosition(pos.x+30,pos.y);
                //label.setColor(cc.color(255,255,255,255));
                //letterFrameSprite.addChild(label, 5); 
            }
        }		
        
        // let the last box blink when it changed
        while( $42.newWordProfileLetters > 0 ) {
            dpl[dpl.length-$42.newWordProfileLetters--].runAction(cc.sequence(cc.delayTime(options.delay),cc.blink(3.5,5)));
        }

        $42.displayedProfileLetters = dpl;
	};
	
	var animateLetterBoxes = function(options) {

        var dpl = $42.displayedProfileLetters;

        for( var i=0 ; i<dpl.length ; i++ ) {
            dpl[i].runAction(
                cc.sequence(
                    cc.delayTime(i*0.16),
                    cc.repeat(
                        cc.sequence(
                            cc.EaseSineIn.create( cc.scaleTo(0.3, 2) ),
                            cc.EaseSineOut.create( cc.scaleTo(0.3, 1) ),
                            cc.delayTime((dpl.length-3) * 0.16)
                        ), 3
                    )
                )
            );
        }
    };

	var getNextProfileLetters = function() {
		
		var i=0,
			next = [];
		
		for( var letter in $42.letterOrder ) {
			if( $42.wordProfile < ($42.wordProfile | 1<<i) ) {
				next.push({letter:$42.letterOrder[letter],order:i});
				if( next.length === $42.NEXT_PROFILE_LETTERS ) break;
			}
			i++;
		}

		$42.nextProfileLetters = next;
	};
	
	var setNextProfileLetter = function() {
		
		var npl = $42.nextProfileLetters,
			pl = npl.length && npl[npl.length-1] || null;
		
		if( pl ) {
			$42.wordProfile |= (1<<pl.order);	
			$42.wordProfileLetters.push($42.letterOrder[pl.order]);
			if( !$42.newWordProfileLetters ) $42.newWordProfileLetters = 0; 
			$42.newWordProfileLetters++;
			getNextProfileLetters();

			ml.lettersForNextTile.push(pl.letter);
		}
	};
	
	var getNextProfileCandidate = function() {
		if( ml.nextProfileLetterCnt === undefined ) ml.nextProfileLetterCnt = 0; 
		
		if( ++ml.nextProfileLetterCnt === $42.NEXT_PROFILE_LETTER_CNT ) {
			ml.nextProfileLetterCnt = 0;

			var npl = $42.nextProfileLetters;
			if( npl.length > 1 ) npl.splice(npl.length-1,1);
		}
	};
	
    var getFittingTile = function( wft, easy ) {
        var level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1],
            words = wft.words,
            brc = wft.brc,
            tb = $42.TILE_BOXES,
            sw = ml.selectedWord,
            fittingTiles = [],
            yPosTotal = 0,
            ret;

        ml.unselectedWord = false; // special case: word is deselected cause of no possible word
        
        poss = findPossibleWord(words, brc);
     
        for( var p=0 ; p<poss.length ; p++ ) {
            wft.index = poss[p].index;
            wft.wordIndex = poss[p].wordIndex;

			// no brc so take a random tile
            if( !poss[p].brc ) return null;

            brc = {row: poss[p].brc.row, col: poss[p].brc.col+wft.index};
            for( var i=0 ; i<tb.length - (brc.row<$42.TILE_5_6_MAX_ROW?0:2) ; i++ ) {
                var t = {
                        boxes: tb[i],
                        rotatedBoxes: null,
                        rotation:  null
                    };
                for( r=0 ; r<360 ; r+=90 ) {
                    t.rotation = r;
                    ml.rotateBoxes(t);

                    var rb = t.rotatedBoxes;
                    for( var j=0 ; j<rb.length ; j++ ) {
                        var clear = true,
                            grounded = false,
                            groundedAt = [],
                            letters = 0;

                        for( var k=0 ; k<rb.length ; k++ ) {
                            var rowOff = (rb[k].y - rb[j].y) / $42.BS,
                                colOff = (rb[k].x - rb[j].x) / $42.BS;

                            if( brc.row + rowOff < 0 || brc.row + rowOff >= $42.BOXES_PER_COL ||
                                brc.col + colOff < 0 || brc.col + colOff >= $42.BOXES_PER_ROW ) {
                                clear = false;
                                break;
                            } 

                            var box = ml.boxes[brc.row + rowOff][brc.col + colOff];

                            if( box && box.userData ) {
                                clear = false;
                                break;
                            }
                            var row = brc.row + rowOff,
                                col = brc.col + colOff;

                            if( row === 0 || (ml.boxes[row-1][col] && ml.boxes[row-1][col].userData) ) {
                                grounded = true;
                                groundedAt.push({
                                    row: row? row-1:0,
                                    col: col,
                                    box: row? ml.boxes[row-1][col].userData:null
                                });
                            }

                            ////////////////////////
                            // Count how many letters can be placed in current line
                            if( rb[j].y === rb[k].y ) letters++;
                        }

                        if( clear && grounded && letters < 3 ) {
                            fittingTiles.push({
                                tile:       i,
                                boxIndex:   j,
                                dir:        r/90,
                                groundedAt: groundedAt,
                                brc:        {
                                    row: poss[p].brc.row,
                                    col: poss[p].brc.col + poss[p].index
                                }
                            });
                        } 
                    }
                }
            }

            var ft = fittingTiles;

            //////////////////////////
            // Check path of tile
            for( var i=ft.length-1 ; i>=0 ; i-- ) {
                if( !checkPaths(ft[i]) ) {
                    ft.splice(i,1);
                }
            }

            if( ft.length ) break;    
        }

        //cc.log("Fitting tiles: "+JSON.stringify(ft));
        if( ft && ft.length ) return ft[Math.floor(Math.random()*ft.length)];
        
        if( sw && !sw.selectedByUser && level.type === $42.LEVEL_TYPE_GIVEN ) {
            ml.unselectWord(true);
            ml.unselectedWord = true;
        }

        //////////////////////////////
        // Start with any word in the list anew
        return null;
    };

    var checkPaths = function(tile) {
        var tb = $42.TILE_BOXES,
            t = {
                boxes: tb[tile.tile],
                rotation: tile.dir * 90
            },
            targetBrc = tile.brc,
            startBrc = {
                row: 15,
                col: targetBrc.col
            };

        ml.rotateBoxes(t);

        if( !checkPath(t, tile.boxIndex, startBrc, targetBrc) ) {
           for( var i=targetBrc.col+1 ; i<$42.BOXES_PER_ROW ; i++ ) {
               startBrc.col = i;
               if( checkPath( t, tile.boxIndex, startBrc, targetBrc ) ) return true;
            }

            return false;
        }

        return true;
    };

    var checkPath = function(t, index, startBrc, targetBrc) {
        var rb = t.rotatedBoxes,
            brcOffset = rb[index];

        // first check if direct way is possible
        for( var i=startBrc.row ; i>=targetBrc.row ; i-- ) {
            for( var j=0 ; j<rb.length ; j++ ) {
                var row = i + Math.round((rb[j].y - brcOffset.y)/$42.BS),
                    col = startBrc.col + Math.round((rb[j].x - brcOffset.x)/$42.BS),
                    box = ml.boxes[row][col];

                if( col >= $42.BOXES_PER_ROW || box ) return false;
            }
        }

        for( var i=startBrc.col-1 ; i>=targetBrc.col ; i-- ) {
            for( var j=0 ; j<rb.length ; j++ ) {
                var row = targetBrc.row + Math.round((rb[j].y - brcOffset.y)/$42.BS),
                    col = i + Math.round((rb[j].x - brcOffset.x)/$42.BS),
                    box = ml.boxes[row][col];

                if( box ) return false;
            } 
        }

        return true;
    };

    var findPossibleWord = function(words,brc) {
        var rets = [],
            swRet = null;

        // in case of sw: Should there be all possibilities, or just one, and should there be the other words from wtf also (yes!)?
        // How far does the selection of words go?
        // .....
        //
        for( var i=$42.BOXES_PER_COL-1 ; i>= 0 ; i-- ) {
            for( var j=$42.BOXES_PER_ROW-1 ; j>= 0 ; j-- ) {
                if( ml.boxes[i][j] ) {
                    
                    for( var w=0 ; w<words.length ; w++ ) {
                        
                        var word = words[w];
                        if( ml.boxes[i][j].userData === word[0] ) {
                            var index = 1,
                                k = 0;
                            while( j+index<$42.BOXES_PER_ROW && ml.boxes[i][j+index] && ml.boxes[i][j+index].userData === word[index] && index<word.length ) index++; 
                            while( j+index+k<$42.BOXES_PER_ROW && !ml.boxes[i][j+index+k] && index+k<word.length ) k++;

                            if( index+k === word.length ) {
                                 
                                // collect possible positions for each word
                                var ret = {                                           
                                    index: index,
                                    wordIndex: w,
                                    brc: {
                                        row: i,
                                        col: j
                                    }
                                }

                                if( brc && brc.row === i && brc.col === j) swRet = ret;
                                rets.splice(Math.floor(Math.random()*(rets.length+1)), 0, ret);
                            }
                        }
                    }
                }
            }
        }

        // Insert a word start for every word that is missing
        for( var i=0,w=[] ; i<words.length ; i++ ) w.push(i);
        for( var i=rets.length-1 ; i>=0 ; i-- ) if( w.indexOf(rets[i].wordIndex) > -1 ) w.splice(i,1);
        for( var i=0 ; i<w.length ; i++ ) rets.splice(Math.floor(Math.random()*(rets.length+1)),0,{ index: 0, wordIndex: w[i] });

        // Put selected word in front of the result array
        if( swRet ) rets.splice(0, 0, swRet);
        return rets;
    };

	var getProgrammedTile = function(isCalledAgain) {
        ////////////////////////////////
        // Fit in words from wordsForTiles list
        var level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1],
            sw = ml.selectedWord,
            wft = ml.wordsForTiles,
            easy = $42.currentLevel < 3 && level.type === $42.LEVEL_TYPE_GIVEN;

        if( level.type === $42.LEVEL_TYPE_FREE ) return null;
        
        /////////////////////////////////
        // Only return letters in a specified frequency
        if( ++ml.wordsForTilesCnt < level.wordFreq ) return {letters: [" "," "," "," "]};
        else ml.wordsForTilesCnt -= level.wordFreq;

        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        // Word is selected: Look if word is still possible, put one entry into ml.wordsForTiles
        if( sw ) {
            var words = [];
            for( var i=0,index ; i<sw.words.length ; i++ ) {
                var word = sw.words[i].word;
                for( var j=word.length-1 ; j>=3 ; j-- ) {
                    var box = ml.boxes[sw.brc.row][sw.brc.col+j];

                    if( box && box.userData !== word[j] ) break;
                    if( !box ) index = j;
                }

                if( j < 3 ) words.push(word);
            }

            //////////////////////////////////////////
            // No words found that fit to selection
            if( !words.length ) { 
                if( !sw.selectedByUser && level.type === $42.LEVEL_TYPE_GIVEN ) { 
                    ml.unselectWord(true);
                    ml.fillWordsForTiles();
                    wft = ml.wordsForTiles;
                } else {
                    return null; // no tile returned
                }
            /////////////////////////////////////////
            // One or more words found that fit 
            } else {
                wft.brc = sw.brc;
                for( var i=0 ; i<wft.words.length ; i++ ) {
                    if( wft.words[i].substr(0,3) === words[0].substr(0,3) ) {
                        wft.words[i] = words[Math.floor(Math.random()*words.length)];
                        break;
                    }
                }
            }
        }

        ///////////////////////////////////////////////////////////////////////////////////////////////////////
        // Looking for fitting tiles 

        if( wft.words.length > 0 ) {
            var directions = [{x: $42.BS, y:0}, {x:0, y:$42.BS}, {x:-$42.BS, y:0}, {x:0, y:-$42.BS}];
            
            var fittingTile = getFittingTile(wft, easy);

//            fittingTile = {
//                tile: 0,
//                boxIndex: 0,
//                dir: 0
//            };

            var word = wft.words[wft.wordIndex],
                tb = $42.TILE_BOXES,
                tile = { 
                    tile: fittingTile? fittingTile.tile : ml.getRandomValue(easy? $42.TILE_OCCURANCES_EASY : $42.TILE_OCCURANCES),
                    letters: []
                },
                tileBoxes = $42.TILE_BOXES[tile.tile],
                dirFixed = fittingTile && fittingTile.dir !== undefined,
                boxIndex = dirFixed? fittingTile.boxIndex : Math.floor(Math.random()*tileBoxes.length),
                dir = dirFixed? fittingTile.dir : Math.floor(Math.random()*4),
                direction = directions[dir];
            
            // weirdness check
            if( dirFixed ) {
                var rand1 = Math.random() * (level.weirdness || 0),
                    rand2 = Math.random() * (level.weirdness || 0);

                if( rand1 > 0.40 && sw || rand1 > 0.70 ) {
                    //cc.log("WEIRDNESS! rand1 = "+rand1+". Setting wft.indx from "+wft.index+" to ...");
                    wft.index = Math.floor(Math.random() * word.length);
                }
                if( rand2 > 0.25 && sw || rand2 > 0.40 ) {
                    //cc.log("WEIRDNESS! rand2 = "+rand2+". Setting boxIndex from "+boxIndex+" to ...");
                    boxIndex  = Math.floor(Math.random() * tileBoxes.length);
                }
            } 
            
            tile.letters[boxIndex] = word[wft.index++];

            ////////////////////////////////
            // Look if there is a second letter possible, in any rotation of the tile
            var box = tileBoxes[boxIndex];

            for( var i=0 ; wft.index<word.length && i<4 ; i++ ) {
                var second = null,
                    third  = null;

                for( var j=0 ; j<tileBoxes.length ; j++ ) {
                    if( tileBoxes[j].y === box.y + direction.y   && tileBoxes[j].x === box.x + direction.x ) second = j;
                    if( tileBoxes[j].y === box.y + direction.y*2 && tileBoxes[j].x === box.x + direction.x*2 ) third = j;
                }

                // Are the exactly two fitting letters? 
                if( second !== null && third === null ) {
                    tile.letters[second] = word[wft.index++];
                    break;
                }

                if( dirFixed ) break;

                // Is there only one letter and the direction is fixed
                cc.assert(!dirFixed || !third, "In fixed direction mode there should be no third letter.");

                // change direction and try again (only one or three letters fitting)
                direction = directions[++dir%directions.length];
            }

            for( var i=0 ; i<tileBoxes.length ; i++ ) if( !tile.letters[i] ) tile.letters[i] = " ";
            return tile;
        } 

		return null;
	};

    var checkForTutorial = function() {
        var td = $42.tutorialsDone,
            level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1],
            ls = cc.sys.localStorage;

        if( !td.basicConcepts && $42.currentLevel == 1 ) {
            setTimeout(function() {
                var oldLabel = ml.levelLabels[0].getString();
                ml.levelLabels[0].setString("ANNA");

                ml.stopListeners();
                ml.unscheduleUpdate();
                if( ml._currentTile ) ml._currentTile.sprite.runAction(cc.fadeTo(1,50));

                $42.SCENE.hookStartAnimation("Story Basic Concepts", {
                    time: 2,
                    cb: function() {
                        ml.initListeners();
                        ml.scheduleUpdate();
                        if( ml._currentTile ) ml._currentTile.sprite.runAction(cc.fadeIn(0.5));

                        td.basicConcepts = true;
                        ls.setItem("tutorialsDone", JSON.stringify(td));
                        ml.levelLabels[0].setString(oldLabel);
                    },
                    level: level
                });
           }, 9000); 
         } else if( !td.advancedConcepts && $42.currentLevel == 6 ) {
            setTimeout(function() {
                ml.stopListeners();
                ml.unscheduleUpdate();
                if( ml._currentTile ) ml._currentTile.sprite.runAction(cc.fadeTo(1,50));

                $42.SCENE.hookStartAnimation("Story Advanced Concepts", {
                    time: 2,
                    cb: function() {
                        ml.initListeners();
                        ml.scheduleUpdate();
                        if( ml._currentTile ) ml._currentTile.sprite.runAction(cc.fadeIn(0.5));

                        td.advancedConcepts = true;
                        ls.setItem("tutorialsDone", JSON.stringify(td));
                    },
                    level: level,
                    cb_boxes: animateLetterBoxes
                });
           }, 9000); 
            
         }
    };    

	/*
	 * hookLoadImages
	 * 
	 * Called before default images for tiles are loaded
	 * 
	 */
	_42Layer.hookLoadImages = function() {
		//cc.spriteFrameCache.addSpriteFrames(res.letters_plist);
        //Have to be loaded earlier, for murbiks animations
	};
	
	_42Layer.hookStartGame = function() {
	    
        // global data init
        var ls = cc.sys.localStorage,
            wtJSON = ls.getItem("wordTreasure"),
        	wt = $42.wordTreasure = wtJSON? JSON.parse(wtJSON) : [],
            lv = $42.currentLevel = ls.getItem("currentLevel") || 1,
		    wp = $42.wordProfile = parseInt(ls.getItem("wordProfile")) || 0x7f, // 127 == first 7 letters in the letter order
            lo = $42.letterOrder;

        $42.playerName = ls.getItem("playerName") || "";
        $42.playerHash = ls.getItem("playerHash") || "";

		// remove all words that are already in the treasure
        for( var i=0 ; i<wt.length ; i++ ) {
            var prefix = wt[i].word.substr(0,3),
                index = $42.words[prefix].indexOf(wt[i].word);

            if( index > -1 ) $42.words[prefix][index].deleted = true;
        }
				
		// prepare for which letters can be used (word profile), and what letters will be next
		$42.wordProfileLetters = []; 
		for( var i=0 ; i<lo.length ; i++ ) if( (wp | 1<<i) === wp ) $42.wordProfileLetters.push(lo[i]); 
		$42.displayedProfileLetters = [];
		getNextProfileLetters();

		ml.totalPoints = 0;
		ml.rollingLayerStage = 0;
		ml.nextMultiplier = 0;
		ml.multipliers = [];
		ml.dontAutoSelectWord = false;
	    
        ml.pauseBuildingTiles = true;
        //cc.log("pauseBuildingtiles set to "+this.pauseBuildingTiles+" at start of game." );
        startNewLevel();    
	};
	
	_42Layer.hookEndGame = function() {
		// deselect word
		this.unselectWord();

		var releaseSprite = function(sprite) {
			if( !sprite ) debugger;
			_42_release(sprite);
		};
		
		var dpl = $42.displayedProfileLetters;
		releaseSprite( ml.bestWordSprite );
		for( var i=0 ; i<dpl.length ; i++ ) {
			releaseSprite( dpl[i] );
		}
        releaseSprite(ml.getChildByTag($42.TAG_BACKGROUND_SPRITE));
        releaseSprite(ml._levelNr);
		releaseSprite(ml.bestWordValue);
		releaseSprite(ml.score_words_mini);
		releaseSprite(ml.score_points);
		releaseSprite(ml.score_words_label);
		releaseSprite(ml.score_words);
	};

	/*
	 * hookSetTile
	 * 
	 * Called before building a tile to choose a tile
	 * 
	 * Param: none
	 * 
	 */
	_42Layer.hookSetTile = function() {
		
        var level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];
        $42.SCENE.playEffect(level.music.setTile);
        $42.SCENE.playNextMusicSlot(level.music.setTile, true);
        $42.SCENE.changeAudioSet("setTile");
		
        this._nextTile = getProgrammedTile();
		
		if( !this._nextTile || this._nextTile.tile === undefined ) return ml.getRandomValue($42.TILE_OCCURANCES, undefined, ml.maxRow > $42.MAX_ROW_FOR_WEIRD_TILES? 5:undefined);
        else return this._nextTile.tile; 
	};

	/*
	 * hookSetTileImages
	 * 
	 * Called while building a tile to set the images of the tile boxes
	 * 
	 * Param: tileBoxes: metrics of the boxes
	 * 
	 */
	_42Layer.hookSetTileImages = function(tileBoxes, pos, userData) {

		var tileSprite = new cc.Sprite(res.letters_png,cc.rect(0,0,0,0)),
            level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1],
            nlp = level.neededLettersProb || $42.NEEDED_LETTERS_PROBABILITY,
            sw = ml.selectedWord,
        	lnt = ml.lettersForNextTile,
            nt = this._nextTile;
				
		_42_retain(tileSprite, "words: tileSprite");
		tileSprite.setPosition(pos);
		ml.addChild(tileSprite,2);
        
        // add single boxes with letters to the tile
        for( var i=0 ; i<tileBoxes.length ; i++) {
        	
        	var ntLetter = nt && nt.letters[i] || null;
            cc.assert(level.type !== $42.LEVEL_TYPE_FREE || !ntLetter, "Free level type should not have programmed tiles." );

        	if( lnt && lnt.length > 0 ) {
        		var val = $42.LETTERS.indexOf(lnt.splice(0,1)[0]);
        	} else if( nt !== null && level.type !== $42.LEVEL_TYPE_FREE && (level.type === $42.LEVEL_TYPE_GIVEN || ntLetter !== " " || Math.random()>(level.fillInRate || 0.5))) {
        		var val = $42.LETTERS.indexOf(ntLetter);
        	} else {
	         	var len = sw && sw.missingLetters && sw.missingLetters.length || 0,
         			prob = len <= 3? nlp / (5-len) : nlp; 
        		while( true ) {
	         		val = (Math.random()>prob || !sw || !len)?  
	         					Math.floor(this.getRandomValue($42.letterOccurences)):
	        					$42.LETTERS.indexOf(sw.missingLetters[Math.floor(Math.random()*sw.missingLetters.length)]);        			
	         					
	         		// no triple letters
	        	    for( k=0,double=0 ; k<i ; k++ ) 
	        	    	if( userData[k] === $42.LETTERS[val] ) double++;
	        	    if( double > 1 ) continue;
	        	    
	         		if( $42.wordProfileLetters.indexOf($42.LETTERS[val]) > -1 ) break;	
        		}
        	}
       					
    		var	spriteFrame = cc.spriteFrameCache.getSpriteFrame($42.LETTER_NAMES[val]+".png"),
    			sprite = new cc.Sprite(spriteFrame,cc.rect(0,0,$42.BS,$42.BS));
    		
    		cc.assert(sprite, "42words, hookSetTileImages: sprite must not be null. (var = "+val+", name="+$42.LETTER_NAMES[val]+" )");
    		_42_retain(sprite, "words: sprite");
        	sprite.setPosition(cc.p(tileBoxes[i].x,tileBoxes[i].y));
        	sprite.setRotation(-$42.INITIAL_TILE_ROTATION);
        	userData[i] = $42.LETTERS[val];
        	
	        tileSprite.addChild(sprite);
        }

        // tile was used, so delete it
        this._nextTile = null;
        
        return tileSprite;
	};	
	
	_42Layer.hookTileFixed = function( brcs ) {
		
        var sw = ml.selectedWord, 
            level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];

		ml.lastBrcs = brcs;
        ml.pauseBuildingTiles = true;
        //cc.log("pauseBuildingtiles set to "+this.pauseBuildingTiles+" at hookTileFixed." );
		
        $42.SCENE.playEffect(level.music.fixTile);
        var time = new Date().getTime();
        //cc.log("---Fixing Tile Music--- Playing sound for fixing tile at "+time);

        ml.maxRow = 0;
        for( var i=0 ; i<brcs.length ; i++ ) ml.maxRow = Math.max(ml.maxRow, brcs[i].row);

		setSelections(); // OPTIMIZATION: Only look in current lines
       
		var ret = updateSelectedWord();

        return ret;
	};	

	_42Layer.hookTileFixedAfterRowsDeleted = function( ) {

        //////////////////////////////////
        // Move to a new selection that came with the last tile
        var moveToNewWord = function() {
            var s = ml.selections,
                sw = ml.selectedWord,
                level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];

            if( level.type === $42.LEVEL_TYPE_GIVEN || !sw ) {
                var brcs = ml.lastBrcs || [];
                for( var i=0 ; brcs && i<brcs.length ; i++ ) {
                    for( var j=0 ; s && j<s.length ; j++ ) {
                        var brc1 = brcs[i],
                            brc2 = s[j].brc;

                        if( brc1.row == brc2.row && (brc1.col == brc2.col || brc1.col == brc2.col+1 || brc1.col == brc2.col+2) ) {
                            ml.playEffectSelection = true;
                            moveSelectedWord(brc2, false);
                            return true;
                        }
                    }
                }
            }

            return false;
        }
		
        var sw = ml.selectedWord;
		if( (!sw || !sw.selectedByUser) && !ml.dontAutoSelectWord && !moveToNewWord() && !sw ) selectFreeWord(); // selectBestWord();

        if( !sw && !ml.wordIsBeingSelected ) {
            ml.pauseBuildingTiles = false;
            //cc.log("pauseBuildingtiles set to "+this.pauseBuildingTiles+" at moveToNewWord." );
        }
	};

	_42Layer.hookDeleteBox = function(brc) {
		var sw = ml.selectedWord,
			box = ml.boxes[brc.row][brc.col],
			s = ml.selections;

		var lb = ml.lastBrcs,
			newBox = false;
		if( lb ) {
			for( var i=0 ; i<lb.length ; i++) 
				if( lb[i].row === brc.row && lb[i].col === brc.col ) 
					break;
			if( i<lb.length ) newBox = true;
		}
        //if( sw && sw.brc.row === brc.row ) cc.log("hookDeleteBox: Box in col "+brc.col+" is marked "+sw.markers[brc.col-sw.brc.col]);
		if( sw && sw.brc.row === brc.row && (
				sw.markers[brc.col-sw.brc.col] === $42.MARKER_SET || 
				sw.markers[brc.col-sw.brc.col] === $42.MARKER_SEL || 
				newBox && sw.markers[brc.col-sw.brc.col] === $42.MARKER_OPT
			)
		) return false;

		// check if selection is deleted, and blow words if it is so
		for( var i=0 ; i<s.length ; i++ ) if( s[i].brc.row === brc.row && s[i].brc.col === brc.col ) break;			
		if( i<s.length )
			blowWords(cc.p($42.BOXES_X_OFFSET + (brc.col+1.5)*$42.BS, $42.BOXES_Y_OFFSET + (brc.row+0.5)*$42.BS),box.words);
		
		return true;
	};
	
	_42Layer.hookMoveBoxDown = function(to,from) {		
		// check if selected word has to move
		var sw = ml.selectedWord;
		if( sw && sw.brc.row === from.row && sw.brc.col === from.col ) {
			sw.brc.row = to.row;
			sw.brc.col = to.col;
		}
	};
	
	_42Layer.hookAllBoxesMovedDown = function(rowsDeleted) {
        var level = $42.LEVEL_DEVS[ml._gameMode][(ml.currentLevelForDeleteRow || $42.currentLevel)-1];
		
        setSelections();
		updateSelectedWord({ rowsDeleted: rowsDeleted});			

        if( !ml.currentLevelForDeleteRow ) {
            $42.SCENE.callFuncOnNextBeat(function() {
                $42.SCENE.playEffect(level.music.deleteRow);
            }, level.music.deleteRow);
        }
		// switch to next profile letter candidate
		getNextProfileCandidate();
	};
    
    _42Layer.hookInitScorebar = function() {
		var sb = $42._scoreBar,
			rl = $42._rollingLayer,
			wt = $42.wordTreasure || [],
            lw = ml.levelWords || [],
			wpl = $42.wordProfileLetters;

        var level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];
        
        ///////////////////////////////////
        // Add values of word treasure and level words
        for( var i=0,tv=0,bw=null ; i<wt.length ; i++ ) {
            tv += wt[i].value;
            if( !bw || bw.value <= wt[i].value ) bw = wt[i];
        }
        for( var i=0; i<lw.length ; i++ ) {
            tv += lw[i].value;
            if( !bw || bw.value <= lw[i].value ) bw = lw[i];
        }

        if( level.type !== $42.LEVEL_TYPE_GIVEN ) {
            drawLetterBoxes({
                pos : cc.p(
                    20,
                    wpl.length>$42.SCOREBAR_LETTERS_PER_ROW*$42.SCOREBAR_LETTERS_PER_COL? 56 : 68
                ),
                scale : $42.SCOREBAR_LETTERS_SCALE,
                padding : $42.SCOREBAR_LETTERS_PADDING,
                boxesPerRow: $42.SCOREBAR_LETTERS_PER_ROW,
                boxesPerCol: $42.SCOREBAR_LETTERS_PER_COL
            });
        }
        
        // draw points, left, back side
        ml.score_words_mini = ml.drawScorebarText("(0 "+$42.t.scorebar_words[1]+")", cc.p(100,111) , 24 , $42.SCORE_COLOR_BRIGHT );
        ml.score_points = ml.drawScorebarText(tv.toString(), cc.p(100,151) , tv>=1000?56:72 , $42.SCORE_COLOR_BRIGHT );

        // draw total words, right, front side
        ml.score_words_label = ml.drawScorebarText($42.t.scorebar_words[1] , cc.p(588,15) , 24 , $42.SCORE_COLOR_DIMM );
        ml.score_words = ml.drawScorebarText((wt.length+lw.length).toString(),cc.p(588,60) , 72 , $42.SCORE_COLOR_BRIGHT );
        
        // draw most valuable word
        ml.bestWordValue = ml.drawScorebarText($42.t.scorebar_mvw,cc.p(400,111),24,$42.SCORE_COLOR_BRIGHT);
        ml.bestWordSprite = ml.drawScorebarWord(bw? bw.word:"",cc.p(400,157),ml.bestWordSprite,0.60);	
    
        return true;
    };
	
	_42Layer.hookDrawScorebar = function(highlight) {
		var sb = ml._scoreBar,
			wt = $42.wordTreasure,
            lw = ml.levelWords,
			wpl = $42.wordProfileLetters,
			rl = $42.rollingLayer;
	
        var level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];

        ///////////////////////////////////
        // Add values of word treasure and level words
        for( var i=0,tv=0,bw=null ; i<wt.length ; i++ ) {
            tv += wt[i].value;
            if( !bw || bw.value <= wt[i].value ) bw = wt[i];
        }
        for( var i=0; i<lw.length ; i++ ) {
            tv += lw[i].value;
            if( !bw || bw.value <= lw[i].value ) bw = lw[i];
        }

        ml.score_words_label.setString($42.t.scorebar_words[wt.length===1?0:1]);
        ml.score_words.setString(wt.length+lw.length);
        ml.score_points.setString(tv.toString());
        ml.score_words_mini.setString("("+(wt.length+lw.length)+" "+$42.t.scorebar_words[wt.length===1?0:1]+")");

        ml.bestWordValue.setString($42.t.scorebar_mvw+ (bw?": "+bw.value:""));
        ml.bestWordSprite = ml.drawScorebarWord(bw? bw.word:"",cc.p(400,157),ml.bestWordSprite,0.60);

        if( level && level.type !== $42.LEVEL_TYPE_GIVEN ) {
            drawLetterBoxes({
                pos : cc.p(
                    20,
                    wpl.length>$42.SCOREBAR_LETTERS_PER_ROW*$42.SCOREBAR_LETTERS_PER_COL? 56 : 68
                ),
                scale : $42.SCOREBAR_LETTERS_SCALE,
                padding : $42.SCOREBAR_LETTERS_PADDING,
                boxesPerRow: $42.SCOREBAR_LETTERS_PER_ROW,
                boxesPerCol: $42.SCOREBAR_LETTERS_PER_COL,
                delay: highlight? $42.SCOREBAR_ROLLING_LAYER_DELAY-0.5 : 0,
                parent : rl
            });
        }
        
        // highlight things
        switch(highlight) {
        case "bestWord": 
            ml.bestWordSprite.runAction(cc.blink($42.SCOREBAR_ROLLING_LAYER_DELAY - 0.5,3));
				break;
		}

        return true;
	};

	_42Layer.hookOnTap = function(tapPos) {
		var sw = ml.selectedWord;
		if( sw ) {
			var swPos = { 
					x: $42.BOXES_X_OFFSET + sw.brc.col * $42.BS,
					y: $42.BOXES_Y_OFFSET + sw.brc.row * $42.BS
			};			
		} 
		
		// check if selected word is hit
		if( sw && tapPos.x >= swPos.x && tapPos.y >= swPos.y - $42.BS/3 && tapPos.y <= swPos.y + $42.BS ) {
			var col = Math.floor((tapPos.x - swPos.x)/$42.BS),
				marker = sw.markers[col];
			if( marker === $42.MARKER_OPT || marker === $42.MARKER_SEL ) {
				cc.assert(ml.boxes[sw.brc.row][sw.brc.col+col].sprite, "42words, hookOnTap: There must be a sprite at position "+sw.brc.row+"/"+(sw.brc.col+col)+".");
				if( marker === $42.MARKER_OPT ) {
					sw.markers[col] = $42.MARKER_SEL;
					ml.boxes[sw.brc.row][sw.brc.col+col].sprite.setOpacity(255);	
				} else {
					sw.markers[col] = $42.MARKER_OPT;					
					ml.boxes[sw.brc.row][sw.brc.col+col].sprite.setOpacity($42.UNSELECTED_BOX_OPACITY);	
				}
				updateSelectedWord();
			} else {
                var level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];
				
                ml.unselectWord(true);
                ml.fillWordsForTiles();
                if( level.type !== $42.LEVEL_TYPE_GIVEN ) ml.dontAutoSelectWord = true;
			}

			return false;
		} else {
			for( var i=ml.selections.length-1 ; i>=0 ; i--) {
				var s = ml.selections[i];

				if( s && tapPos.x >= s.pos.x && tapPos.x <= s.pos.x+s.width && tapPos.y >= s.pos.y && tapPos.y <= s.pos.y+s.height ) {
                    ml.unselectedWord = false;
					moveSelectedWord(s.brc, true);
					ml.dontAutoSelectWord = false;
					setSelections();
					updateSelectedWord();

					return false;
				}
			}
		}

		return true;
	};
	
	_42Layer.hookOnLongTap = function(tapPos) {
        //if( tapPos.y < $42.BOXES_Y_OFFSET ) _42Layer.hookKeyPressed(78);
	};

    _42Layer.hookKeyPressed = function(key) {
      
        var self = this; 
        switch( key ) {
        case 78:  
            stopBackgroundMusic();
            $42.currentLevel = key-48;
            setTimeout(function() {
                if( ++$42.currentLevel < 8 ) {
                    endLevel($42.currentLevel-1);
                    startNewLevel();	
                } else {
                    ml.unscheduleUpdate();
                    ml.stopListeners();
                    $42.wordTreasure.push({word:"SOME"});
                    $42.wordTreasure.push({word:"RANDOM"});
                    $42.wordTreasure.push({word:"WORDS"});
                    $42.wordTreasure.push({word:"JUST"});
                    $42.wordTreasure.push({word:"FORR"});
                    $42.wordTreasure.push({word:"TEST"});
                    $42.SCENE.hookTweet(function() {
                        ml.hideAndEndGame($42.TWEET_TEXT_HIDING_TIME+0.1);
                        $42._titleLayer.show();
                    });
                }
            }, $42.BACKGROUND_SPEED*1.2*1000);
            break;
        case 84:  
            ml.unscheduleUpdate();
            ml.stopListeners();
            $42.wordTreasure.push({word:"SOME"});
            $42.wordTreasure.push({word:"RANDOM"});
            $42.wordTreasure.push({word:"WORDS"});
            $42.wordTreasure.push({word:"JUST"});
            $42.wordTreasure.push({word:"FORR"});
            $42.wordTreasure.push({word:"TEST"});
            $42.SCENE.hookTweet(function() {
                ml.hideAndEndGame($42.TWEET_TEXT_HIDING_TIME+0.1);
                $42._titleLayer.show();
            });
            break;
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
            stopBackgroundMusic();
            $42.currentLevel = key-48;
            setTimeout(function() {
                endLevel($42.currentLevel-1);
                startNewLevel();
            }, $42.BACKGROUND_SPEED*1.2*1000);
            break;
        case 187:
            $42.MUSIC_VOLUME = Math.max($42.MUSIC_VOLUME+0.05,0);
            cc.audioEngine.setMusicVolume($42.MUSIC_VOLUME);
            break;
        case 189:
            $42.MUSIC_VOLUME = Math.max($42.MUSIC_VOLUME-0.05,0);
            cc.audioEngine.setMusicVolume($42.MUSIC_VOLUME);
            break;
        case 190:
            $42.EFFECTS_VOLUME = Math.max($42.EFFECTS_VOLUME+0.05,0);
            cc.audioEngine.setEffectsVolume($42.EFFECTS_VOLUME);
            break;
        case 188:
            $42.EFFECTS_VOLUME = Math.max($42.EFFECTS_VOLUME-0.05,0);
            cc.audioEngine.setEffectsVolume($42.EFFECTS_VOLUME);
            break;
            //EFFECTS_VOLUME: 0.8,
        default:
            //cc.log("Key: "+key+" pressed");
        }
    };
    
    _42Layer.hookPlayLevelSound = function(sound) {
        var level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];
        $42.SCENE.playEffect(level.music[sound]);
    };
    
    _42Layer.hookStopLevelSound = function(sound) {
        var level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];
        $42.SCENE.stopEffect(level.music[sound]);
    };
    
    _42Layer.hookStopBackgroundMusic = function() {
        var level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];
        $42.SCENE.stopBackgroundMusic(level.music.background.fadeOutTimeEnd);
    };

    _42Layer.hookFuncOnNextBeat = function(cb, effect) {
        var level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];	
        //  ERROR after level 7 D/cocos2d-x debug info(13621): D/cocos2d-x debug info(13621): JS: assets/src/words/words.js:2620:TypeError: level is undefined
        $42.SCENE.callFuncOnNextBeat(cb, level.music[effect]);
    };

    _42Layer.hookGetSoundEffect = function(effect) {
        var level = $42.LEVEL_DEVS[ml._gameMode][$42.currentLevel-1];	
        return level.music[effect];
    };

    _42Layer.hookUpdate = function(dt) {
    
        if( ml.hookMurbiksUpdate ) ml.hookMurbiksUpdate(dt);					
    };
};

