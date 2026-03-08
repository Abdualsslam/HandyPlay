// =============================================
// GESTURE DETECTION
// =============================================
function isPointing(lm) {
    // Index finger must be clearly raised: tip (8) above PIP (6) AND above MCP (5)
    var indexUp = lm[8].y < lm[6].y && lm[8].y < lm[5].y;
    // Other 3 fingers must be clearly curled: tips below their PIP joints
    var middleCurled = lm[12].y > lm[10].y && lm[12].y > lm[9].y;
    var ringCurled = lm[16].y > lm[14].y && lm[16].y > lm[13].y;
    var pinkyCurled = lm[20].y > lm[18].y && lm[20].y > lm[17].y;
    return indexUp && middleCurled && ringCurled && pinkyCurled;
}

function isOpenHand(lm) {
    return lm[8].y < lm[6].y && lm[12].y < lm[10].y && lm[16].y < lm[14].y && lm[20].y < lm[18].y;
}

// 🤏 Pinch: Thumb tip touches index tip (more natural click)
function isPinchGesture(lm) {
    // Use original landmarks for distance (not mirrored)
    var dx = lm[4].x - lm[8].x;
    var dy = lm[4].y - lm[8].y;
    return Math.sqrt(dx * dx + dy * dy) < 0.055; // Slightly larger tolerance for thumb
}

function isClosedFist(lm) {
    // A fist is basically when the tips of the 4 fingers are below their respective lower joints.
    return lm[8].y > lm[6].y && lm[12].y > lm[10].y && lm[16].y > lm[14].y && lm[20].y > lm[18].y;
}
