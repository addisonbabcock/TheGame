public var offset = 2.5;
public var targets = new Array ();


function Awake(){

	

}

function OnTriggerEnter(other : Collider){

	if(other.tag.Equals("Player")){
		targets.Add(other);
		Debug.Log("Zombie Targets" + targets.length);
	}
	

}

function OnTriggerExit(other : Collider){
	
	var i : int = 0;
	for(i = 0; i < targets.length; i++){
		if(targets[i].Equals(other)){
			targets.RemoveAt(i);
			i = targets.length;
		}
	}
	Debug.Log("Zombie Targets" + targets.length);

}

function SwapSides(){

	offset *= -1;
	collider.center.x = offset;

}