public enum GAME_STATES {
	MOVE_SELECTION_P1,
	MOVE_SELECTION_P2,
	MOVING_TURN,
	TOUCHDOWN,
	PAUSED
};


public var maxMoveTime:float = 5.0;
public var playersPerTeam:int = 4;
public var gameState: GAME_STATES;

//Moving variables

public var moveTimeRemaining:float = maxMoveTime;
public var testMoving:boolean = false;
public var isStartButtonVisible :boolean = false;

//Menus
public var isMenuVisible: boolean = false;
public var isMenuButtonVisible: boolean = true;
public var pausedState: GAME_STATES;


//Landing variables
public var landingDelay: float = 0.5;
public var landingTimer: float = 0; 
public var catchOnLand:Player = null;

//Frisbee variables
public var frisbeeThrown: boolean = false;
public var frisbeePrototype: Frisbee;
public var activeFrisbee:Frisbee;

//Touchdown variables
public var maxTouchdownTime:float = 2.0;
public var touchdownTimer:float = maxTouchdownTime;
public var lastScored:int = -1;

function Start(){
	gameState = GAME_STATES.MOVE_SELECTION_P1;
} 

function Update () {
	resolveMoving();
	resolveLanding();
	resolveTouchdown();
	setStartButtonVisibility();
}

private function resolveTouchdown(){
	if(gameState == GAME_STATES.TOUCHDOWN){
		touchdownTimer -= Time.deltaTime;
		if(touchdownTimer <= 0){
			this.GetComponent(PlayerHandler).newTeam();
			resetToP1Move(this.GetComponent(PlayerHandler).players[lastScored * 4]);
		}
	}else{
		touchdownTimer = maxTouchdownTime;
	}
}

function endSelection(){
	if(gameState == GAME_STATES.MOVE_SELECTION_P1){
		gameState = GAME_STATES.MOVE_SELECTION_P2;
		
	}else if(gameState == GAME_STATES.MOVE_SELECTION_P2){
		gameState = GAME_STATES.MOVING_TURN;
	}
}


function getGameState() : GAME_STATES{
	return gameState;
}

function setStartButtonVisibility(){
	
	
	
	var team:int;
	if (gameState == GAME_STATES.MOVE_SELECTION_P1) {
		team  = 0;
	} else if (gameState == GAME_STATES.MOVE_SELECTION_P2) {
		team = 1;
	} else {
		setStartButtonVisibility(false);
		return;
	}
	setStartButtonVisibility(this.GetComponent(PlayerHandler).teamAllSet(team));
	return;
}

function setStartButtonVisibility(visible : boolean) {
	var temp :GUITexture = GameObject.Find("GUIElements/Buttons/Ready").GetComponent(GUITexture);
	if(temp != null && temp.enabled != visible){
		//Debug.Log("Setting startButtonVisiblity to " + visible);
		isStartButtonVisible = visible;
		temp.enabled = visible;
	} else if (temp == null) {
		//Debug.LogError("Cannot find start button (try renaming)");
	}
}

function resolveMoving(){
	if(gameState == GAME_STATES.MOVING_TURN && !testMoving){
		moveTimeRemaining -= Time.deltaTime;
		if (moveTimeRemaining < 0){
			moveTimeout();
			
		}
	}else{
		moveTimeRemaining = maxMoveTime;
	}
}

private function resolveLanding(){
	if(landingTimer > 0){
		landingTimer -= Time.deltaTime;
		if(landingTimer <= 0){
			resetToP1Move(catchOnLand);
		}
	}
}

function playerCatch(p: Player):boolean{
	if(!frisbeeThrown){
		return false;
	}
	this.landingTimer = this.landingDelay;
	
	catchOnLand = p;
	
	activeFrisbee.Kill();
	
	frisbeeThrown = false;
	
	return true;
}

function throwFrisbee(destination: Vector3){
	var player = GetComponent(PlayerHandler).getFrisbeePlayer();
	var launchPoint : Vector3 = player.GetComponent(Transform).position;
	launchPoint.z += 5;
	activeFrisbee = Instantiate(frisbeePrototype, launchPoint , transform.rotation);
	
	var m = activeFrisbee.GetComponent(Mover);
	
	m.SetDestination(destination, false, true);

	
	
	if(m.hasDestination){
		player.threwFrisbee = true;
		player.hasFrisbee = false;
		frisbeeThrown = true;
		player.PlayPassSound();

	} else{
		activeFrisbee.Kill();
		activeFrisbee = null;
	}
	

	
	
}

private function moveTimeout(){
	if(landingTimer > 0){
		this.moveTimeRemaining = landingTimer +1.0;
	
	}else if(frisbeeThrown){
		var frisbeePosition : Vector3 = this.activeFrisbee.GetComponent(Transform).position;
		var team :int = this.GetComponent(PlayerHandler).getDefendingTeam();
		giveDroppedFrisbeeTo(this.GetComponent(PlayerHandler).getClosestPlayerTo(frisbeePosition, team));
		
	} else{
		resetToP1Move(this.GetComponent(PlayerHandler).getFrisbeePlayer());
	}
}

private function resetToP1Move(ballCarier:Player){
	this.GetComponent(PlayerHandler).resetAll();
	this.moveTimeRemaining = maxMoveTime;
	this.landingTimer = 0;
	this.frisbeeThrown = false;
	ballCarier.hasFrisbee = true;
	if(ballCarier.tryTouchdown()){
		score(ballCarier.team);
	}else{
	this.gameState = GAME_STATES.MOVE_SELECTION_P1;
	}
	this.setStartButtonVisibility(false);
	
}


public function giveDroppedFrisbeeTo(player :Player){
	if(frisbeeThrown){
		var frisbeePos :Vector3 = this.activeFrisbee.GetComponent(Transform).position;
		
		var loc = Vector3(frisbeePos.x, DetermineY(frisbeePos.y), frisbeePos.z);
		while(player.GetComponent(Mover).isInEastEndZone(loc)){
			loc.x -= 10;
		}
		while(player.GetComponent(Mover).isInWestEndZone(loc)){
			loc.x += 10;
		}
		player.GetComponent(Transform).position = loc;
		activeFrisbee.Kill();
	}
	
	
	
	resetToP1Move(player);
}

public function DetermineY(z:float) :float{
	return 1;
}

function pause() {
    pausedState = gameState;
    gameState = GAME_STATES.PAUSED;

    setMenuVisibility(true);
}

function unPause() {
    gameState = pausedState;

    setMenuVisibility(false);
}

function setMenuVisibility(visible : boolean) {
	var temp = GameObject.Find("GUIElements/Menu").GetComponent(GUITexture);
	if(temp != null && temp.enabled != visible){
		//Debug.Log("Setting startButtonVisiblity to " + visible);
		temp.enabled = visible;
        isMenuVisible = visible;
    }
}


function showRules(rulePage: int) {
    var temp = GameObject.Find("GUIElements/Instructions" + 1).GetComponent(GUITexture);
    if (rulePage == 0) {
        temp.enabled = false;
        temp = GameObject.Find("GUIElements/Instructions" + 2).GetComponent(GUITexture);
        temp.enabled = false;
        return;
    }
    if (rulePage == 1) {
        temp = GameObject.Find("GUIElements/Instructions" + 2).GetComponent(GUITexture);
        temp.enabled = false;
        temp = GameObject.Find("GUIElements/Instructions" + 1).GetComponent(GUITexture);
        temp.enabled = true;
        return;
    }

	temp = GameObject.Find("GUIElements/Instructions" + rulePage).GetComponent(GUITexture);
    temp.enabled = true;
    if (rulePage > 1) {
        temp = GameObject.Find("GUIElements/Instructions" + (rulePage - 1)).GetComponent(GUITexture);
        temp.enabled = false;
    }
    
}

function score(team:int){
	this.GetComponent(Score).scorePoint(team);
	
	this.gameState = GAME_STATES.TOUCHDOWN;
	this.lastScored = team;
}

function showCredits(show : boolean) {
	var temp = GameObject.Find("GUIElements/Credits").GetComponent(GUITexture);
    temp.enabled = show;

}

