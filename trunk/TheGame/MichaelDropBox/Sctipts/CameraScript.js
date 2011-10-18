public var target : Transform;

private var frozen = false;

function Update () {

	if(!frozen || target != null){
		this.transform.position.x = target.position.x;
	}
}

public function FreezeCamera(){
	frozen = true;
}

public function UnFreezeCamera(){
	frozen = false;
}