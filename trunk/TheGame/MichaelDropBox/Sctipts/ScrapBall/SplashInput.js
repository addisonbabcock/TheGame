public var previousTopLeft: Vector2 = Vector2(0,0);
public var previousBottomRight: Vector2 = Vector2(0,0);

public var instructionsPreviousTopLeft: Vector2 = Vector2(0,0);
public var instructionsPreviousBottomright: Vector2 = Vector2(0,0);

public var instructionsNextTopLeft: Vector2 = Vector2(0,0);
public var instructionsNextBottomright: Vector2 = Vector2(0,0);


public enum HOME_BUTTONS {
    NONE,
    TAP_TO_START,
    INSTRUCTION_PREVIOUS,
    INSTRUCTION_NEXT
};

public enum HOME_SCREENS {
    HOME,
    INSTRUCTIONS_1,
    INSTRUCTIONS_2
};

public var screen_shown : HOME_SCREENS = HOME_SCREENS.HOME;

function Update() {
    for (var touch : Touch in Input.touches) {
        if (touch.phase == TouchPhase.Began) {
            if (touch.fingerId == 0) {
                handleButtonPress(touch.position);
            }
        }
    }
}

function handleButtonPress(tPos : Vector2) {
    var rayOrigin = Camera.main.ScreenPointToRay(tPos).origin;
    var touchProjection = Vector2(rayOrigin.x, rayOrigin.z);
    Debug.Log("Touching at: " + touchProjection);

    var pressed = getButtonPressed(touchProjection);

    switch (pressed) {
        case HOME_BUTTONS.NONE:
            break;
        case HOME_BUTTONS.TAP_TO_START:
            //go to instructions1
            screen_shown = HOME_SCREENS.INSTRUCTIONS_1;
            Debug.Log("pass");
            break;
        case HOME_BUTTONS.INSTRUCTION_PREVIOUS:
            screen_shown = HOME_SCREENS.INSTRUCTIONS_1;
            //go to instructions1
            Debug.Log("pass");
            break;
        case HOME_BUTTONS.INSTRUCTION_NEXT:
            if (screen_shown == HOME_SCREENS.INSTRUCTIONS_1) {
                screen_shown = HOME_SCREENS.INSTRUCTIONS_2;
                //go to instructions2
                Debug.Log("pass");
            } else if (screen_shown == HOME_SCREENS.INSTRUCTIONS_2) {
                //go to game
                Debug.Log("pass");
            }
            break;
        default:
            Debug.LogError("Congratulations! You created a button");
            break;
    }
}

function getButtonPressed(position : Vector2) : HOME_BUTTONS {
    //Is aware of what screen is shown
    //Assumes next for instructions is at the same spot
    
    switch (screen_shown) {
        case HOME_SCREENS.HOME:
            return HOME_BUTTONS.TAP_TO_START;
            break;
        case HOME_SCREENS.INSTRUCTIONS_1:
            if (position.x > instructionsNextTopLeft.x     && position.y < instructionsNextTopLeft.y &&
                position.x < instructionsNextBottomright.x && position.y > instructionsNextBottomright.y) {
                return HOME_BUTTONS.INSTRUCTION_NEXT;
           	}
            break;
        case HOME_SCREENS.INSTRUCTIONS_2:
            if (position.x > instructionsNextTopLeft.x     && position.y < instructionsNextTopLeft.y &&
                position.x < instructionsNextBottomright.x && position.y > instructionsNextBottomright.y) {
                return HOME_BUTTONS.INSTRUCTION_NEXT;
           	} else
            if (position.x > instructionsPreviousTopLeft.x     && position.y < instructionsPreviousTopLeft.y &&
                position.x < instructionsPreviousBottomright.x && position.y > instructionsPreviousBottomright.y) {
                return HOME_BUTTONS.INSTRUCTION_PREVIOUS;
            }
            break;
    }
    
    return HOME_BUTTONS.NONE;
}
