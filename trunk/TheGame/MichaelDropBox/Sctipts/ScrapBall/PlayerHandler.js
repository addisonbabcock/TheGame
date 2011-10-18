public var players : Player[];
var team1Prototype : Player;
var team2Prototype : Player;
var teamStartz :float[] = [-42.0, -27.0, -12.0, 3.0];
var team1x :float = -55.0;
var team2x :float = 66.0;
function Start() {
	newTeam();
	players[0].hasFrisbee = true;
}

function newTeam(){
	if (players[0] != null){
		var j : int;
		for(j = 0; j < 8; j++){
			players[j].kill();
		}
	}
	var i : int = 0;
	players = new Player[8];
	
	for(; i < 4; i++){
		var y = 1;
		//this.GetComponent(GameState).DetermineY(teamStartz[i]);
		players[i] = Instantiate(team1Prototype, Vector3(team1x +  (i * 2.75), y, teamStartz[i]), transform.rotation);
		players[i].setPlayerInfo(0,i);
	}
	
	
	for(; i < 8; i++){
		y = 1;
		//this.GetComponent(GameState).DetermineY(teamStartz[i-4]);
		players[i] = Instantiate(team2Prototype, Vector3(team2x - (i * 2.75), y, teamStartz[i-4]), transform.rotation);
		players[i].setPlayerInfo(1,i-4);
	}
	
	this.GetComponent(GameState).gameState = GAME_STATES.MOVE_SELECTION_P1;
}

function Update () {
}


function teamAllSet(team:int){
	var players : Player[] = (team == getAttackingTeam()) ? getRecievers() : getPlayersOn(team);
	
	if(players[0] == null){
		return true;
	}
	
	for(var player:Player in players){
		
		if(player != null && !player.GetComponent(Mover).hasDestination){
			return false;
		}
	}
	
	return true;
}

function getClosestPlayerTo(pos:Vector3, team :int):Player{
	
	var closestPlayer : Player = null;
	var minPlayerDistance : float = 9999999999999999;
	
	for(var player:Player in getPlayersOn(team)){
		
		var playerPos : Vector3 = player.GetComponent(Transform).position;
		var playerPos2 : Vector2 = new Vector2(playerPos.x, playerPos.z);
		var distanceToPlayer : float = Vector2.Distance(Vector2(pos.x, pos.z), playerPos2);
		if (minPlayerDistance > distanceToPlayer) {
			minPlayerDistance = distanceToPlayer;
			closestPlayer = player;
		} else {
			if (closestPlayer != null) {
				Debug.Log("Player: " + closestPlayer.playerIndex + "was closer");
			} else {
				Debug.LogError("Bad error");
			}
		}	
	}
	return closestPlayer;
	
}


//Do not call on defending team.
function getRecievers () : Player[] {
	var recievers:Player[] = new Player[3];
	var i: int = 0;
	
	for(var player : Player in getPlayersOn(getAttackingTeam())){
		if (player == null) {
			continue;
		}
		if(!player.hasFrisbee){
			if (i > 2){

			break;
			}
			

			recievers[i] = player;
			i++;
		}
	}
	return recievers;
}

function getFrisbeePlayer(): Player{
	var teamModifier:int = 4 * getAttackingTeam();
	var i:int;
	for(i = teamModifier; i < teamModifier + 4; i++){
		if(players[i].hasFrisbee){
			return players[i];
		}
	}
	
	return null;
}

function getDefendingTeam():int{
	return (getAttackingTeam() + 1) % 2;
}

function getAttackingTeam():int{
	var i:int;
	for(i = 0; i< players.length; i++){
		if(players[i] != null&&(players[i].hasFrisbee || players[i].threwFrisbee)){
			return i / 4;
		}
	}
	
	
	return -1;
}

function getPlayersOn(team:int): Player[] {
	var p:Player[] = new Player[4];
	
	var i = team *4;
	
	for(;i < team *4 + 4; i++){
		p[i - team *4] = getPlayers()[i]; 
	}
	
	return p;

}

function getPlayers(): Player[] {
	return players;
}

function removeDestinations() {
	for( var player in players) {
		if (player != null) {
			player.GetComponent(Mover).hasDestination = false;
			player.GetComponent(Mover).destination = Vector3(-1,-1,-1);
			player.GetComponent(Mover).source = Vector3(-1,-1,-1);
		}
	}
}

function resetAll(){
	for(var player in players){
		if (player != null){
			player.Reset();
		}
	}
}
