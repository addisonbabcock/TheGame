var speed : float = 6.0;
var jumpSpeed : float = 8.0;
var gravity : float = 20.0;

var armorMax = 100;
private var armorCurrent = 100;

var steamMax : float = 100;
var steamCurrent : float = 100;

var steamRegenSpeed : float = 1;
var isSteamRegen = false;

private var stop = false;

private var gettingHit = false;
private var hitTimer : float = 0;

private var isAttacking = false;
// 0 if left, 1 if right
private var facing : int = 1;

private var moveDirection : Vector3 = Vector3.zero;

function Update() {

	if(isSteamRegen) steamCurrent += (steamRegenSpeed * Time.deltaTime);
	if(steamCurrent > steamMax) steamCurrent = steamMax;
	
	this.ResolveGetHit();
	if(!stop) this.ResolveAttacking();
	if(!stop) this.ResolveEquipmentOne();
	if(!stop) this.ResolveEquipmentTwo();
	if(!stop) this.ResolveMoving();
	stop = false;
	
}

function ResolveEquipmentOne(){

}

function ResolveEquipmentTwo(){

}

function ResolveMoving(){
	var controller : CharacterController = GetComponent(CharacterController);
	if (controller.isGrounded) {
		moveDirection = Vector3(Input.GetAxis("Horizontal"), 0,
		Input.GetAxis("Vertical"));
		moveDirection = transform.TransformDirection(moveDirection);
		moveDirection *= speed;

		if (Input.GetButton ("Jump")) {
			moveDirection.y = jumpSpeed;
		}
	}


	// Apply gravity
	moveDirection.y -= gravity * Time.deltaTime;
	
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
	// Move the controller
	controller.Move(moveDirection * Time.deltaTime);
}

function ResolveGetHit(){
 if(gettingHit){
 	hitTimer -= Time.deltaTime;
 	if(hitTimer >= 0){
 		gettingHit = false;
 	}
 	stop = true;
 }
}

function ResolveAttacking(){

}

function GetHit(damage : int, knockBack : Vector3){
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
	}
}

function Die(){

}
