class IsometricGamePlayerController extends GamePlayerController;

var Vector2D    PlayerMouse;                //Hold calculated mouse position (this is calculated in HUD)

var Vector      MouseHitWorldLocation;      //Hold where the ray casted from the mouse in 3d coordinate intersect with world geometry. We will
//use this information for our movement target when not in pathfinding.

var Vector      MouseHitWorldNormal;        //Hold the normalized vector of world location to get direction to MouseHitWorldLocation (calculated in HUD, not used)
var Vector      MousePosWorldLocation;      //Hold deprojected mouse location in 3d world coordinates. (calculated in HUD, not used)
var Vector      MousePosWorldNormal;        //Hold deprojected mouse location normal. (calculated in HUD, used for camera ray from above)

/*****************************************************************
*  Calculated in Hud after mouse deprojection, uses MousePosWorldNormal as direction vector
*  This is what calculated MouseHitWorldLocation and MouseHitWorldNormal.
*
*  See Hud.PostRender, Mouse deprojection needs Canvas variable.
*
*  **/
var vector      StartTrace;                 //Hold calculated start of ray from camera
var Vector      EndTrace;                   //Hold calculated end of ray from camera to ground
var vector      RayDir;                     //Hold the direction for the ray query.
var Vector      PawnEyeLocation;            //Hold location of pawn eye for rays that query if an obstacle exist to destination to pathfind.
var Actor       TraceActor;                 //If an actor is found under mouse cursor when mouse moves, its going to end up here.

var MeshMouseCursor MouseCursor; //Hold the 3d mouse cursor

var float DeltaTimeAccumulated; //Accumulate time to check for mouse clicks
var bool bLeftMousePressed; //Initialize this function in StartFire and off in StopFire
var bool bRightMousePressed; //Initialize this function in StartFire and off in StopFire
var bool bPawnNearDestination; //This indicates if pawn is within acceptable offset of destination to stop moving.
var float DistanceRemaining; //This is the calculated distance the pawn has left to get to MouseHitWorldLocation.

/*****************************************************************
 *
 *  PATH FINDING
 *
 * The following variables where taken as is from AiController.uc
 *
 */
var Actor       ScriptedMoveTarget;
/** Route from last scripted action; if valid, sets ScriptedMoveTarget with the points along the route */
var Route       ScriptedRoute;
/** if ScriptedRoute is valid, the index of the current point we're moving to */
var int         ScriptedRouteIndex;
/*****************************************************************/

/** Temp Destination for navmesh destination */
var()   Vector  TempDest;
var bool GotToDest;
var Vector  NavigationDestination;
var Vector2D  DistanceCheck;
/*****************************************************************/
var Actor  Target;
var bool  CurrentTargetIsReachable;

var class FollowerPawnClass;
var Pawn        Followers[3];


DefaultProperties
{
	CameraClass=class'IsometricCamera'
	InputClass=class'MouseInterfacePlayerInput'
	FollowerPawnClass=class'MyIsometricGame.FollowerPawn'
}

simulated event PostBeginPlay()
{
	super.PostBeginPlay();
	`Log("I am alive !");
	MouseCursor = Spawn(class'MeshMouseCursor', self, 'marker');
}

/******************************************************************
 *
 *  TUTORIAL FUNCTION
 *
 *  PlayerTick is called once per frame
 *
 ******************************************************************/
event PlayerTick( float DeltaTime )
{
        super.PlayerTick(DeltaTime);

        //Set the location of the 3d marker that moves with the mouse.
        MouseCursor.SetLocation(MouseHitWorldLocation); 

        //We use the right mouse button to move, change it to suit your need !
        if(bRightMousePressed)
        {
                //accumulate the time for knowing how much time the button was pressed.
                DeltaTimeAccumulated += DeltaTime;

                //Update destination so that while holding the mouse down the destination changes
                //with the mouse move.
                SetDestinationPosition(MouseHitWorldLocation);

                //If its not already pushed, push the state that makes the pawn run to destination
                //until mouse is unpressed. Make sure we do it after the allocated time for a single
                //click or else two states could be pushed simultaneously
                if(DeltaTimeAccumulated >= 0.13f)
                {
                        if(!IsInState('MoveMousePressedAndHold'))
                        {
                                `Log("Pushed MoveMousePressedAndHold state");
                                PushState('MoveMousePressedAndHold');
                        }
                        else
                        {
                                //Specify execution of current state, starting from label Begin:, ignoring all events and
                                //keeping our current pushed state MoveMousePressedAndHold. To better understand why this
                                //continually execute each frame from our Begin: label, see
                                //http://udn.epicgames.com/Three/MasteringUnrealScriptStates.html,
                                //11.3 - BASIC STATE TRANSITIONS
                                GotoState('MoveMousePressedAndHold', 'Begin', false, true);
                        }
                }
        }

        //DumpStateStack();
}

exec function NextWeapon()
{
	`Log("MouseScrollUp");
	PlayerCamera.FreeCamDistance += 64;
}

exec function PrevWeapon()
{
	`Log("MouseScrollUp");
	PlayerCamera.FreeCamDistance -= 64;
}

/******************************************************************
 *
 *  TUTORIAL FUNCTION
 *
 *  StartFire is called on mouse pressed, here to calculate a mouse click we
 *  set the timer to 0, then initialize mouseButtons according to function
 *  parameter and set the initial destination of the mouse press. Real
 *  process is in PlayerTick function.
 *
 ******************************************************************/
exec function StartFire(optional byte FireModeNum)
{
        //Pop all states to get pawn in auto moving to mouse target location.
        PopState(true);

        //Set timer
        DeltaTimeAccumulated =0;

        //Set initial location of destination
        SetDestinationPosition(MouseHitWorldLocation);

        //Initialize this to false, so we can at least do one state-frame and evaluate distance again.
        bPawnNearDestination = false;

        //Initialize mouse pressed over time.
        bLeftMousePressed = FireModeNum == 0;
        bRightMousePressed = FireModeNum == 1;

        //comment these if not needed
        if(bLeftMousePressed) `Log("Left Mouse pressed");
        if(bRightMousePressed) `Log("Right Mouse pressed");
}

/******************************************************************
 *
 *  TUTORIAL FUNCTION
 *
 *  StopFire is called on mouse release, here check the time the buttons have
 *  been pressed (this should be enhanced, but it was kept simple for the tutorial).
 *  if DeltaAccumulated < 0.1300 (medium time mouse click) then we calculate it as
 *  a mouse click, else simply stop any state running. EDIT: You must understand only
 *  a single timer has been kept for all mouse button, you should duplicate a timer
 *  for each individual mouse button if you want to support thing like auto-fire while
 *  walking in a direction.
 *
 ******************************************************************/
exec function StopFire(optional byte FireModeNum )
{
        `Log("delta accumulated"@DeltaTimeAccumulated);
        //Un-Initialize mouse pressed over time.
        if(bLeftMousePressed && FireModeNum == 0)
        {
                bLeftMousePressed = false;
                `Log("Left Mouse released");
        }
        if(bRightMousePressed && FireModeNum == 1)
        {
                bRightMousePressed = false;
                `Log("Right Mouse released");
        }

        //If we are not near destination and click occured
        if(!bPawnNearDestination && DeltaTimeAccumulated < 0.13f)
        {
                //Our pawn has been ordered to a single location on mouse release.
                //Simulate a firing bullet. If it would be ok (clear sight) then we can move to and simply ignore pathfinding.
                if(FastTrace(MouseHitWorldLocation, PawnEyeLocation,, true))
                {
                        //Simply move to destination.
                        MovePawnToDestination();
                }
                else
                {
                        //fire up pathfinding
                        ExecutePathFindMove();
                }
        }
        else
        {
                //Stop player from going on in that direction forever. This normally needs to be done
                //after a long mouse held. This will make the player stop its current MoveMousePressedAndHold
                //state.
                PopState();
        }
        //reset accumulated timer for mouse held button
        DeltaTimeAccumulated = 0;
}

/******************************************************************
 *
 *  TUTORIAL FUNCTION
 *
 *  MovePawnToDestination will push a MoveMouseClick state that will make
 *  the pawn go to a single destination with a mouse click and then
 *  stop near the destination.
 *
 ******************************************************************/
function MovePawnToDestination()
{
        local int i;

        `Log("Moving to location without pathfinding!");
        SetDestinationPosition(MouseHitWorldLocation);
        PushState('MoveMouseClick');

        for(i = 0; i < 3; i++)
        {
                FollowerAIController(Followers[i].Controller).SetOrders('Follow', self);
        }
}

/******************************************************************
 *
 *  TUTORIAL STATE (MoveMouseClick)
 *
 *  MoveMouseClick is the state when a mouse button is pressed
 *  once (simple click). Simply go to a set destination.
 *
 *
 ******************************************************************/
state MoveMouseClick
{
        event PoppedState()
        {
                `Log("MoveMouseClick state popped, disabling StopLingering timer.");
                //Disable all active timers to stop lingering if they are active.
                if(IsTimerActive(nameof(StopLingering)))
                {
                        ClearTimer(nameof(StopLingering));
                }
        }

        event PushedState()
        {
                //Set a function timer. If the pawn is stuck it will stop moving
                //by itself.
                SetTimer(3, false, nameof(StopLingering));
                if (Pawn != None)
                {
                        // make sure the pawn physics are initialized
                        Pawn.SetMovementPhysics();
                }
        }

Begin:
        while(!bPawnNearDestination)
        {
                `Log("Simple Move in progress");
                MoveTo(GetDestinationPosition());
        }
        `Log("MoveMouseClick: Pawn is near destination, go out of this state");
        PopState();
}

/******************************************************************
 *
 *  TUTORIAL FUNCTION
 *
 *  This is a timer function, it prevents the MoveMouseClick state from
 *  looking to get stuck in an obstacle. After a set of seconds it
 *  pushes the entire state stack so the pawn revert to PlayerMove
 *  automatic state.
 *
 ******************************************************************/
function StopLingering()
{
        //Remove all current move state and query for input from now on.
        `Log("Stopped lingering...");
        PopState(true);
}

/******************************************************************
 *
 *  TUTORIAL FUNCTION
 *
 *  PlayerMove is called each frame, we declare it here inside the
 *  PlayerController so its general to all states. It can be possible
 *  to declare this function in each single state, having multiple
 *  PlayerMove scenario, but for the simplicity of the tutorial
 *  we have put it here in the class. It controls the player in that
 *  it does a distance check when moving. It calculates the remaining
 *  distance to the target. If target is within 2D(X,Y) offset, then
 *  set the var bPawnNearDestination for state control.
 *
 *  Rotation
 *
 *  This function overrides the controller rotation of the pawn. Depending
 *  on the situation (state) the pawn will either face a direction or rotate
 *  to face the destination.
 *
 ******************************************************************/
function PlayerMove(float DeltaTime)
{
        local Vector PawnXYLocation;
        local Vector DestinationXYLocation;
        local Vector    Destination;
        local Vector2D  DistanceCheck;          

        super.PlayerMove(DeltaTime);

        //Get player destination for a check on distance left. (calculate distance)
        Destination = GetDestinationPosition();
        DistanceCheck.X = Destination.X - Pawn.Location.X;
        DistanceCheck.Y = Destination.Y - Pawn.Location.Y;
        DistanceRemaining = Sqrt((DistanceCheck.X*DistanceCheck.X) + (DistanceCheck.Y*DistanceCheck.Y));

        //`Log("DistanceCheck is"@DistanceCheck.X@DistanceCheck.Y);
        //`Log("Distance remaining"@DistanceRemaining);

        bPawnNearDestination = DistanceRemaining < 15.0f;
        `Log("Has pawn come near destination ?"@bPawnNearDestination);

        PawnXYLocation.X = Pawn.Location.X;
        PawnXYLocation.Y = Pawn.Location.Y;

        DestinationXYLocation.X = GetDestinationPosition().X;
        DestinationXYLocation.Y = GetDestinationPosition().Y;

        Pawn.SetRotation(Rotator(DestinationXYLocation - PawnXYLocation));
}

function UpdateRotation( float DeltaTime )
{
        /** This as been intentionnaly overriden and left blank for tutorial (see parent class to see what it does to controller) **/
}

function ProcessViewRotation( float DeltaTime, out Rotator out_ViewRotation, Rotator DeltaRot )
{
        /** This as been intentionnaly overriden and left blank for tutorial (see parent class to see what it does to controller) **/
}

/******************************************************************
 *
 *  TUTORIAL STATE (MoveMousePressedAndHold)
 *
 *  MoveMousePressedAndHold is the state when a mouse button is pressed
 *  and kept to move the pawn freely.
 *
 *
 ******************************************************************/
state MoveMousePressedAndHold
{
Begin:
        if(!bPawnNearDestination)
        {
                `Log("MoveMousePressedAndHold at pos"@GetDestinationPosition());
                MoveTo(GetDestinationPosition());
        }
        else
        {
                PopState();
        }
}

/******************************************************************
 *
 *  TUTORIAL FUNCTION
 *
 *  ExecutePathFindMove makes the call to the FindPathTo so that a list
 *  of possible PathNodes will be cached in RouteCache.
 *
 ******************************************************************/
function ExecutePathFindMove()
{
	ScriptedMoveTarget = FindPathTo(GetDestinationPosition());
	`Log("Route length is"@RouteCache.Length);
	if( RouteCache.Length > 0 )
	{
		`Log("Launching PathFind");
		PushState('PathFind');
	}
	else
	{
		//Lets find path with navmesh
		`Log("Launching PathFind with navmesh");
		PushState('NavMeshSeeking');
	}
}

/******************************************************************
 *
 *  TUTORIAL STATE (PathFind)
 *
 *  This is almost the same if not identical to AiController
 *  ScriptedRouteMove. For each route in the RouteCache (initialized
 *  with a call to FindPathTo(destVector), push a state that will
 *  make the pawn goto a location determined by a PathNode location.
 *  You will need to have multiple PathNodes on your map for this to
 *  work properly. This does not use NavigationMeshes, only Linked
 *  PathNodes. PathNodes are manually placed. NavigationMeshes uses
 *  Pylons and other type of actors, so the two systems are different.
 *
 ******************************************************************/
state PathFind
{
Begin:
        if( RouteCache.Length > 0 )
        {
                //for each route in routecache push a ScriptedMove state.
                ScriptedRouteIndex = 0;
                while (Pawn != None && ScriptedRouteIndex < RouteCache.length && ScriptedRouteIndex >= 0)
                {
                        //Get the next route (PathNode actor) as next MoveTarget.
                        ScriptedMoveTarget = RouteCache[ScriptedRouteIndex];
                        if (ScriptedMoveTarget != None)
                        {
                                `Log("ScriptedRoute is launching ScriptedMove index:"@ScriptedRouteIndex);
                                PushState('ScriptedMove');
                        }
                        else
                        {
                                `Log("ScriptedMoveTarget is invalid for index:"@ScriptedRouteIndex);
                        }
                        ScriptedRouteIndex++;
                }
                PopState();
        }
}

/******************************************************************
 *
 *  TUTORIAL STATE (ScriptedMove)
 *
 *  This is the state that is put on the state stack for each PathNode
 *  found when pathfinding. So if you click on a destination and it has
 *  3 PathNode on its route, this state will be stacked 3 times for
 *  moving to a destination. The destination actor represented
 *  by ScriptedMoveTarget is the PathNode.
 *
 ******************************************************************/
state ScriptedMove
{
Begin:
        while(ScriptedMoveTarget != none && Pawn != none && !Pawn.ReachedDestination(ScriptedMoveTarget))
        {
                // check to see if it is directly reachable
                if (ActorReachable(ScriptedMoveTarget))
                {
                        // then move directly to the actor
                        MoveToward(ScriptedMoveTarget, ScriptedMoveTarget);
                        SetDestinationPosition(ScriptedMoveTarget.Location);
                }
                else
                {
                        // attempt to find a path to the target
                        MoveTarget = FindPathToward(ScriptedMoveTarget);
                        if (MoveTarget != None)
                        {
                                // move to the first node on the path
                                MoveToward(MoveTarget, MoveTarget);
                                SetDestinationPosition(MoveTarget.Location);
                        }
                        else
                        {
                                // abort the move
                                `warn("Failed to find path to"@ScriptedMoveTarget);
                                ScriptedMoveTarget = None;
                        }
                }
        }
        PopState();
}

/////////////// NAVMESH PATHFINDING ///////////////

//Overwrite AIController's ScriptedMove state to make use of the NavigationHandle instead of the old way
state NavMeshSeeking
{
        function bool FindNavMeshPath()
        {
                // Clear cache and constraints (ignore recycling for the moment)
                NavigationHandle.PathConstraintList = none;
                NavigationHandle.PathGoalList = none;

                // Create constraints
                class'NavMeshPath_Toward'.static.TowardPoint( NavigationHandle, NavigationDestination );
                class'NavMeshGoal_At'.static.AtLocation( NavigationHandle, NavigationDestination, 50, );

                // Find path
                return NavigationHandle.FindPath();
        }

        Begin:
                `log("BEGIN STATE SCRIPTEDMOVE");
                // while we have a valid pawn and move target, and
                // we haven't reached the target yet
                NavigationDestination = GetDestinationPosition();

                if( FindNavMeshPath() )
                {
                        NavigationHandle.SetFinalDestination(NavigationDestination);
                        `log("FindNavMeshPath returned TRUE");
                        FlushPersistentDebugLines();
                        NavigationHandle.DrawPathCache(,TRUE);

                        //!Pawn.ReachedPoint here, i do not know how to handle second param, this makes the pawn
                        //stop at the first navmesh patch
                        `Log("GetDestinationPosition before navigation (destination)"@NavigationDestination);
                        while( Pawn != None && !Pawn.ReachedPoint(NavigationDestination, None) )
                        {
                                if( NavigationHandle.PointReachable( NavigationDestination ) )
                                {
                                        // then move directly to the actor
                                        MoveTo( NavigationDestination, None, , true );
                                        `Log("Point is reachable");
                                }
                                else
                                {
                                        `Log("Point is not reachable");
                                        // move to the first node on the path
                                        if( NavigationHandle.GetNextMoveLocation( TempDest, Pawn.GetCollisionRadius()) )
                                        {
                                                `Log("Got next move location in TempDest " @ TempDest);
                                                // suggest move preparation will return TRUE when the edge's
                                            // logic is getting the bot to the edge point
                                                        // FALSE if we should run there ourselves
                                                if (!NavigationHandle.SuggestMovePreparation( TempDest,self))
                                                {
                                                        `Log("SuggestMovePreparation in TempDest " @ TempDest);
                                                        MoveTo( TempDest, None, , true );
                                                }
                                        }
                                }
                                DistanceCheck.X = NavigationDestination.X - Pawn.Location.X;
                                DistanceCheck.Y = NavigationDestination.Y - Pawn.Location.Y;
                                DistanceRemaining = Sqrt((DistanceCheck.X*DistanceCheck.X) + (DistanceCheck.Y*DistanceCheck.Y));
                                `Log("distance from pawn"@Pawn.Location@" to location "@ NavigationDestination@" is "@DistanceRemaining );
                                `Log("Is pawn valid ?" @Pawn);
                                GotToDest = Pawn.ReachedPoint(NavigationDestination, None);
                                `Log("Has pawn reached point ?"@GotToDest);

                                if( DistanceRemaining < 15) break;
                        }
                }
                else
                {
                        //give up because the nav mesh failed to find a path
                        `warn("FindNavMeshPath failed to find a path to"@ScriptedMoveTarget);
                        ScriptedMoveTarget = None;
                }   

        `log("POPPING STATE!");
        Pawn.ZeroMovementVariables();
        // return to the previous state
        PopState();
}

function PlayerSpawned(NavigationPoint StartLocation)
{
	`Log("Follower is alive");
	Followers[0] = Spawn(class'FollowerPawn',,, StartLocation.Location - vect(100,100,0), StartLocation.Rotation);
	Followers[1] = Spawn(class'FollowerPawn',,, StartLocation.Location - vect(200,100,0), StartLocation.Rotation);
	Followers[2] = Spawn(class'FollowerPawn',,, StartLocation.Location - vect(100,200,0), StartLocation.Rotation);
}

