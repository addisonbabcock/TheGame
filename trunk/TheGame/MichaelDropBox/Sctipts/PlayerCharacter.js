public enum EQUIPMENT {
	IRON_CURTAIN,
	COMPRESSION_SHOT,
	STEAM_CLOUD,
	STEAM_JUMP,
	IRON_FIST,
	EMPTY
};

public enum PLAYER_CHARACTER_ANIMATION_STATE {
	IDLE,
	MOVE,
	DEATH,
	ROLL,
	ATTACK1,
	ATTACK2,
	ATTACK3,
	ATTACK4,
	BLOCK,
	SHOOT,
	GET_HIT,
	JUMP,
	USE_ITEM,
	PUNCH
};

public enum PLAYER_CHARACTER_STATE {
	IDLE,
	MOVE,
	DEATH,
	ROLL,
	ATTACK1,
	ATTACK2,
	ATTACK3,
	ATTACK4,
	BLOCK,
	SHOOT,
	GET_HIT,
	JUMP,
	USE_ITEM,
	PUNCH
};

public var idleAnimations:Texture2D[];
public var moveAnimations:Texture2D[];
public var deathAnimations:Texture2D[];
public var rollAnimations:Texture2D[];
public var attackAnimations1:Texture2D[];
public var attackAnimations2:Texture2D[];
public var attackAnimations3:Texture2D[];
public var attackAnimations4:Texture2D[];
public var blockAnimations:Texture2D[];
public var shootAnimations:Texture2D[];
public var getHitAnimations:Texture2D[];
public var jumpAnimations:Texture2D[];
public var useItemAnimations:Texture2D[];
public var punchAnimations:Texture2D[];

public var idleAnimationsLeft:Texture2D[];
public var moveAnimationsLeft:Texture2D[];
public var deathAnimationsLeft:Texture2D[];
public var rollAnimationsLeft:Texture2D[];
public var attackAnimationsLeft1:Texture2D[];
public var attackAnimationsLeft2:Texture2D[];
public var attackAnimationsLeft3:Texture2D[];
public var attackAnimationsLeft4:Texture2D[];
public var blockAnimationsLeft:Texture2D[];
public var shootAnimationsLeft:Texture2D[];
public var getHitAnimationsLeft:Texture2D[];
public var jumpAnimationsLeft:Texture2D[];
public var useItemAnimationsLeft:Texture2D[];
public var punchAnimationsLeft:Texture2D[];

public var animationRate:float = 0.5;
public var animationTimer: float = animationRate;
public var currentTexture:String;
public var animationState:PLAYER_CHARACTER_ANIMATION_STATE = PLAYER_CHARACTER_ANIMATION_STATE.IDLE;
public var playerState:PLAYER_CHARACTER_STATE = PLAYER_CHARACTER_STATE.IDLE;

var attackPower: float = 10;
var knockbackPower: float = 1;
var comboDelayMax: float = .5;
var comboDelayMin: float = .25;
private var meleeTimer: float;
var comboCount: int = 0;

var compShotToggle = false;
var steamCloudCD : float = 1;
var ironFistCD : float = 1;
var ironCurtainCD : float = 1;
var isAirborn = false;

private var equipOneTimer : float = 0;
private var equipTwoTimer : float = 0;

var equipOne: EQUIPMENT;
var equipTwo: EQUIPMENT;

var speed : float = 6.0;
var jumpSpeed : float = 8.0;
var gravity : float = 20.0;

var armorMax = 100;
var armorCurrent = 100;

var steamMax : float = 100;
var steamCurrent : float = 100;

var steamRegenSpeed : float = 1;
var isSteamRegen = false;

var stop = false;

var blocking = false;
var blockValue : float = .5;

var dodging = false;
var dodgeTimer : float = 0;

var punching = false;

var gettingHit = false;
var hitTimer : float = 0;
   
var isAttacking = false;

// 0 if left, 1 if right
var facing : int = 1;

private var moveDirection : Vector3 = Vector3.zero;
private var controller : CharacterController;

private var audioPlayer: AudioSource;

private var render : MeshRenderer;



function Start() {
	render = this.GetComponentInChildren(MeshRenderer);
	audioPlayer = this.GetComponent(AudioSource);
	controller = GetComponent(CharacterController);
	meleeTimerr = comboDelayMax;
}

function Awake(){
	
}

function Update() {

	if(isSteamRegen) steamCurrent += (steamRegenSpeed * Time.deltaTime);
	if(steamCurrent > steamMax) steamCurrent = steamMax;
	
	this.ResolveGetHit();
	if(!stop && comboCount == 0) this.ResolveBlocking();
	if(!stop) this.ResolveAttacking();
	if(!stop) this.ResolveEquipmentOne();
	if(!stop) this.ResolveEquipmentTwo();
	
	if (!controller.isGrounded) {
		isAirborn = true;
		playerState = PLAYER_CHARACTER_STATE.JUMP;
	}
	if(controller.isGrounded){
		isAirborn = false;
		moveDirection = Vector3.zero;
		if(playerState == PLAYER_CHARACTER_STATE.JUMP){
			playerState = PLAYER_CHARACTER_STATE.IDLE;
		}
	}
	
	if(!stop) this.ResolveMoving();
	
	
	
	this.Move();
	stop = false;
	
	//determineAnimation();
	animate();
	
}

private function animate(){
	
	animationTimer -= Time.deltaTime;
	
	if(animationTimer > 0){
		return;
	}
	animationTimer = animationRate;
	
	
	
	//if(facing == 1)
	//{
		switch(playerState){
			case(PLAYER_CHARACTER_STATE.GET_HIT):
				animateGetHit();
				break;
			case(PLAYER_CHARACTER_STATE.JUMP):
				animateJump();
				break;
			case(PLAYER_CHARACTER_STATE.BLOCK):
				animateBlock();
				break;
			case(PLAYER_CHARACTER_STATE.ROLL):
				animateRoll();
				break;
			case(PLAYER_CHARACTER_STATE.DEATH):
				animateDeath();
				break;
			case(PLAYER_CHARACTER_STATE.IDLE):
				animateIdle();
				break;
			case(PLAYER_CHARACTER_STATE.ATTACK1):
				animateAttack1();
				break;
			case(PLAYER_CHARACTER_STATE.ATTACK2):
				animateAttack2();
				break;
			case(PLAYER_CHARACTER_STATE.ATTACK3):
				animateAttack3();
				break;
			case(PLAYER_CHARACTER_STATE.ATTACK4):
				animateAttack4();
				break;
			case(PLAYER_CHARACTER_STATE.MOVE):
				animateMove();
				break;
		}
	//}
	/*else 
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
	}*/
}

private function animateMove(){
	this.GetComponent(Animatable).rotateAnimation(moveAnimations, "move");
}

private function animateGetHit(){
	this.GetComponent(Animatable).sequentialAnimation(getHitAnimations, "gethit");
}

private function animateBlock(){
	this.GetComponent(Animatable).sequentialAnimation(blockAnimations, "block");
}

private function animateIdle(){
	Debug.Log("idling");
	this.GetComponent(Animatable).rotateAnimation(idleAnimations, "idle");
}

private function animateDeath(){
	this.GetComponent(Animatable).sequentialAnimation(deathAnimations, "death");
}

private function animateRoll(){
	this.GetComponent(Animatable).sequentialAnimation(rollAnimations, "roll");
}

private function animateAttack1(){
	this.GetComponent(Animatable).sequentialAnimation(attackAnimations1, "attack1");
}

private function animateAttack2(){
	this.GetComponent(Animatable).sequentialAnimation(attackAnimations2, "attack2");
}

private function animateAttack3(){
	this.GetComponent(Animatable).sequentialAnimation(attackAnimations3, "attack3");
}

private function animateAttack4(){
	this.GetComponent(Animatable).sequentialAnimation(attackAnimations4, "attack4");
}

private function animateShoot(){
	this.GetComponent(Animatable).sequentialAnimation(shootAnimations, "shoot");
}

private function animateJump(){
	this.GetComponent(Animatable).sequentialAnimation(jumpAnimations, "jump");
}

private function animatePunch(){
	this.GetComponent(Animatable).sequentialAnimation(punchAnimations, "puch");
}

function ResolveEquipmentOne(){

	if(blocking) return;
	
	if(equipOneTimer > 0){
		equipOneTimer -= Time.deltaTime;
		return;
	}
	
	switch(equipOne){
  		case(EQUIPMENT.EMPTY):
			break;
		case(EQUIPMENT.IRON_CURTAIN):
			if(Input.GetKeyUp("q")){
				this.IronCurtain();
			}
			break;
		case(EQUIPMENT.COMPRESSION_SHOT):
			if(Input.GetKeyUp("q")){
				if(compShotToggle == true){
					compShotToggle = false;
				}
				else
				{
					compShotToggle = true;
				}
			}
			break;
		case(EQUIPMENT.STEAM_CLOUD):
			if(Input.GetKeyUp("q")){
				this.SteamCloud();
			}
			break;
		case(EQUIPMENT.STEAM_JUMP):
			var controller : CharacterController = GetComponent(CharacterController);
			if (!controller.isGrounded) {
				isAirborn = true;
			}
			else{
				if(isAirborn){
					this.SteamStomp();
					isAirborn = false;
				}
			}
			break;
		case(EQUIPMENT.IRON_FIST):
			if(Input.GetKeyUp("q")){
				this.IronFist();
			}
			break;
		}	
}

function ResolveEquipmentTwo(){

	if(blocking) return;
	
	if(equipTwoTimer > 0){
		equipTwoTimer -= Time.deltaTime;
		return;
	}
	
	switch(equipTwo){
  		case(EQUIPMENT.EMPTY):
			break;
		case(EQUIPMENT.IRON_CURTAIN):
			if(Input.GetKeyUp("e")){
				this.IronCurtain();
			}
			break;
		case(EQUIPMENT.COMPRESSION_SHOT):
			if(Input.GetKeyUp("e")){
				if(compShotToggle == true){
					compShotToggle = false;
				}
				else
				{
					compShotToggle = true;
				}
			}
			break;
		case(EQUIPMENT.STEAM_CLOUD):
			if(Input.GetKeyUp("e")){
				this.SteamClouud();
			}
			break;
		case(EQUIPMENT.STEAM_JUMP):
			if (!controller.isGrounded) {
				isAirborn = true;
			}
			else{
				if(isAirborn){
					this.SteamStomp();
					isAirborn = false;
				}
			}
			break;
		case(EQUIPMENT.IRON_FIST):
			if(Input.GetKeyUp("e")){
				this.IronFist();
			}
			break;
	}
}

function SteamStomp(){
	Debug.Log("Stomp");
}

function IronFist(){
	Debug.Log("Falcon PUUUUNCHHH!");
}

function SteamCloud(){
	Debug.Log("Who farted?");
}

function IronCurtain(){
	Debug.Log("Tak to the wall");
}

function ResolveBlocking(){
	if(Input.GetKey("left shift")){
		blocking = true;
		playerState = PLAYER_CHARACTER_STATE.BLOCK;
	}
	else blocking = false;
}

function ResolveMoving(){
	
	if (controller.isGrounded) {
		moveDirection = Vector3(Input.GetAxis("Horizontal"), 0,
		Input.GetAxis("Vertical"));
		if(!moveDirection.Equals(Vector3.zero))playerState = PLAYER_CHARACTER_STATE.MOVE;
		moveDirection = transform.TransformDirection(moveDirection);
		moveDirection *= speed;

		if (Input.GetButton ("Jump")) {
			playerState = PLAYER_CHARACTER_STATE.JUMP;
			moveDirection.y = jumpSpeed;
		}
	// Set facing
	if(moveDirection.x < 0){
		if(facing == 1)
		{
			BroadcastMessage ("SwapSides");
		}
		facing = 0;
		}
	else if(moveDirection.x > 0){
		if(facing == 0)
		{
			BroadcastMessage ("SwapSides");
		}
		facing = 1;
		}
	}
}

function Move(){

	// Apply gravity
	moveDirection.y -= gravity * Time.deltaTime;
	
	// Move the controller
	controller.Move(moveDirection * Time.deltaTime);

}

function ResolveGetHit(){
 if(gettingHit){
 	playerState = PLAYER_CHARACTER_STATE.GET_HIT;
 	hitTimer -= Time.deltaTime;
 	if(hitTimer >= 0){
 		gettingHit = false;
 	}
 	stop = true;
 }
}

function ResolveAttacking(){
	
	
	if(meleeTimer <= comboDelayMax)meleeTimer += Time.deltaTime;
	
	
	if(blocking) return;
	var targets = new Array();
	
	if(Input.GetKeyDown("d")){
		if(meleeTimer > comboDelayMin && meleeTimer < comboDelayMax && comboCount < 4){
			comboCount++;
			meleeTimer = 0.0f;
			targets = this.GetComponentInChildren(AttackBubblePlayer).GetTargets();
			var i : int = 0;
			for(i=0;i<targets.length;i++){
				if(comboCount==4){
					
					var kb : Vector3 = targets[i].transform.position - this.transform.position;
					kb.Normalize();
					kb.y = 1;
					kb *= knockbackPower;
					targets[i].SendMessage("KnockBack", kb);
				}
				targets[i].SendMessage("GetHit",attackPower);
			}
			if(comboCount == 2) playerState = PLAYER_CHARACTER_STATE.ATTACK2;
			if(comboCount == 3) playerState = PLAYER_CHARACTER_STATE.ATTACK3;
			if(comboCount == 4) playerState = PLAYER_CHARACTER_STATE.ATTACK4;
		}
		else if(meleeTimer>=comboDelayMax && comboCount==0)
		{
			comboCount++;
			meleeTimer = 0.0f;
			targets = this.GetComponentInChildren(AttackBubblePlayer).GetTargets();
			var j : int = 0;
			for(j=0;j<targets.length;j++){
				targets[j].SendMessage("GetHit",attackPower);
			}
			playerState = PLAYER_CHARACTER_STATE.ATTACK1;
		}
	}
	
	if(meleeTimer >= comboDelayMax){
		comboCount = 0;
		playerState = PLAYER_CHARACTER_STATE.IDLE;	
	}
	if(comboCount != 0) stop = true;
	
	
}

function GetHit(damage : int){
	if(!blocking){
		if(armorCurrent > 0){
			armorCurrent -= damage;
			if(armorCurrent < 0) armorCurrent = 0;
		}
		else{
			this.Die();
		}
		if(!gettingHit){
			gettingHit = true;
			hitTimer = 1;
			playerState = PLAYER_CHARACTER_STATE.GET_HIT;
		}
	}
	else{
		if(armorCurrent > 0){
			armorCurrent -= (blockValue * damage);
			if(armorCurrent < 0) armorCurrent = 0;
		}
	}
	
}

function KnockBack(knockBack : Vector3){
	if(!knockBack.Equals(Vector3.zero) && !blocking){
		moveDirection = knockBack;
		
	}
}

function Die(){

}
