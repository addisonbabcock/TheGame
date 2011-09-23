class MyHud extends UDKHUD;

var bool bDrawTraces; //Hold exec console function switch to display debug of trace lines & Paths.
var FontRenderInfo TextRenderInfo; //Font for outputed text to viewport

/******************************************************************
 *
 * TUTORIAL FUNCTION
 *
 * This function will fetch mouse coordinates from the UI
 * Hierarchy in the UIController of the PlayerController
 *
 *
 ******************************************************************/
function Vector2d GetMouseCoordinates()
{
	local Vector2D MousePos;
	local MouseInterfacePlayerInput MouseInterfacePlayerInput;
	
	if (PlayerOwner != None) 
	{
		MouseInterfacePlayerInput = MouseInterfacePlayerInput(PlayerOwner.PlayerInput); 

		if (MouseInterfacePlayerInput != None)
		{
			MousePos.X = MouseInterfacePlayerInput.MousePosition.X;
			MousePos.Y = MouseInterfacePlayerInput.MousePosition.Y;
		}
	}
	return MousePos;
}


/******************************************************************
 *
 * PostRender event
 *
 * Use postRender function to define and call all hud drawing
 * routine.
 *
 *
 ******************************************************************/
event PostRender()
{
        local IsometricCamera PlayerCam;
        local IsometricGamePlayerController IsoPlayerController;

        super.PostRender();

        //Get a type casted reference to our custom player controller.
        IsoPlayerController = IsometricGamePlayerController(PlayerOwner);

        //Get the mouse coordinates from the GameUISceneClient
        IsoPlayerController.PlayerMouse = GetMouseCoordinates();
        //Deproject the 2d mouse coordinate into 3d world. Store the MousePosWorldLocation and normal (direction).
        Canvas.DeProject(IsoPlayerController.PlayerMouse, IsoPlayerController.MousePosWorldLocation, IsoPlayerController.MousePosWorldNormal);

        //Get a type casted reference to our custom camera.
        PlayerCam = IsometricCamera(IsoPlayerController.PlayerCamera);

        //Calculate a trace from Player camera + 100 up(z) in direction of deprojected MousePosWorldNormal (the direction of the mouse).
        //-----------------
        //Set the ray direction as the mouseWorldnormal
        IsoPlayerController.RayDir = IsoPlayerController.MousePosWorldNormal;
        //Start the trace at the player camera (isometric) + 100 unit z and a little offset in front of the camera (direction *10)
        IsoPlayerController.StartTrace = (PlayerCam.ViewTarget.POV.Location + vect(0,0,100)) + IsoPlayerController.RayDir * 10;
        //End this ray at start + the direction multiplied by given distance (5000 unit is far enough generally)
        IsoPlayerController.EndTrace = IsoPlayerController.StartTrace + IsoPlayerController.RayDir * 5000;

        //Trace MouseHitWorldLocation each frame to world location (here you can get from the trace the actors that are hit by the trace, for the sake of this
        //simple tutorial, we do noting with the result, but if you would filter clicks only on terrain, or if the player clicks on an npc, you would want to inspect
        //the object hit in the StartFire function
        IsoPlayerController.TraceActor = Trace(IsoPlayerController.MouseHitWorldLocation, IsoPlayerController.MouseHitWorldNormal, IsoPlayerController.EndTrace, IsoPlayerController.StartTrace, true);

        //Calculate the pawn eye location for debug ray and for checking obstacles on click.
        IsoPlayerController.PawnEyeLocation = Pawn(PlayerOwner.ViewTarget).Location + Pawn(PlayerOwner.ViewTarget).EyeHeight * vect(0,0,1);

        //Your basic draw hud routine
        DrawHUD();

        if(bDrawTraces)
		{
			//If display is enabled from console, then draw Pathfinding routes and rays.
			super.DrawRoute(Pawn(PlayerOwner.ViewTarget));
			DrawTraceDebugRays();
		}
}

/*******************************************************************
 *  TUTORIAL FUNCTION
 *
 *  Helper trace for you to visually see where collision and tracing
 *  extend to.
 *
 *******************************************************************/
function DrawTraceDebugRays()
{
        local IsometricGamePlayerController IsoPlayerController;
        IsoPlayerController = IsometricGamePlayerController(PlayerOwner);

        //Draw Trace from the camera to the world using
        Draw3DLine(IsoPlayerController.StartTrace, IsoPlayerController.EndTrace, MakeColor(255,128,128,255));

        //Draw eye ray for collision and determine if a clear running is permitted(no obstacles between pawn && destination)
        Draw3DLine(IsoPlayerController.PawnEyeLocation, IsoPlayerController.MouseHitWorldLocation, MakeColor(0,200,255,255));
}

/******************************************************************
 *  TUTORIAL FUNCTION
 *
 *  Declare a new console command to control debug of 3d line
 *  debug drawing. This will also control of showing the paths
 *  the pawn will have available into its calculated routes.
 *
 ******************************************************************/
exec function ToggleIsometricDebug()
{
        bDrawTraces = !bDrawTraces;
        if(bDrawTraces)
        {
                `Log("Showing debug line trace for mouse");
        }
        else
        {
                `Log("Disabling debug line trace for mouse");
        }
}

/**
 * This is the main drawing pump.  It will determine which hud we need to draw (Game or PostGame).  Any drawing that should occur
 * regardless of the game state should go here.
 */
function DrawHUD()
{
        //local Vector Direction;
        local string StringMessage;
		local string StringMousePosition;

        //Display traced actor class under mouse cursor for fun 
        if(IsometricGamePlayerController(PlayerOwner).TraceActor != none)
        {
                StringMessage = "Actor selected:"@IsometricGamePlayerController(PlayerOwner).TraceActor.class;
        }

        // now draw string with GoldColor color defined in defaultproperties. note you can
        // alternatively use MakeColor(R,G,B,A)
        Canvas.DrawColor = MakeColor(255,183,11,255);
        Canvas.SetPos( 250, 10 );
        Canvas.DrawText( StringMessage, false, , , TextRenderInfo );

		StringMousePosition = "Mouse Coords = "@IsometricGamePlayerController(PlayerOwner).MouseCursor.Location;
		Canvas.SetPos (250, 50);
		Canvas.DrawText (StringMousePosition, false, , , TextRenderInfo);
}


DefaultProperties
{
}
