////////////////////////////////////////////////////////////////////
// tweet.js contains the code for the tweet at the end of one round, input and sending
//  meie.

$42.TWEET_TEXT_WIDTH = 640;
$42.TWEET_TEXT_HEIGHT = 860;
$42.TWEET_TEXT_TEXT_SIZE = 52;
$42.TWEET_TEXT_TEXT_COLOR = cc.color(0,0,0,255);
$42.TWEET_TEXT_POS = cc.p(0, 1136-$42.TWEET_TEXT_HEIGHT);
$42.TWEET_TEXT_COLOR = cc.color(255,255,240,0);
$42.TWEET_TEXT_TWEET_COLOR = cc.color(0,0,180,222);
$42.TWEET_TEXT_PADDING = 30;
$42.TWEET_TEXT_LINEHEIGHT = 75;
$42.TWEET_TEXT_SPACE_WIDTH = 15;
$42.TWEET_TEXT_MOVING_TIME = 0.11;
$42.TWEET_TEXT_HIDING_TIME = 1.2;
$42.TWEET_NAMES_COLOR = cc.color(0,255,0,180);
$42.TWEET_NAMES_ID = 101; 
$42.TWEET_SHORTIES_WIDTH = 640;
$42.TWEET_SHORTIES_HEIGHT = 180;
$42.TWEET_SHORTIES_POS = cc.p(0, 1136-$42.TWEET_TEXT_HEIGHT-$42.TWEET_SHORTIES_HEIGHT);
$42.TWEET_SHORTIES_COLOR = cc.color(240,240,255,40);
$42.TWEET_SHORTIES_LINEHEIGHT = 75;
$42.TWEET_SHORTIES_LINES = 2;
$42.TWEET_SHORTIES_SPACE_WIDTH = 40;
$42.TWEET_SHORTIES_PADDING = 18;
$42.TWEET_MENU_WIDTH = 640;
$42.TWEET_MENU_HEIGHT = 1136-$42.TWEET_SHORTIES_HEIGHT-$42.TWEET_TEXT_HEIGHT;
$42.TWEET_MENU_POS = cc.p(0, 0);
$42.TWEET_MENU_COLOR = cc.color(0,0,0,255);
$42.TWEET_MENU_BIG_FONT_SIZE = 40;
$42.TWEET_MENU_SMALL_FONT_SIZE = 28;
$42.TWEET_MENU_PADDING = 10;
$42.TWEET_TWEETY_POS = cc.p(320,576);
$42.TWEET_CONNECTION_CHECK = 5000;

var _TWEET_MODULE = function(layer) {
	var tLayer = null,      // tweet layer
        txLayer = null,     // text layer
        shLayer = null,     // shorties layer
        mvLayer = null,     // movable layer
        mnLayer = null,     // menu layer
        menu = null,        // menu
        movableWords = [],
        selectableWords = [],
        shortiesWidth = null,
        shortiesXPos = null,
        touchListener = null,
        touchStartPoint = null,
        touchLastPoint = null,
        touchStartPoint = null,
        touchStartTime = null,
        touchStartPoint = null,
        touchMovingLabel = null,
        touchMovingLabelOrigin = null,
        touchMovingLabelDestination = null,
        touchMovingOffset = null,
        touchMovingVisible = false,
        touchMovingCursor = null,
        touchHidingWord = null,
        touchShortiesXPos = null,
        touchShortiesLastX = null,
        touchShortiesSpeed = null,
        touchRubberBand = null,
        menuTweetItem = null,
        menuTweetConfirm = false,
        menuTweetCnt = 0,
        menuNames = [],
        menuNamesChoose = false,
        menuNamesItem = null,
        finalCallback = null;

    cc.spriteFrameCache.addSpriteFrames(res.tweet_plist);

    layer.hookTweet = function(cb) {

        var wt = $42.wordTreasure || [];

        wt.splice(0,0,{ word: $42.playerName? $42.playerName+":" : $42.t.tweet_anonymous+":" });

        init();

        finalCallback = cb;
    };

    var init = function() {

        tLayer = new cc.Layer();
        layer.addChild(tLayer, 10);
        tLayer.setCascadeOpacityEnabled(true);
        tLayer.setOpacity(0);
        _42_retain(tLayer, "Tweet layer");
		var background = new cc.Sprite(res.twitter_png);
        background.setPosition(cc.width/2,cc.height/2);
        tLayer.addChild(background);

        ////////////////////////////////////
        // init text layer
        txLayer = new cc.LayerColor($42.TWEET_TEXT_COLOR, $42.TWEET_TEXT_WIDTH, $42.TWEET_TEXT_HEIGHT);
        txLayer.setPosition($42.TWEET_TEXT_POS);
        tLayer.addChild(txLayer);
        _42_retain(txLayer, "Tweet text layer");
        putWordsIntoTextLayer();

        ////////////////////////////////////
        // init shorties layer
        shLayer = new cc.LayerColor($42.TWEET_SHORTIES_COLOR, $42.TWEET_SHORTIES_WIDTH, $42.TWEET_SHORTIES_HEIGHT);
        tLayer.addChild(shLayer);
        shLayer.setPosition($42.TWEET_SHORTIES_POS);
        _42_retain(shLayer, "Tweet shorties layer");
        putWordsIntoShortiesLayer();

        ///////////////////////////////////////
        // Cursor sprite
		touchMovingCursor = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("cursor.png"));
        touchMovingCursor.setOpacity(0);
        txLayer.addChild(touchMovingCursor);
        _42_retain(touchMovingCursor, "moving cursor");
        touchMovingCursor.runAction(
            cc.repeatForever(
                cc.sequence(
                    cc.delayTime(1),
                    cc.EaseSineIn.create(
                        cc.scaleTo(0.16,0.9)
                    ),
                    cc.EaseSineOut.create(
                        cc.scaleTo(0.16,1)
                    )
                )
            )
        );

        /////////////////////////////////////
        // Scheduler
        tLayer.update = update;

        tLayer.setPosition(cc.p(260,-450));
        tLayer.setRotation(23);
        tLayer.setScale(0.1);
        tLayer.runAction(
            cc.EaseSineIn.create(
                cc.spawn(
                    cc.moveTo($42.TWEET_TEXT_HIDING_TIME, cc.p(0,0)),
                    cc.rotateTo($42.TWEET_TEXT_HIDING_TIME, 0),
                    cc.scaleTo($42.TWEET_TEXT_HIDING_TIME,1),
                    cc.fadeIn($42.TWEET_TEXT_HIDING_TIME)
                )
            )
        );

        initListeners();
        tLayer.scheduleUpdate();

        /////////////////////////////////////
        // Look which words are still free to be names

        _42_sendMessage("checkNames", {Names:getNames()}, function(data) {
            if( !data ) {
                $42.webConnected = false;
            } else {
                menuNames = data.Names;
                menuNames.sort();
                changeMenu(true);     
            }
        });

        ////////////////////////////////////
        // init menu layer
        mnLayer = new cc.LayerColor($42.TWEET_MENU_COLOR, $42.TWEET_MENU_WIDTH, $42.TWEET_MENU_HEIGHT);
        layer.addChild(mnLayer,20);
        mnLayer.setPosition($42.TWEET_MENU_POS);
        mnLayer.setCascadeOpacityEnabled(true);
        _42_retain(mnLayer, "Tweet menu layer");
        initMenu();

        ///////////////////////////////////////////
        // Background music
        $42.SCENE.playBackgroundMusic($42.MUSIC_TWEET);
    };

    var getNames = function() {
        var mw = movableWords
            sw = selectableWords,
            names = [];
        for( var i=1,cnt=0 ; i<mw.length ; i++,cnt++ ) {
            names.push(mw[i].getString());
        }
        for( var i=0 ; i<sw.length ; i++,cnt++ ) {
            var name = sw[i].getString();
            if( name.length > 3 ) {
                names.push(name);
            }
        }

        return names;
    };

    var hide = function(pos, cb) {

        tLayer.runAction(
            cc.sequence(
                cc.EaseQuinticActionOut.create(
                    cc.spawn(
                        cc.rotateBy($42.TWEET_TEXT_HIDING_TIME,23),
                        cc.scaleTo($42.TWEET_TEXT_HIDING_TIME,0.01),
                        cc.moveTo($42.TWEET_TEXT_HIDING_TIME,pos)
                    )
                ),
                cc.callFunc(function() {
                    if( typeof cb === "function" ) cb();
                })
            )
        );
        mnLayer.runAction(
            cc.EaseSineOut.create(
                cc.fadeOut($42.TWEET_TEXT_HIDING_TIME)
            )
        );

        $42.SCENE.stopBackgroundMusic($42.MUSIC_TWEET.fadeOutTime);
    };

    var exit = function() {
        var mw = movableWords,
            sw = selectableWords;

        layer.removeChild(tLayer);
        tLayer.removeAllChildren(true);
        _42_release(tLayer);
        _42_release(txLayer);
        _42_release(shLayer);
        _42_release(mvLayer);
        _42_release(mnLayer);
        _42_release(touchMovingCursor);
        for( var i=0 ; i<mw.length ; i++) _42_release(mw[i]);
        for( var i=0 ; i<sw.length ; i++) _42_release(sw[i]);
        if( touchMovingLabel ) _42_release(touchMovingLabel,"moving label");
        stopListeners();
        tLayer.unscheduleUpdate();
    };

    var initMenu = function() {
        var menuItems = [],
            addMenuItem = function(text,x,cb) {
                var item = new cc.MenuItemFont(text.label,cb, tLayer);
                item.setFontName(_42_getFontName(res.exo_regular_ttf));
                item.setFontSize(text.size==="big"?$42.TWEET_MENU_BIG_FONT_SIZE:$42.TWEET_MENU_SMALL_FONT_SIZE);
                item.setPosition(cc.p(x,0));
                menuItems.push(item); 
            };

        //////////////////////////////////////////////////////////////////////////
        // Menu function "Save Tweet"
        addMenuItem($42.t.tweet_save,-214,function(sender) {

			var ls = cc.sys.localStorage,
                mw = movableWords,
                sw = selectableWords,
                tt = {
                    movableWords: [],
                    selectableWords : []
                };

            for( var i=0 ; i<mw.length ; i++ ) tt.movableWords.push({word: mw[i].getString()});
            for( var i=0 ; i<sw.length ; i++ ) tt.selectableWords.push(sw[i].getString());
            ls.setItem("tweetTreasure",JSON.stringify(tt));
            
            hide( cc.p(260,-450), exit );

            if( typeof finalCallback === "function" ) finalCallback();
        });

        ////////////////////////////////////////////////////////////////////////
        // Menu function "Change Name"
        addMenuItem($42.webConnected? $42.t.tweet_name : $42.t.tweet_no_internet, 0, function(sender) {
            if( $42.webConnected && !menuTweetConfirm ) {
                if( !menuNamesChoose ) {
                    menuNamesChoose = true;
                    
                    var mw = movableWords,
                        mn = menuNames;
                    for( var i=0 ; i<mw.length ; i++ ) {
                        var label = mw[i].getChildByTag( $42.TWEET_NAMES_ID ),
                            name = mw[i].getString();
                        if( menuNames.indexOf(name) === -1 ) {
                            if( label ) mw[i].removeChild(label);
                        } else {
                            if( !label ) {
                                var size = mw[i].getContentSize();

                                label = cc.LabelTTF.create(name, _42_getFontName(res.shadows_into_light_ttf) , $42.TWEET_TEXT_TEXT_SIZE);
                                label.setPosition(cc.p(size.width/2+4,size.height/2+4));
                                label.setColor($42.TWEET_NAMES_COLOR);
                                label.setOpacity(0);
                                mw[i].addChild(label,0,$42.TWEET_NAMES_ID);
                            }
                            label.runAction(
                                cc.EaseSineIn.create(
                                   cc.fadeIn( $42.TWEET_TEXT_MOVING_TIME )
                                )
                            )
                        }
                    }
                    menuItems[1].setString($42.t.tweet_name_deny.label);
                } else {
                    menuNamesChoose = false;
                    var mw = movableWords;
                    for( var i=0 ; i<mw.length ; i++ ) {
                        var label;
                        if( label = mw[i].getChildByTag( $42.TWEET_NAMES_ID ) ) {
                            label.runAction(
                                cc.EaseSineOut.create(
                                   cc.fadeOut( $42.TWEET_TEXT_MOVING_TIME )
                                )
                            )
                        }
                    }
                    menuItems[1].setString($42.webConnected? $42.t.tweet_name.label : $42.t.tweet_no_internet.label);
                }
            }
        });

        ////////////////////////////////////////////////////////////////////////
        // Menu function "TWEET"
        addMenuItem($42.webConnected? $42.t.tweet_tweet : $42.t.tweet_no_internet, 214, function(sender) {
            if( $42.webConnected && !menuNamesChoose) {
                if( !menuTweetConfirm ) {
                    menuTweetConfirm = true;
                    menuTweetItem.setString($42.t.tweet_tweet_confirm.label);

                    menuTweety = new cc.Sprite(cc.spriteFrameCache.getSpriteFrame("tweety.png"));
                    menuTweety.setPosition($42.TWEET_TWEETY_POS);
                    menuTweety.setOpacity(0);
                    tLayer.addChild(menuTweety,5);
                    menuTweety.runAction(
                        cc.repeatForever(
                            cc.sequence(
                                cc.EaseSineOut.create(
                                    cc.fadeIn(0.5)
                                ),
                                cc.EaseSineIn.create(
                                    cc.fadeTo(0.5,150)
                                )
                            )
                        )
                    );
                    colorWords(true);
                    shLayer.runAction(cc.moveBy(0.5, cc.p(0, -$42.TWEET_SHORTIES_HEIGHT)));
                } else {
                    sendTweet();
                }
            }
        });

        menuNamesItem = menuItems[1];
        menuTweetItem = menuItems[2];

        menu = new cc.Menu(menuItems);
        menu.setPosition(cc.p($42.TWEET_MENU_WIDTH/2,$42.TWEET_MENU_HEIGHT/2));
        mnLayer.addChild(menu);
    };

    var changeMenu = function(internetOn) {

        if( internetOn ) {
            menuNamesItem.setString($42.t.tweet_name.label);
            menuTweetItem.setString($42.t.tweet_tweet.label);
            menuTweetItem.setFontSize($42.TWEET_MENU_BIG_FONT_SIZE);
            $42.webConnected = true;
        } else {
            menuNamesItem.setString($42.t.tweet_no_internet.label);
            menuTweetItem.setString($42.t.tweet_no_internet.label);
            menuTweetItem.setFontSize($42.TWEET_MENU_SMALL_FONT_SIZE);
            $42.webConnected = true;
        }
    }

    var sendTweet = function() {
        var mw = movableWords;

        cc.assert(menuTweetCnt <= mw.length, "menuTweetCnt mustn't be lar ger than movableWords.length.");
        for( var i=0, tweet = ""; i<=menuTweetCnt ; i++ ) tweet += mw[i].getString()+" ";
        cc.assert(tweet.length <= 140 && tweet.length > 0, "I didn't get proper tweet text." ); 
        _42_sendMessage("tweet",{Tweet:tweet}, function(data) {
            cc.sys.localStorage.removeItem("tweetTreasure");
            menuTweetConfirm = false;
            hide( cc.p(-260,750), exit );
            if( typeof finalCallback === "function" ) finalCallback();
        });

        removeTweety();
    }

    var removeTweety = function() {
        if( menuTweety ) {
            menuTweety.runAction(
                cc.sequence(
                    cc.fadeOut(0.5),
                    cc.callFunc(function() {
                        tLayer.removeChild(menuTweety);
                        menuTweety = null;
                    })
                )
            );
        }
    };

    var putWordsIntoTextLayer = function() {
        var wt = $42.tweetTreasure && $42.tweetTreasure.movableWords || $42.wordTreasure,
            padding = $42.TWEET_TEXT_PADDING,
            textWidth = $42.TWEET_TEXT_WIDTH - padding * 2,
            textHeight = $42.TWEET_TEXT_HEIGHT;
        
        movableWords = [];
        for( var i=0,x=0,y=0 ; i<wt.length ; i++ ) {

			var label = cc.LabelTTF.create(wt[i].word, _42_getFontName(res.shadows_into_light_ttf) , $42.TWEET_TEXT_TEXT_SIZE),
                size = label.getContentSize();
            
            if( x + size.width > textWidth ) {
                x = 0;
                y += $42.TWEET_TEXT_LINEHEIGHT;
            }

			label.setPosition(cc.p(padding + x + size.width/2, textHeight - padding - y - size.height/2));
			label.setColor($42.TWEET_TEXT_TEXT_COLOR);
            label.setCascadeOpacityEnabled(true);
			_42_retain(label, "moveable word");	
			txLayer.addChild(label, 5);
            label.runAction(
                cc.repeatForever(
                    cc.sequence(
                        cc.delayTime(Math.random()*84+84),
                        cc.EaseSineIn.create(
                            cc.scaleTo(1,0.9)
                        ),
                        cc.EaseSineOut.create(
                            cc.scaleTo(1,1)
                        )
                    )
                )
            );

            movableWords.push(label);

            x += size.width + $42.TWEET_TEXT_SPACE_WIDTH;
        }

        colorWords();
    };

    putWordsIntoShortiesLayer = function() {
        var sh = $42.tweetTreasure && $42.tweetTreasure.selectableWords || $42.shorties,
            padding = $42.TWEET_TEXT_PADDING;

        ////////////////////////////////////
        // init moving shorties layer
        mvLayer = new cc.LayerColor(cc.color(0,0,0,0), 0, $42.TWEET_SHORTIES_HEIGHT);
        shLayer.addChild(mvLayer);
        mvLayer.setPosition(shortiesXPos, 0);
        mvLayer.setOpacity(0);
        _42_retain(mvLayer, "Tweet shorties moving layer");
        
        selectableWords = [];
        for( var i=0 ; i<sh.length ; i++ ) {

			var label = cc.LabelTTF.create(sh[i], _42_getFontName(res.shadows_into_light_ttf) , $42.TWEET_TEXT_TEXT_SIZE),
                size = label.getContentSize();
            
            label.setColor($42.TWEET_TEXT_TEXT_COLOR);
            selectableWords.push(label);

            mvLayer.addChild(label);
            _42_retain(label, "Shorty");
        }

        distributeShorties();
        shortiesXPos = 0;
    };

    var reorganizeWords = function(index) {
        ///////////////////////////////
        // Reorganize words
        var mw = movableWords,
            padding = $42.TWEET_TEXT_PADDING,
            textWidth = $42.TWEET_TEXT_WIDTH - padding * 2,
            lineHeight = $42.TWEET_TEXT_LINEHEIGHT;
        for( var i=index || 1,formerPos=mw[i-1].getPosition() ; i<mw.length ; i++ ) {
            var formerWidth = mw[i-1].getContentSize().width,
                currentWidth = mw[i].getContentSize().width;

            if( formerPos.x + formerWidth/2 + $42.TWEET_TEXT_SPACE_WIDTH + currentWidth > textWidth ) {
                var newPos = cc.p(padding + currentWidth/2, formerPos.y - lineHeight);
            } else {
                var newPos = cc.p(formerPos.x + formerWidth/2 + $42.TWEET_TEXT_SPACE_WIDTH + currentWidth/2, formerPos.y); 
            }
            
            formerPos = newPos;

            touchMovingLabelTime = new Date().getTime();
            mw[i].runAction(
                cc.sequence(
                    cc.EaseSineIn.create(
                        cc.moveTo($42.TWEET_TEXT_MOVING_TIME,newPos)
                    )
                )
            );
        }
        
        setTimeout(colorWords, $42.TWEET_TEXT_MOVING_TIME*1000+10);
    };

    colorWords = function(tweet) {
        var mw = movableWords;

        for( var i=0,cnt=0 ; i<mw.length ; i++ ) {
            var y = mw[i].getPosition().y;
            cnt += mw[i].getString().length + 1;

            mw[i].setOpacity(cnt<=140? 255: y > $42.TWEET_TEXT_LINEHEIGHT/2 && !tweet? 80:0);

            if( cnt <= 140 ) menuTweetCnt = i;
        }
    };

    distributeShorties = function() {
        var sw = selectableWords,
            padding = $42.TWEET_SHORTIES_PADDING,
            lineHeight = $42.TWEET_SHORTIES_LINEHEIGHT,
            lines = $42.TWEET_SHORTIES_LINES;
       
        ///////////////////////////////
        // Sort shorties
        sw.sort(function(a,b) { return a.getString() < b.getString()? -1:1; });

        ///////////////////////////////
        // Reset x array
        for( var i=0, xPos=[], cxPos=0; i<lines ; i++ ) xPos[i] = $42.TWEET_SHORTIES_SPACE_WIDTH/2;
        for( var i=0, yOffset=lineHeight/2+padding ; i<sw.length ; i++ ) {
            ///////////////////////////////
            // which line is next?
            for( var j=1,l=0 ; j<lines ; j++ ) if( xPos[j] < xPos[l] ) l=j;

            ///////////////////////////////
            // set position and move xPos
            var width = sw[i].getContentSize().width;        
            sw[i].setPosition(cc.p(xPos[l]+width/2,(lines-l-1)*lineHeight + yOffset));
            xPos[l] += width + $42.TWEET_SHORTIES_SPACE_WIDTH;
        }
        //////////////////////////////////////
        // Align center
        for( var i=0,max=0 ; i<lines ; i++ ) tWidth = Math.max(max, xPos[i]) + $42.TWEET_SHORTIES_SPACE_WIDTH/2;  
        for( var i=0 ; i<sw.length ; i++ ) {
            var pos   = sw[i].getPosition(),
                l = Math.round(lines-(pos.y-yOffset)/lineHeight-1),
                offset = (tWidth - xPos[l])/2;
            pos.x +=  offset + padding;

            sw[i].setPosition(pos);
        }

        mvLayer.changeWidth(tWidth);
        shortiesWidth = tWidth;
    };
    
    /////////////////////////////////////////////////////////////////////////////
    // initListeners works on the touch and keyboard inputs
    initListeners = function() {
	
        touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ALL_AT_ONCE,
            onTouchesBegan: function(touches, event) {

                ///////////////////////////////////
                // Get position and time
                var touch = touches[0],
                    loc = touch.getLocation();	            		
                
                touchStartPoint = {
                    x: loc.x,
                    y: loc.y
                };
                touchLastPoint = {
                    x: loc.x,
                    y: loc.y
                };	
                touchStartTime = new Date().getTime();
                
                var initMovingLabel = function(word, pos) { 
                    touchMovingLabel = cc.LabelTTF.create(word.getString(), _42_getFontName(res.shadows_into_light_ttf) , $42.TWEET_TEXT_TEXT_SIZE);
                    touchMovingOffset = {
                        x: pos.x - loc.x,
                        y: pos.y - loc.y
                    }
                    touchMovingLabel.setColor($42.TWEET_TEXT_TEXT_COLOR);
                    touchMovingLabel.setPosition(pos);
                    touchMovingLabel.setOpacity(128);
                    tLayer.addChild(touchMovingLabel,10);
                    _42_retain(touchMovingLabel,"moving label");

                    touchMovingLabel.runAction(cc.scaleTo(0.16,1.8));
                    touchMovingVisible = true;
                };

                var getLabel = function(box, words, layer, cb) {

                    if( cc.rectContainsPoint(box, loc) ) {

                        for( var i=0,found=false ; i<words.length ; i++ ) {
                            var box = words[i].getBoundingBox(),
                                pos = layer.convertToWorldSpace(words[i].getPosition());

                            box = {
                                width: Math.max(box.width, $42.TWEET_SHORTIES_SPACE_WIDTH),
                                height: box.height,
                                x: pos.x - Math.max(box.width, $42.TWEET_SHORTIES_SPACE_WIDTH)/2,
                                y: pos.y - box.height/2
                            };
                            if( cc.rectContainsPoint(box, loc) ) {
                                found = true;
                                break;
                            }
                        }

                        if( found ) {
                            if( typeof cb === "function" ) cb(i, pos, words[i]);
                        } else {
                            if( typeof cb === "function" ) cb(null);
                        }
                    }
                };

                if( menuTweetConfirm ) {
                    if( cc.rectContainsPoint(menuTweety.getBoundingBox(), loc) ) {
                        sendTweet();
                    } else {
                        menuTweetItem.setString($42.t.tweet_tweet.label);
                        menuTweetConfirm = false;
                        removeTweety();
                        colorWords(false);
                        shLayer.runAction(cc.moveBy(0.5, cc.p(0, $42.TWEET_SHORTIES_HEIGHT)));
                    }
                    return;
                };

                if( menuNamesChoose ) {
                    getLabel(txLayer.getBoundingBox(), movableWords, txLayer, function( index, pos, word ) {
                        if( index !== null && word && word.getChildByTag( $42.TWEET_NAMES_ID ) ) {
			                var ls = cc.sys.localStorage,
                                oldName = $42.playerName && $42.playerName.toUpperCase() || "",
                                newName = word.getString(),
                                hash = $42.playerHash || getHash();
                            ///////////////////////////////////////7
                            // Send change message
                            _42_sendMessage("changeName", {OldName: oldName, NewName: newName, Hash: hash}, function(data) {
                                var res = data.Result;

                                if( res === "ok" ) {
                                    var name = movableWords[0];
                                    name.setString(newName[0]+newName.substring(1).toLowerCase()+":");
                                    name.setPositionX($42.TWEET_TEXT_PADDING+name.getContentSize().width/2);
                                    menuNames.splice(menuNames.indexOf(newName),1);
                                    menuNames.splice(0,0,oldName);

                                    $42.playerName = newName[0]+newName.substring(1).toLowerCase();
                                    $42.playerHash = hash;
                                    ls.setItem("playerName",$42.playerName);
                                    ls.setItem("playerHash",hash);

                                    reorganizeWords();

                                    ////////////////////////////
                                    // "press" the menu button of "Change word" to leave selection mode 
                                    menuNamesItem.activate();
                                } else if( res === "duplicate" ) {
                                    menuNames.splice(menuNames.indexOf(name),1);
                                    word.removeChildByTag($42.TWEET_NAMES_ID);
                                    return
                                } 
                            });
                        } 
                    }); 

                    return;
                }

                getLabel(shLayer.getBoundingBox(), selectableWords, mvLayer, function(index, pos, word) { 
                    if( index !== null ) {
                        initMovingLabel(word, pos);
                    }
                    touchShortiesXPos = shortiesXPos;
                });
                getLabel(txLayer.getBoundingBox(), movableWords, txLayer, function(index, pos, word) {
                    if( index !== null && index !== 0 ) {
                        initMovingLabel(word, pos);
                        cc.assert(touchMovingLabel,"I need a moving sprite at this point");
                        touchMovingLabelOrigin = index;
                        touchMovingLabelDestination = index;
                    }    
                });
            },
                
            onTouchesMoved: function(touches, event, pos) {
                
                var touch = touches[0],
                    loc = touch.getLocation(),
                    offset = {
                        x: loc.x - touchStartPoint.x,
                        y: loc.y - touchStartPoint.y
                    };
                
                    touchLastPoint = {
                    x: loc.x,
                    y: loc.y
                };

                if( touchShortiesXPos !== null && Math.abs(offset.x) > Math.abs(offset.y) && Math.abs(offset.x) > 6 && cc.rectContainsPoint(shLayer.getBoundingBox(), loc) ) {
                    /////////////////////////////////////////////////////////////////////////////////
                    // Move shorites bar left and right
                    var rightBorder = $42.TWEET_SHORTIES_WIDTH - shortiesWidth - $42.TWEET_SHORTIES_PADDING;
                    shortiesXPos = touchShortiesXPos + offset.x;
                    if( shortiesXPos > 0 ) {
                        touchRubberBand = Math.sqrt(shortiesXPos)*3;
                        shortiesXPos = 0;
                    } else if( shortiesXPos < rightBorder ) {
                        touchRubberBand = -Math.sqrt(rightBorder-shortiesXPos)*3;
                        shortiesXPos = rightBorder;
                    } else {
                        touchRubberBand = 0;
                    }

                    mvLayer.setPosition(shortiesXPos+touchRubberBand, 0);

                    if( touchMovingVisible && touchMovingLabel ) {
                        touchMovingVisible = false;
                        touchMovingLabel.runAction(cc.fadeOut(0.16));
                    }
                } else if( touchMovingLabel ) {
                    if( !touchMovingVisible ) {
                        touchMovingVisible = true;
                        touchMovingLabel.runAction(cc.fadeIn(0.16));
                    }

                    var newPos = cc.p(loc.x + touchMovingOffset.x, loc.y + touchMovingOffset.y);
                    touchMovingLabel.setPosition(newPos);
                    
                    ///////////////////////////////////////////////////////////////////////////////////
                    // Insert label into text box, if applicable
                    if( cc.rectContainsPoint(txLayer.getBoundingBox(), newPos) ) {
                        var pos = txLayer.convertToNodeSpace(newPos),
                            mw = movableWords;

                        /////////////////////////////
                        // Look which index the word would be
                        for( var i=0 ; i<mw.length ; i++ ) {
                            if( !mw[i] ) debugger; 
                            var wPos = mw[i].getPosition(),
                                distY = Math.abs(pos.y - wPos.y),
                                lineHeight = $42.TWEET_TEXT_LINEHEIGHT;
                            if( distY <= lineHeight/2 && pos.x < wPos.x || pos.y > wPos.y + lineHeight/2) break;
                        }

                        if( i===0 ) i=1; // first word is not movable!
                        
                        /////////////////////////////
                        // Set the cursor
                        var pos = mw[i-1].getPosition(),
                            width = mw[i-1].getContentSize().width,
                            lineBreak = (touchMovingLabel.getPosition().x < $42.TWEET_TEXT_WIDTH/2 && i!==mw.length && Math.round(mw[i].getPosition().y) < Math.round(pos.y)),
                            cPos = {
                                x: lineBreak? $42.TWEET_TEXT_SPACE_WIDTH -5 : pos.x + width/2 + $42.TWEET_TEXT_SPACE_WIDTH/2,
                                y: lineBreak? pos.y - $42.TWEET_TEXT_LINEHEIGHT : pos.y 
                            };

                        touchMovingCursor.setOpacity(255); 
                        touchMovingCursor.setPosition(cPos);

                        touchMovingLabelDestination = i;
                    } else {
                        touchMovingCursor.setOpacity(0);
                        touchMovingLabelDestination = null;
                    }
                }
            },
                
            onTouchesEnded: function(touches, event, pos){

                var touch = touches[0],
                    loc = touch.getLocation();	            		

                if( touchShortiesXPos !== null ) {
                    touchShortiesXPos = null;

                    mvLayer.setPosition(shortiesXPos, 0);
                }

                if( touchMovingLabel ) {
                    var mw = movableWords,
                        dirty = false;
                    
                    if( touchMovingLabelOrigin !== null ) {
                        var label = mw.splice(touchMovingLabelOrigin,1)[0];
                        if( touchMovingLabelOrigin < (touchMovingLabelDestination || 0) ) touchMovingLabelDestination--;

                        txLayer.removeChild(label);
                        _42_release(label);

                        dirty = true;
                    } else if(touchMovingLabelDestination !== null && touchMovingLabel.getString().length > 3 ) {
                        var sw = selectableWords;

                        for( var i=0 ; i<sw.length && sw[i].getString() !== touchMovingLabel.getString() ; i++ );
                        if( i < sw.length ) {
                            var label = sw.splice(i,1)[0];
                            distributeShorties();
                            
                            mvLayer.removeChild(label);
                            _42_release(label);
                        }
                    }
                    
                    if( touchMovingLabelDestination !== null ) {

                        mw.splice(touchMovingLabelDestination,0,touchMovingLabel);
                        tLayer.removeChild(touchMovingLabel);
                        touchMovingLabel.setPosition(txLayer.convertToNodeSpace(touchMovingLabel.getPosition()));
                        txLayer.addChild(touchMovingLabel,5);
                        touchMovingLabel.runAction(
                            cc.EaseSineIn.create(
                                cc.spawn(
                                    cc.fadeIn($42.TWEET_TEXT_MOVING_TIME),
                                    cc.scaleTo($42.TWEET_TEXT_MOVING_TIME,1),
                                    cc.tintTo($42.TWEET_TEXT_MOVING_TIME,0,0,0)
                                )
                            )
                        )

                        dirty = true;
                    } else {

                        if( touchMovingLabelOrigin && touchMovingLabel.getString().length > 3 ) {
                            var sw = selectableWords;

                            tLayer.removeChild(touchMovingLabel);
                            mvLayer.addChild(touchMovingLabel);
                            sw.push(touchMovingLabel);
                            touchMovingLabel.setOpacity(255);
                            touchMovingLabel.setScale(1);
                            touchMovingLabel.setColor($42.TWEET_TEXT_TEXT_COLOR);

                            distributeShorties();

                            shortiesXPos = -Math.min(Math.max(0, touchMovingLabel.getPosition().x - $42.TWEET_SHORTIES_WIDTH/2),shortiesWidth - $42.TWEET_SHORTIES_WIDTH);
                            mvLayer.runAction(cc.moveTo(0.16,cc.p(shortiesXPos, 0)));
                        } else {
                            var label = touchMovingLabel;
                            touchMovingLabel.runAction(
                                cc.sequence(
                                    cc.fadeOut(0.16),
                                    cc.callFunc(function() {
                                        tLayer.removeChild(label);
                                        _42_release(label);
                                    })
                                )
                            );
                        }
                    }

                    if( dirty ) reorganizeWords(Math.min(touchMovingLabelOrigin || touchMovingLabelDestination,touchMovingLabelDestination || touchMovingLabelOrigin));

                    touchMovingLabel = touchMovingLabelOrigin = touchMovingLabelDestination = null;
                    touchMovingCursor.setOpacity(0);
                    touchMovingLabelDestination = null;
                }
            }
        });
            
        cc.eventManager.addListener(touchListener, tLayer);
    }; 

    var stopListeners = function() {
        cc.eventManager.removeListener(touchListener); 
    };
   
    var getHash = function() {
        var hash = "";
        for( var i=0; i<10 ; i++ ) hash += ("000"+Math.floor(Math.random()*(1<<16)).toString(16)).slice(-4);

        cc.assert(hash.length === 40, "Hash should be 40 characters long.");
        return hash;
    }
    
    var updateCnt = 0,
        prevTime = 0;

    var update = function(dt) {
        if( touchShortiesXPos !== null ) {
            touchShortiesSpeed = touchShortiesSpeed*0.8 + (shortiesXPos - touchShortiesLastX)*0.2;
            touchShortiesLastX = shortiesXPos;
        } else if( touchShortiesSpeed ) {
            var rightBorder = $42.TWEET_SHORTIES_WIDTH - shortiesWidth - $42.TWEET_SHORTIES_PADDING;
            
            shortiesXPos += touchShortiesSpeed;

            if( shortiesXPos > 0 ) {
                shortiesXPos = 0;
                touchShortiesSpeed = 0;
            }
            else if( shortiesXPos < rightBorder ) {
                shortiesXPos = rightBorder;
                touchShortiesSpeed = 0;
            } else {
                touchShortiesSpeed *= 0.99;
                if( Math.abs(touchShortiesSpeed) < 0.5 ) touchShortiesSpeed = 0;
            }

            mvLayer.setPosition(shortiesXPos, 0);
        }

        var time = new Date().getTime();

        if( time - $42.TWEET_CONNECTION_CHECK > prevTime ) {
            prevTime = time;
            ack = false;

            //cc.log("Testing connection. Web is "+($42.webConnected?"":"not ")+"connected.");

            if( $42.webConnected === true ) {
                _42_sendMessage("testConnection", {}, function(data) {
                    //cc.log("Connection is good.");
                    ack = true;
                    if( menuNames.length === 0 ) {
                        _42_sendMessage("checkNames", {Names:getNames()}, function(data) {
                            //cc.log("Got names!")
                            menuNames = data.Names;
                            menuNames.sort();
                        });
                    }

                    changeMenu(true);     
                });
                setTimeout(function() {
                    if( ack === false ) {
                        //cc.log("Connection lost.");
                        changeMenu(false);     
                        $42.webConnected = false;
                    }
                },$42.TWEET_CONNECTION_CHECK * 0.9);
            } else {
                _42_webConnect();
            }
        }
    };
};    
