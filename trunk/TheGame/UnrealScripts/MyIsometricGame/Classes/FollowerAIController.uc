class FollowerAIController extends GameAIController;

var()   Vector  TempDest;
var     float   OffsetToHero;

function SetOrders(name NewOrders, Controller OrderGiver)
{
	local Actor DestActor;

	`Log("Received order : "@NewOrders);
	if(NewOrders == 'Follow')
	{
		if(IsInState('ScriptedMove'))
		{
			PopState(true);
		}

		DestActor = OrderGiver.Pawn;
		ScriptedRoute = Route(DestActor);
		ScriptedRouteIndex = 0;
		if (ScriptedRoute.RouteList.length == 0)
		{
			//`warn("Invalid route with empty MoveList for scripted move");
			ScriptedMoveTarget = DestActor;
			PushState('ScriptedMove');
		}
		else
		{
			PushState('ScriptedRouteMove');
		}
	}
}

//Overwrite AIController's ScriptedMove state to make use of the NavigationHandle instead of the old way
state ScriptedMove
{
	function bool FindNavMeshPath()
	{
		// Clear cache and constraints (ignore recycling for the moment)
		NavigationHandle.PathConstraintList = none;
		NavigationHandle.PathGoalList = none;

		// Create constraints
		class'NavMeshPath_Toward'.static.TowardGoal( NavigationHandle,ScriptedMoveTarget );
		class'NavMeshGoal_At'.static.AtActor( NavigationHandle, ScriptedMoveTarget );

		// Find path
		return NavigationHandle.FindPath();
	}

	Begin:
		`log("BEGIN STATE SCRIPTEDMOVE");
		// while we have a valid pawn and move target, and
		// we haven't reached the target yet
		if( FindNavMeshPath() )
		{
			NavigationHandle.SetFinalDestination(ScriptedMoveTarget.Location);
			`log("FindNavMeshPath returned TRUE");
			FlushPersistentDebugLines();
			NavigationHandle.DrawPathCache(,TRUE);

			while( Pawn != None && ScriptedMoveTarget != None && !Pawn.ReachedDestination(ScriptedMoveTarget) )
			{
				if( NavigationHandle.ActorReachable( ScriptedMoveTarget) )
				{
					// then move directly to the actor
					MoveTo( ScriptedMoveTarget.Location,ScriptedFocus, OffsetToHero, true );
				}
				else
				{
					// move to the first node on the path
					if( NavigationHandle.GetNextMoveLocation( TempDest, Pawn.GetCollisionRadius()) )
					{
						// suggest move preparation will return TRUE when the edge's
					    // logic is getting the bot to the edge point
							// FALSE if we should run there ourselves
						if (!NavigationHandle.SuggestMovePreparation( TempDest,self))
						{
							MoveTo( TempDest, ScriptedFocus, OffsetToHero, true );
						}
					}
				}
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

DefaultProperties
{
	OffsetToHero=75;
}

