
var flashlight_enable = false;
var flashlight_size = 300;
var lastFlashPos = null;

function flashligth_resize() {
	if(flashlight_enable) {
		flash_block_on("flashlight_block");
		flash_block_on("flashlight_left");
		flash_block_on("flashlight_top");
		flash_block_on("flashlight_right");
		flash_block_on("flashlight_bottom");
	} else {
		flash_block_off("flashlight_block");
		flash_block_off("flashlight_left");
		flash_block_off("flashlight_top");
		flash_block_off("flashlight_right");
		flash_block_off("flashlight_bottom");
	}
}

function flash_block_on(blkid) {
	DOM(blkid).style.display = "block";
	flashmove(lastHitpos);
}

function flash_block_off(blkid) {
	DOM(blkid).style.display = "none";
}

function flashmove(flashPos) {
	var fx = flashPos.x - flashlight_size / 2;
	var fy = flashPos.y - flashlight_size / 2;

	DOM_pos("flashlight_block", fx, fy);
	DOM_pos("flashlight_left", 0, 0, fx < 0 ? 0 : fx, scr.h);
	DOM_pos("flashlight_right", fx + flashlight_size, 0, scr.w - fx- flashlight_size < 0 ? 0 : scr.w - fx- flashlight_size, scr.h);
	DOM_pos("flashlight_top", fx, 0, flashlight_size, fy < 0 ? 0 : fy);
	DOM_pos("flashlight_bottom", fx, fy + flashlight_size, flashlight_size, scr.h - fy - flashlight_size < 0 ? 0 : scr.h - fy - flashlight_size);
}

