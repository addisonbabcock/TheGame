@script RequireComponent(Mover)
@script RequireComponent(Collider)
@script RequireComponent(Animatable)

public enum PLAYER_ANIMATION_STATE {
	HITTING,
	CATCHING,
	LANDING,
	RUNNING,
	STANDING,
	HOLDING,
	PRIMING,
	THROWING,
	STUNNED,
	SCORED
};

public var color:Color = Color.blue;
public var team : int;
public var playerIndex : int;

//Animation state
public var hittingAnimations:Texture2D[];
public var runningAnimations:Texture2D[];
public var landingAnimations:Texture2D[];
public var standingAnimations:Texture2D[];
public var catchingAnimations:Texture2D[];
public var holdingAnimations:Texture2D[];
public var primingAnimations:Texture2D[];
public var throwingAnimations:Texture2D[];
public var stunnedAnimations:Texture2D[];

public var hittingAnimationsR:Texture2D[];
public var runningAnimationsR:Texture2D[];
public var landingAnimationsR:Texture2D[];
public var catchingAnimationsR:Texture2D[];
public var primingAnimationsR:Texture2D[];
public var throwingAnimationsR:Texture2D[];
public var stunnedAnimationsR:Texture2D[];

public var animationRate:float = 0.5;
public var animationTimer: float = animationRate;
public var currentTexture:String;
public var animationState:PLAYER_ANIMATION_STATE = PLAYER_ANIMATION_STATE.STANDING;

//Catch state
public var isCatching:boolean = false;
public var maxCatchTime: float = 0.5;
public var maxMissedCatchTime: float = 0.5;
public var catchTimeRemaining:float = maxCatchTime;
public var missedCatchTimer: float = 0;


//Frisbee state
public var hasFrisbee: boolean = false;
public var caughtFrisbee: boolean = false;
public var threwFrisbee: boolean = false;

//Colliding state
public var isHitting:boolean = false;
public var maxHitTime: float = 1.0;
public var hitTimeRemaining: float = maxHitTime;
public var collidingWith:Player;
public var isStunned:boolean = false;


//Sounds
public var hit : AudioClip;
public var throwPass: AudioClip;
public var catchPass: AudioClip;
private var audioPlayer: AudioSource;

private var render : MeshRenderer;

public var knockBack = 5;

function Start() {
	render = this.GetComponentInChildren(MeshRenderer);
	audioPlayer = this.GetComponent(AudioSource);
	//render.materials[0].SetColor("_Color", color);
}

function Reset(){
	this.GetComponent(Mover).hasDestination = false;
	isCatching = false;
	caughtFrisbee = false;
	missedCatchTimer = 0;
	threwFrisbee = false;
	hitTimeRemaining = maxHitTime;
	collidingWith = null;
	isStunned = false;
	
	
}

public function tryTouchdown():boolean{
	Debug.Log("player " + playerIndex + team + " hasFrisbee = " +hasFrisbee);
	if(hasFrisbee){
		//Debug.Log("CheckingPossession");
		if(team==0){
			//Debug.Log("CheckingTeam");
			if(this.GetComponent(Mover).isInEastEndZone(this.transform.position)){
				Debug.Log("TOUCHDOWN!!!");
				return true;
			}
		}
		else{
			if(this.GetComponent(Mover).isInWestEndZone(this.transform.position)){
				Debug.Log("TOUCHDOWN!!!");
				return true;
			}
		}
	}
	return false;
}

function setPlayerInfo(t:int, p:int) {
	team = t;
	playerIndex = p;
}


function OnTriggerEnter(other: Collider){
	var game : GameState = GameObject.FindGameObjectWithTag("GameState").GetComponent(GameState);
	if(game.gameState != GAME_STATES.MOVING_TURN){
		return;
	}
	if(other.tag == "Ball" && !threwFrisbee){

		isCatching = true;
	
	}else if(other.tag == "Player"&& !isStunned){
		var p = other.GetComponent(Player);
		if(p == null ){return;}
		if (p.team == this.team){
			return;
		} else{
			if(collidingWith == null && !threwFrisbee && !hasFrisbee){
				this.collidingWith = p;
			}
		}	

	}
}

function OnTriggerExit(other: Collider){
	if(other.tag == "Ball"){
		isCatching = false;
	
	}
}

function Attack(target: Player){
	target.Stunned(this);
	audioPlayer.PlayOneShot(hit);
}

function Stunned(attacker: Player){
	if(hasFrisbee){
		GameObject.FindGameObjectWithTag("GameState").GetComponent(GameState).giveDroppedFrisbeeTo(attacker);
		this.hasFrisbee = false;
	}
	var d :Vector3 = attacker.transform.position - this.transform.position;
	d.Normalize();
	d *= -knockBack;
	d += this.transform.position;
	this.GetComponent(Mover).SetDestination(d, false, false);
	this.isStunned = true;
	
}


function Update () {
	handleArrow();
	tryCatch();
	tryHit();
	determineAnimation();
	animate();
	transform.Find("Plane").transform.position.y = -transform.position.z + 20;
}

function handleArrow(){
	
	if(this.GetComponent(Mover).myArrow == null){
		return;
	}
	var state: GAME_STATES = GAME_STATES.MOVE_SELECTION_P1;
	if(this.team == 1){
		state = GAME_STATES.MOVE_SELECTION_P2;
	}
	
	var game : GameState = GameObject.FindGameObjectWithTag("GameState").GetComponent(GameState);
	
	if( game.gameState != GAME_STATES.PAUSED && game.gameState != state){
		//Debug.Log("Killed arrow on " + team + " with state " + game.gameState);
		this.GetComponent(Mover).killArrow();
	}
	
}


private function tryCatch(){
	var game : GameState = GameObject.FindGameObjectWithTag("GameState").GetComponent(GameState);
	if(isCatching && !isStunned && game.gameState == GAME_STATES.MOVING_TURN){
		catchTimeRemaining -= Time.deltaTime;
		if(catchTimeRemaining <= 0){
			isCatching = false;
			audioPlayer.PlayOneShot(catchPass);
			caughtFrisbee = game.playerCatch(this);
			if(!caughtFrisbee){
				this.missedCatchTimer = this.maxMissedCatchTime;
			}
			
		}
	} else{
		catchTimeRemaining = maxCatchTime;
	}
}

private function tryHit(){
	var game : GameState = GameObject.FindGameObjectWithTag("GameState").GetComponent(GameState);
	if(game.gameState != GAME_STATES.MOVING_TURN){
		return;
	}
	if(collidingWith != null){
		if(this.canHit()){
			hitTimeRemaining -= Time.deltaTime;
		}
		if(hitTimeRemaining <= 0){
			
			
			//Debug.LogError("Player hit");
			
			Attack(collidingWith);
			//Hit the other player
			collidingWith = null;
			
		}
	} else{
		hitTimeRemaining = maxHitTime;
	}

}

private function canHit():boolean{
	var game : GameState = GameObject.FindGameObjectWithTag("GameState").GetComponent(GameState);
	return !hasFrisbee  && collidingWith != null&& !threwFrisbee && !isCatching && game.landingTimer <= 0;
}

private function determineAnimation(){
	var game : GameState = GameObject.FindGameObjectWithTag("GameState").GetComponent(GameState);
	var newAnim : PLAYER_ANIMATION_STATE = PLAYER_ANIMATION_STATE.STANDING;
	
	
	if(game.gameState == GAME_STATES.MOVING_TURN){
		
		if(isStunned){
			newAnim = PLAYER_ANIMATION_STATE.STUNNED;
		}else if(threwFrisbee){
			newAnim = PLAYER_ANIMATION_STATE.THROWING;
		}else if(caughtFrisbee || missedCatchTimer > 0){
			newAnim = PLAYER_ANIMATION_STATE.LANDING;
		}else if(isCatching){
			newAnim = PLAYER_ANIMATION_STATE.CATCHING;
		}else if(hasFrisbee){ 
			newAnim = PLAYER_ANIMATION_STATE.PRIMING;
		}else if(canHit()){
			newAnim = PLAYER_ANIMATION_STATE.HITTING;
		}else{
			newAnim = PLAYER_ANIMATION_STATE.RUNNING;
		}
	} else if(game.gameState == GAME_STATES.TOUCHDOWN){
		if(game.lastScored == team){
			if(hasFrisbee){
				newAnim = PLAYER_ANIMATION_STATE.HOLDING;
			}else{
				newAnim = PLAYER_ANIMATION_STATE.SCORED;
			}
			
		}	else{
			newAnim = PLAYER_ANIMATION_STATE.STANDING;
		}
	
	}else if(hasFrisbee){
		newAnim = PLAYER_ANIMATION_STATE.HOLDING;
	}
	
	setAnimationState(newAnim);
}

private function setAnimationState(state : PLAYER_ANIMATION_STATE){
	if(this.animationState != state){
		animationTimer = 0;
	}
	
	animationState = state;
}
private function animate(){
	
	if(missedCatchTimer > 0){
		missedCatchTimer -= Time.deltaTime;
	} else{
		missedCatchTimer = 0;
	}
	
	animationTimer -= Time.deltaTime;
	
	if(animationTimer > 0){
		return;
	}
	animationTimer = animationRate;
	
	
	
	if(this.GetComponent(Mover).destination.x >= this.transform.position.x)
	{
		switch(animationState){
			case(PLAYER_ANIMATION_STATE.HITTING):
				animateHitting();
				break;
			case(PLAYER_ANIMATION_STATE.RUNNING):
				animateRunning();
				break;
			case(PLAYER_ANIMATION_STATE.STANDING):
				animateStanding();
				break;
			case(PLAYER_ANIMATION_STATE.CATCHING):
				animateCatching();
				break;
			case(PLAYER_ANIMATION_STATE.LANDING):
				animateLanding();
				break;
			case(PLAYER_ANIMATION_STATE.HOLDING):
				animateHolding();
				break;
			case(PLAYER_ANIMATION_STATE.PRIMING):
				animatePriming();
				break;
			case(PLAYER_ANIMATION_STATE.THROWING):
				animateThrowing();
				break;
			case(PLAYER_ANIMATION_STATE.STUNNED):
				animateStunned();
				break;
			case(PLAYER_ANIMATION_STATE.SCORED):
				this.GetComponent(Animatable).rotateAnimation(catchingAnimations, "score");
				break;
		}
	}
	else 
	{
		switch(animationState){
			case(PLAYER_ANIMATION_STATE.HITTING):
				animateHittingR();
				break;
			case(PLAYER_ANIMATION_STATE.RUNNING):
				animateRunningR();
				break;
			case(PLAYER_ANIMATION_STATE.STANDING):
				animateStanding();
				break;
			case(PLAYER_ANIMATION_STATE.CATCHING):
				animateCatchingR();
				break;
			case(PLAYER_ANIMATION_STATE.LANDING):
				animateLandingR();
				break;
			case(PLAYER_ANIMATION_STATE.HOLDING):
				animateHolding();
				break;
			case(PLAYER_ANIMATION_STATE.PRIMING):
				animatePrimingR();
				break;
			case(PLAYER_ANIMATION_STATE.THROWING):
				animateThrowingR();
				break;
			case(PLAYER_ANIMATION_STATE.STUNNED):
				animateStunnedR();
				break;
			case(PLAYER_ANIMATION_STATE.SCORED):
				this.GetComponent(Animatable).rotateAnimation(catchingAnimationsR, "score");
				break;
		}
	}
}

//Right Facing Animations
private function animateHitting(){
	this.GetComponent(Animatable).rotateAnimation(hittingAnimations, "hit");
}

private function animateRunning(){
	this.GetComponent(Animatable).rotateAnimation(runningAnimations, "run");
}

private function animateStanding(){
	
	this.GetComponent(Animatable).rotateAnimation(standingAnimations, "stand");
}

private function animateCatching(){
	this.GetComponent(Animatable).sequentialAnimation(catchingAnimations, "catch");
}

private function animateLanding(){
	this.GetComponent(Animatable).sequentialAnimation(landingAnimations, "land");
}

private function animateHolding(){
	this.GetComponent(Animatable).rotateAnimation(holdingAnimations, "hold");
}

private function animatePriming(){
	this.GetComponent(Animatable).sequentialAnimation(primingAnimations, "prime");
}

private function animateThrowing(){
	this.GetComponent(Animatable).sequentialAnimation(throwingAnimations, "throw");
}

private function animateStunned(){
	this.GetComponent(Animatable).rotateAnimation(stunnedAnimations, "stun");
}


//Left Facing Animations
private function animateThrowingR(){
	this.GetComponent(Animatable).sequentialAnimation(throwingAnimationsR, "throw");
}

private function animateHittingR(){
	this.GetComponent(Animatable).rotateAnimation(hittingAnimationsR, "hit");
}

private function animateRunningR(){
	this.GetComponent(Animatable).rotateAnimation(runningAnimationsR, "run");
}

private function animateCatchingR(){
	this.GetComponent(Animatable).sequentialAnimation(catchingAnimationsR, "catch");
}

private function animateLandingR(){
	this.GetComponent(Animatable).sequentialAnimation(landingAnimationsR, "land");
}

private function animatePrimingR(){
	this.GetComponent(Animatable).sequentialAnimation(primingAnimationsR, "prime");
}

private function animateStunnedR(){
	this.GetComponent(Animatable).rotateAnimation(stunnedAnimationsR, "stun");
}
public function setTexture(pic : Texture2D, name : String) {

	render.materials[0].mainTexture = pic;
}

public function getTextureName(type:String, i:int) : String{
	return "_" + type + i;

}

public function kill(){
	Destroy(gameObject);
	if(this.GetComponent(Mover).myArrow != null){
		this.GetComponent(Mover).myArrow.Kill();
	}
}

public function PlayPassSound(){
	audioPlayer.PlayOneShot(catchPass);
}


