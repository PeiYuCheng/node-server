

function eraser_start() {
	erasermove();
	DOM("ERASER_CURSOR").style.fontSize = "32px";
	DOM("ERASER_CURSOR").style.display = "block";
}

function eraser_end() {
	DOM("ERASER_CURSOR").style.display = "none";
}

function erasermove() {
	DOM("ERASER_CURSOR").style.left = (lastHitpos.x + 4) + "px";
	DOM("ERASER_CURSOR").style.top = (lastHitpos.y + 4) + "px";
}

function erase_element(tagId) {
	if(DOM(tagId).getAttribute("removable") == "true") {
		DOM(tagId).parentNode.removeChild(DOM(tagId));
	}
}