


var currentTexture:String;
private var render : MeshRenderer;

function Update () {
}

public function Awake(){
	render = this.GetComponentInChildren(MeshRenderer);
}

public function rotateAnimation(pics:Texture2D[], type:String){
	
	if(!pics.length){
		return;
	}
	
	var b:boolean = false;
	
	for(var i:int = 0; i < pics.length; i++){
		var name: String = this.getTextureName(type, i);
		if(this.currentTexture == name){
			var index : int = (i + 1)%pics.length;
			this.currentTexture = this.getTextureName(type, index);
			this.setTexture(pics[index], this.currentTexture);
			b = true;
			
			break;
		}
	}
	
	if(!b){
		this.currentTexture = this.getTextureName(type, 0);
			
		this.setTexture(pics[0], this.currentTexture);
	}
	
	
}

public function sequentialAnimation(pics:Texture2D[], type:String){

	if(!pics.length){
		return;
	}
	var b:boolean;
	var i:int = 0;
	for(i = 0; i < pics.length - 1; i++){
		var name: String = this.getTextureName(type, i);
		if(this.currentTexture == name){
			var index : int = (i + 1);
			this.currentTexture = this.getTextureName(type, index);
			
			this.setTexture(pics[index], this.currentTexture);
			b = true;
			break;
		}
	}
	
	if(!b && this.currentTexture != this.getTextureName(type, pics.length -1)){
		this.currentTexture = this.getTextureName(type, 0);
		this.setTexture(pics[0], this.currentTexture);
	}
}

public function setTexture(pic : Texture2D, name : String) {
	
	render.materials[0].mainTexture = pic;
}

public function getTextureName(type:String, i:int) : String{
	return "_" + type + i;

}
