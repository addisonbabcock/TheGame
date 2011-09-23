class IsometricGameInfo extends GameInfo;

/**
 * Returns a pawn of the default pawn class
 *
 * @param       NewPlayer - Controller for whom this pawn is spawned
 * @param       StartSpot - PlayerStart at which to spawn pawn
 *
 * @return      pawn
 */
function Pawn SpawnDefaultPawnFor(Controller NewPlayer, NavigationPoint StartSpot)
{
        local Pawn ResultPawn;

        ResultPawn = super.SpawnDefaultPawnFor(NewPlayer, StartSpot);

        `Log("Spawn Info stuff");

        if(ResultPawn != none)
        {
                IsometricGamePlayerController(NewPlayer).PlayerSpawned(StartSpot);
        }

        return ResultPawn;
}

DefaultProperties
{
	bDelayedStart=false
	PlayerControllerClass=class'MyIsometricGame.IsometricGamePlayerController'
	DefaultPawnClass=class'MyPawn'
	HUDType=class'MyHud'
}
