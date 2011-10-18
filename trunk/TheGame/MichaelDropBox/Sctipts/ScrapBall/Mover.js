@script RequireComponent(Transform)

public var arrowPrototype: Arrow;
public var destination:Vector3 ;
public var hasDestination:boolean = false;
public var source:Vector3;
public var myArrow:Arrow;
public var myConstantSpeed = 35;
public var maxRange = 25;

public var speed:float = 0;
public var isOutSafe = false;

function Update () {
	
	if(this.isMoveTurn()){
		if(hasDestination ){
			var myPosition : Vector3 = GetComponent(Transform).position;
			var dist:float =  speed * Time.deltaTime;
			var dest = Vector3.MoveTowards(myPosition, destination, dist);
			if(isOnField(dest)){
				GetComponent(Transform).position = dest; 
			}
		}
	}
}

// Resets this character following an active round
function Reset(){
	hasDestination = false;

}


// Sets the destination of this character for the next round.
function SetDestination(d : Vector3, arrowToggled : boolean, constantSpeed : boolean){
	var gameState :GameState = GameObject.FindGameObjectWithTag("GameState").GetComponent(GameState);
	var myPosition : Vector3 = GetComponent(Transform).position;
	this.source = myPosition;
	
	if((isOnField(d) || this.isOutSafe)&&isInRange(d,source)){
		this.destination = d;
		destination.y = 1;
		//gameState.DetermineY(source.z);
	
		if (constantSpeed) {
			this.speed = myConstantSpeed;
		} 
		else {
			this.speed = Vector3.Distance(myPosition, this.destination)/getMoveTimeRemaining();
		}
	
		this.hasDestination = true;
	
		if(arrowToggled){
			if(myArrow == null){
				myArrow = arrowPrototype.Instantiate(arrowPrototype);
		
			}
			myArrow.SetArrowTo(source, destination);
			myArrow.GetComponent(Renderer).material.color = Color.green;
		}
	}
	else
	{
		if(arrowToggled){
			if(myArrow == null){
				myArrow = arrowPrototype.Instantiate(arrowPrototype);
		
			}
			myArrow.SetArrowTo(source, d);
			this.Reset();
			myArrow.GetComponent(Renderer).material.color = Color.red;
		}
	}
	
}

function isInRange(d : Vector3 , s : Vector3 ): boolean{
	d.y = 0;
	s.y = 0;
	var range: Vector3 = d-s;
	if(range.magnitude > maxRange){
		Debug.Log("Out of Range");
		return false;
		
	}
	return true;
}

function killArrow(){
	if(this.myArrow != null){
		myArrow.Kill();
		myArrow = null;
	}
}

function isOnField(d: Vector3): boolean{
	var xOffset = ((16.5 * (-1 * (d.z - 15))) / 60);
	if(d.x > -50.5 - xOffset && d.x < 50.5 + xOffset && d.z > -45 && d.z < 15){
		//Debug.Log("in field");
		return true;
	}
	return false;
}

function isInWestEndZone(loc:Vector3):boolean{
	var outsideOffset = ((16.5 * (-1 * (loc.z - 15))) / 60);
	var insideOffset = ((12.5 * (-1 * (loc.z - 15))) / 60);
	var rightBound:float = -38 - insideOffset;
	var leftBound :float= -50.5 - outsideOffset;
	if(loc.x >  leftBound && loc.x < rightBound){
		return true;
	}
	return false;
}

function isInEastEndZone(loc:Vector3):boolean{
	var outsideOffset = ((16.5 * (-1 * (loc.z - 15))) / 60);
	var insideOffset = ((12.5 * (-1 * (loc.z - 15))) / 60);
	var rightBound:float = 50.5 + outsideOffset ;
	var leftBound :float= 38 + insideOffset;
	Debug.Log("first = " + (loc.x > leftBound) + " second = " + (loc.x < rightBound) + " left bound is " + leftBound + " rightbound is " + rightBound);
	if(loc.x < rightBound && loc.x > leftBound){
		return true;
	}
	return false;
}


function SetDestination(d : Vector3, arrowToggled : boolean) {
	SetDestination(d, arrowToggled, false);
}


private function isMoveTurn():boolean{

	var  state :GameState= GameObject.FindWithTag("GameState").GetComponent(GameState);
	var  s :GAME_STATES= state.getGameState();
	if(s == GAME_STATES.MOVING_TURN){
		return true;
	}
	return false;
}

private function getMoveTimeRemaining(){
	var  state :GameState= GameObject.FindWithTag("GameState").GetComponent(GameState);
	return state.moveTimeRemaining;
}
