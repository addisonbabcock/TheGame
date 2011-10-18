public var selectedPlayer : Player;
public var maxSelectionDistance: float;

public var readyButtonTopLeft: Vector2 = Vector2(50, 60);
public var readyButtonBottomRight: Vector2 = Vector2(80, 30);

public var menuButtonTopLeft: Vector2 = Vector2(-70, 60);
public var menuButtonBottomRight: Vector2 = Vector2(-45, 30);

public var resumeButtonTopLeft: Vector2 = Vector2(0,0);
public var resumeButtonBottomRight: Vector2 = Vector2(0,0);

public var rulesButtonTopLeft: Vector2 = Vector2(0,0);
public var rulesButtonBottomRight: Vector2 = Vector2(0,0);

public var creditsButtonTopLeft: Vector2 = Vector2(0,0);
public var creditsButtonBottomRight: Vector2 = Vector2(0,0);

public var restartButtonTopLeft: Vector2 = Vector2(0,0);
public var restartButtonBottomRight: Vector2 = Vector2(0,0);

public var rulesNextTopLeft: Vector2 = Vector2(0,0);
public var rulesNextBottomRight: Vector2 = Vector2(0,0);

public var rulesPreviousTopLeft: Vector2 = Vector2(0,0);
public var rulesPreviousBottomRight: Vector2 = Vector2(0,0);

public var overlapDistance : float = 35;

public var touchBeginLock: boolean = false;
public var menuLock: int = 0;

public enum MENU_BUTTONS {
    RESUME,
    RULES,
    CREDITS,
    RESTART,
    NONE,
    RULES_NEXT,
    RULES_PREVIOUS,
    ALL_SCREEN
};

public enum MENU_SCREENS {
    MENU,
    RULES_1,
    RULES_2,
    CREDITS
};

public var currentMenuScreen : MENU_SCREENS = MENU_SCREENS.MENU; 

function Start(){
	maxSelectionDistance = 40;
}

function Update () {
	var gameState : GAME_STATES = GetComponent(GameState).getGameState();
	
	for (var touch : Touch in Input.touches){
		if (touch.phase == TouchPhase.Ended || touch.phase == TouchPhase.Canceled) {
				selectedPlayer = null;
				//Debug.Log("SelectedPlayer set to null, fingerID: " + touch.fingerId);
				touchBeginLock = false;
                if (menuLock > 0) {
                    menuLock -= 1;}
			}
	}
	if(gameState == GAME_STATES.MOVE_SELECTION_P1 || gameState == GAME_STATES.MOVE_SELECTION_P2){
		handleMoveSelectionStates();
	} else if(gameState == GAME_STATES.MOVING_TURN) {
		handleMovingState();
	} else if(gameState == GAME_STATES.PAUSED) {
		handlePauseState();
	}
}

private function handleMoveSelectionStates(){
	for (var touch : Touch in Input.touches) {
		if (touch.fingerId == 0) {
			touchBeginLock = true;
			var ray = Camera.main.ScreenPointToRay(touch.position);
			if (touch.phase == TouchPhase.Began) {
				
				if (GetComponent(GameState).isStartButtonVisible){
					Debug.Log("Touch at " + ray);
					if(isReadyTap(ray.origin)) {
						Debug.Log("READY BUTTON TAPPED");
						GetComponent(GameState).endSelection();
                        return;
					}
				}
                if (GetComponent(GameState).isMenuButtonVisible) {
                    if(isMenuTap(ray.origin)){
						Debug.Log("Menu BUTTON TAPPED");
						GetComponent(GameState).pause();
                        return;
					}
                }
				//Debug.Log("Begining touch 0, selcting player");
				selectPlayer(ray.origin);
			} else if (touch.phase == TouchPhase.Moved && selectedPlayer != null) {
				//Debug.Log("Setting player " + selectedPlayer.playerIndex + " destination to " + ray.origin);
				selectedPlayer.GetComponent(Mover).SetDestination(ray.origin, true);
			} 
		}
	}
}

function isReadyTap(pos : Vector3) {
	Debug.Log("In is ready tap");
	//Debug.Log(pos);
	if (pos.x > readyButtonTopLeft.x     && pos.z < readyButtonTopLeft.y &&
		pos.x < readyButtonBottomRight.x && pos.z > readyButtonBottomRight.y) {
		Debug.Log("RETURN True");
		return true;
		
	} else {
		Debug.Log("RETURN FALSE");
		return false;
	}
}

function handleMovingState(){
	if (touchBeginLock) {
		//Debug.Log("LOCKED!");
		return;
	}
	for (var touch : Touch in Input.touches) {
		if (touch.fingerId == 0 && touch.phase == TouchPhase.Began){
			var game = GetComponent(GameState);
			if (!game.frisbeeThrown) {
				var ray = Camera.main.ScreenPointToRay(touch.position);
				//Debug.Log("Throwing Freezbie to: " + ray.origin);
				game.throwFrisbee(ray.origin);
			}
		}
	}
}

function selectPlayer(touchPosition: Vector3) {
	var closestPlayer : Player = null;
	var playerHandler = GetComponent(PlayerHandler);
	var minPlayerDistance : float = 9999999999999999;
	var recievers : Player[];
	var gameState : GAME_STATES = GetComponent(GameState).getGameState();
	var team :int;
    var closePlayers = new Player[4];
    var numClosePlayers : int = 0;

    for (var p : Player in closePlayers) {
        p = null;
    }

	if(gameState == GAME_STATES.MOVE_SELECTION_P1) {
		team = 0;
	} else if (gameState == GAME_STATES.MOVE_SELECTION_P2) {
		team = 1;
	} else {
		return;
	}
	
		
	recievers = playerHandler.getAttackingTeam() == team ? playerHandler.getRecievers():playerHandler.getPlayersOn(team);
	
	for(var player in recievers) {
		if (player == null) { Debug.LogError("CONTINUED");continue;}
		var playerPos : Vector3 = player.GetComponent(Transform).position;
		var playerPos2 : Vector2 = new Vector2(playerPos.x, playerPos.z);
		//Debug.Log("Touched " + touchPosition + " Player " + player.playerIndex + "Pos: " + playerPos2);
		var distanceToPlayer : float = Vector2.Distance(Vector2(touchPosition.x, touchPosition.z), playerPos2);
		//Debug.Log("Distance to Player: "+ distanceToPlayer);
		if (minPlayerDistance > distanceToPlayer) {
			minPlayerDistance = distanceToPlayer;
			closestPlayer = player;
		} else {
			if (closestPlayer != null) {
				//Debug.Log("Player: " + closestPlayer.playerIndex + " was closer than " + player.playerIndex);
			} else {
				//Debug.Log("WHAT?!?!?! WRONG!!");
			}
		}
        if (overlapDistance > distanceToPlayer) {
            //Debug.Log("Adding player: " + player.playerIndex + " to closePlayers");
            closePlayers[numClosePlayers] = player;
            numClosePlayers += 1;
        }
	}

	if (maxSelectionDistance > minPlayerDistance) {
		selectedPlayer = closestPlayer;
		//Debug.Log("Selected Player number: " + selectedPlayer.playerIndex);
	}
	if(selectedPlayer == null){
		return;
	}
	if (!selectedPlayer.GetComponent(Mover).hasDestination) {
		return;
	}
    for (var p : Player in closePlayers) {
        //Debug.Log("Checking close players");
        if (p != null && !p.GetComponent(Mover).hasDestination) {
            //Debug.Log("Player " + p.playerIndex + " doesn't have a destination, choosing him instead");
            selectedPlayer = p;
            break;
        }
    }

}

function isMenuTap(pos : Vector3) {
	Debug.Log("In is menu tap");
	Debug.Log(pos);
	if (pos.x > menuButtonTopLeft.x     && pos.z < menuButtonTopLeft.y &&
		pos.x < menuButtonBottomRight.x && pos.z > menuButtonBottomRight.y) {
		Debug.Log("RETURN True");
		return true;
		
	} else {
		Debug.Log("RETURN FALSE");
		return false;
	} 
}

function handlePauseState(){
	for (var touch : Touch in Input.touches) {
		if (touch.fingerId == 0) {
            var rayOrigin = Camera.main.ScreenPointToRay(touch.position).origin;
            var touchProjection = Vector2(rayOrigin.x, rayOrigin.z);
            Debug.Log("Touching at: " + touchProjection);

            var pressed = getMenuButtonPressed(touchProjection);
            switch (pressed){
                case MENU_BUTTONS.NONE:
                    Debug.Log("No button pressed");
                    Debug.Log("ON screen: " + currentMenuScreen);
                    return;
                case MENU_BUTTONS.RESUME:
                    Debug.Log("Resume pressed");
                    GetComponent(GameState).unPause();
                    break;
                case MENU_BUTTONS.RULES:
                    Debug.Log("Rules pressed");
                    currentMenuScreen = MENU_SCREENS.RULES_1;
                    GetComponent(GameState).showRules(1);
                    break;
                case MENU_BUTTONS.CREDITS:
                    Debug.Log("Credits pressed");
                    currentMenuScreen = MENU_SCREENS.CREDITS;
                    GetComponent(GameState).showCredits(true);
                    menuLock = 2;
                    break;
                case MENU_BUTTONS.RESTART:
                    Debug.Log("Restart pressed");
                    GetComponent(GameState).unPause();
                    currentMenuScreen = MENU_SCREENS.MENU;
                    var playerHandler = GetComponent(PlayerHandler);
                    playerHandler.newTeam();
                    playerHandler.players[0].hasFrisbee = true;
                    break;
                case MENU_BUTTONS.RULES_NEXT:
                    Debug.Log("IN RULES NEXT");
                    switch (currentMenuScreen) {
                        case MENU_SCREENS.RULES_1:
                            GetComponent(GameState).showRules(2);
                            currentMenuScreen = MENU_SCREENS.RULES_2;
                            menuLock = 2;
                            break;
                        case MENU_SCREENS.RULES_2:
                            if(!menuLock) {
                                GetComponent(GameState).showRules(0);
                                currentMenuScreen = MENU_SCREENS.MENU;
                            }
                            break;
                    }
                    break;
                case MENU_BUTTONS.RULES_PREVIOUS:
                    Debug.Log("IN RULES PREVIOUS");
                    GetComponent(GameState).showRules(1);
                    currentMenuScreen = MENU_SCREENS.RULES_1;
                    break;
                case MENU_BUTTONS.ALL_SCREEN:
                    if (!menuLock) {
                        GetComponent(GameState).showCredits(false);
                        currentMenuScreen = MENU_SCREENS.MENU;
                    }
                    break;
            }

        }
    }
}

function getMenuButtonPressed(position : Vector2) : MENU_BUTTONS {
    switch (currentMenuScreen) {
        case MENU_SCREENS.MENU:
            if (position.x > resumeButtonTopLeft.x     && position.y < resumeButtonTopLeft.y &&
                position.x < resumeButtonBottomRight.x && position.y > resumeButtonBottomRight.y) {
                return MENU_BUTTONS.RESUME;
            } else
            if (position.x > rulesButtonTopLeft.x     && position.y < rulesButtonTopLeft.y &&
                position.x < rulesButtonBottomRight.x && position.y > rulesButtonBottomRight.y) {
                return MENU_BUTTONS.RULES;
            } else
            if (position.x > creditsButtonTopLeft.x     && position.y < creditsButtonTopLeft.y &&
                position.x < creditsButtonBottomRight.x && position.y > creditsButtonBottomRight.y) {
                return MENU_BUTTONS.CREDITS;
            } else
            if (position.x > restartButtonTopLeft.x     && position.y < restartButtonTopLeft.y &&
                position.x < restartButtonBottomRight.x && position.y > restartButtonBottomRight.y) {
                return MENU_BUTTONS.RESTART;
            }
        break;
        case MENU_SCREENS.RULES_1:
            if (position.x > rulesNextTopLeft.x     && position.y < rulesNextTopLeft.y &&
                position.x < rulesNextBottomRight.x && position.y > rulesNextBottomRight.y) {
                return MENU_BUTTONS.RULES_NEXT;
            }
            Debug.Log("NO HIT ON RULES NEXT");
        break;
        case MENU_SCREENS.RULES_2:
            if (position.x > rulesNextTopLeft.x     && position.y < rulesNextTopLeft.y &&
                position.x < rulesNextBottomRight.x && position.y > rulesNextBottomRight.y) {
                return MENU_BUTTONS.RULES_NEXT;
            } else
            if (position.x > rulesPreviousTopLeft.x     && position.y < rulesPreviousTopLeft.y &&
                position.x < rulesPreviousBottomRight.x && position.y > rulesPreviousBottomRight.y) {
                return MENU_BUTTONS.RULES_PREVIOUS;
            }
        break;
        case MENU_SCREENS.CREDITS:
            return MENU_BUTTONS.ALL_SCREEN;
        break;
    }
    return MENU_BUTTONS.NONE;
}

