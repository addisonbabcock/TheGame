

public var arrowHeight:float = 10.0;
public var arrowMagnitude: float = 5.0;
public var angleOffset:float = 0;

function Update () {
	
}


function SetArrowTo(source:Vector3, destination:Vector3){
	var s :Vector3= Vector3(source.x, arrowHeight, source.z);
	var d :Vector3= Vector3(destination.x, arrowHeight, destination.z);
	
	var xDist = destination.x - source.x;
	var yDist = destination.z - source.z;
	
	var rawAngle:float = Mathf.Atan2(xDist, yDist)  ;
	var angleDegrees:float = rawAngle * Mathf.Rad2Deg;
	var adjusted:float = angleDegrees + angleOffset;
	
	this.GetComponent(Transform).position = s;
	this.GetComponent(Transform).eulerAngles.y = adjusted;
	this.GetComponent(Transform).localScale = Vector3(1, 1, Vector3.Distance(s, d)/5);
	
	
	 
}

function Kill()
{
	Destroy(gameObject);
}