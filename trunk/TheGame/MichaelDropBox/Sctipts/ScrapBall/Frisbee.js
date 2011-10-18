@script RequireComponent(Mover)



public var travelArc:float = 1.0;
public var isTraveling:boolean = true;
public var imageDisplacement:float = 0;
public var ballAnimations:Texture2D[];

function Update () {
	if(isTraveling){
		
		var pos:Vector3 = GetComponent(Transform).position;
		var source:Vector3 = GetComponent(Mover).source;
		var destination:Vector3 = GetComponent(Mover).destination;
		
		//set the distance to the minimum of the 2 distances
		var distance:float = Vector3.Distance(pos, source);
		var other:float = Vector3.Distance(pos, destination);
		distance = distance < other? distance:other;
		
		//Set the image displacement 
		imageDisplacement = distance * travelArc;
		transform.FindChild("Plane").transform.localPosition.z = imageDisplacement;
	}
	
}

function Kill(){
	Destroy(gameObject);
}