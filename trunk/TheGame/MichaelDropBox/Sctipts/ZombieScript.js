public enum ZOMBIE_STATES{
	IDLE,
	MOVING,
	ATTACKING,
	DEAD,
	STUNNED
};

var state:ZOMBIE_STATES;

var speed : float = 6.0;
var jumpSpeed : float = 8.0;
var gravity : float = 20.0;
var offsetDistance : float = 5;
var zOffset : float = 0;


var armorMax = 100;
var armorCurrent = 100;

var stop = false;

var gettingHit = false;
var hitTimer : float = 0;

var isAttacking = false;
// 0 if left, 1 if right
var facing : int = 1;

var target : Transform;
private var moveDirection : Vector3;
private var moveFinal : Vector3;
private var controller : CharacterController;


	

function Awake(){
	
	zOffset += Random.Range(-3, 3);
	controller = GetComponent(CharacterController);
	
	
}

function Update () {

	this.ResolveGetHit();
	if(!stop) this.ResolveAttacking();
	
	if (controller.isGrounded) {
		moveFinal.y = 0;
	}
	
	if(!stop) this.ResolveMoving();
	this.Move();
	
	stop = false;
	
}

function GetHit(damage : int){

		if(armorCurrent > 0){
			armorCurrent -= damage;
			if(armorCurrent < 0) this.Die();
		}
		if(!gettingHit){
			gettingHit = true;
			hitTimer = 1;
		}
}

function KnockBack(knockBack : Vector3){
	if(!knockBack.Equals(Vector3.zero)){
		moveFinal = knockBack;
	}
	state = ZOMBIE_STATES.STUNNED;
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

function ResolveMoving(){
	
	switch(state){
	
	
	case(ZOMBIE_STATES.MOVING):
	
	
		if (controller.isGrounded) {
			var destination : Vector3 = target.position;
			var moveDirection = destination - this.transform.position;
		
			if(moveDirection.x >= 0){
				destination.x -= offsetDistance;
			}
			else destination.x += offsetDistance;
			destination.z += zOffset;
		
			destination.y = this.transform.position.y;
			moveDirection = destination - this.transform.position;
			moveDirection.Normalize();
			moveDirection = transform.TransformDirection(moveDirection);
			moveDirection *= speed;

			
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
	break;
	}
	moveFinal = moveDirection;
}

function Move(){

	
	
	// Apply gravity
	moveFinal.y -= gravity * Time.deltaTime;
	
	
	
	
	// Move the controller
	controller.Move(moveFinal * Time.deltaTime);

}

function Die(){

}