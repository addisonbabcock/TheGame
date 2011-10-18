public var numbers : Texture[];
private var redScore = 0;
private var blueScore = 0;

function Update () {
}

function scorePoint(team : int){
	if(team == 0){
		blueScore ++;
		transform.FindChild("ScoreBlue").GetComponent(MeshRenderer).material.mainTexture = numbers[blueScore];
	}
	else{
		redScore ++;
		transform.FindChild("ScoreRed").GetComponent(MeshRenderer).material.mainTexture = numbers[redScore];
	}


}

function reset(){
	redScore = 0;
	blueScore = 0;
	transform.FindChild("ScoreBlue").GetComponent(MeshRenderer).material.mainTexture = numbers[blueScore];
	transform.FindChild("ScoreRed").GetComponent(MeshRenderer).material.mainTexture = numbers[redScore];
}