@script RequireComponent(Mover)

var pressed = 0;

function Update () {
	if (pressed == 0){
		
		if(Input.GetKey(KeyCode.LeftShift)){
			GetComponent(Mover).SetDestination(Vector3(0, 0, 25), true);
			pressed = 1;
			Debug.Log("shift pressed");
		
		}
		
		
	} 
}