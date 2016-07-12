
var colorPalette = "F44336~E91E63~9C27B0~673AB7~3F51B5~2196F3~03A9F4~00BCD4~009688~4CAF50~8BC34A~CDDC39~FFEB3B~FFC107~FF9800~FF5722~BB5528~795548~9E9E9E~607D8B".split("~");
var colorPaletteVisible = false;
var canvasPalette = DOM("CANVASPAL");
var colorPaletteCTX = canvasPalette.getContext("2d");
var palette_cb = "";

function palette_refresh() {
	DOM("CANVASPAL").style.left = px(int(DOM("dot_tools").style.left) - 140 + 52);
	if(DOM("CANVASPAL").style.top === null || DOM("CANVASPAL").style.top === "") {
		DOM("CANVASPAL").style.top = px(scr.h - int(DOM("dot_tools").style.bottom) - 140 + 52);
	} else {
		DOM("CANVASPAL").style.top = px(int(DOM("dot_tools").style.top) - 140 + 52);
	 }
}

function palette_show(get_palette_cb) {
	palette_cb = get_palette_cb;
	palette_refresh();
	palette_render(0);
	DOM("CANVASPAL").style.display = "block";
	
	setTimeout(function() {
		DOM("CANVASPAL").style.opacity = "1";
		DOM("CANVASPAL").style.transform = "scale(1) rotate(0deg)";
		DOM("CANVASPAL").style.webkitTransform = "scale(1) rotate(0deg)";
		colorPaletteVisible = true;
	}, 20);
}

function palette_hide() {
	DOM("CANVASPAL").style.transform = "scale(.2) rotate(90deg)";
	DOM("CANVASPAL").style.webkitTransform = "scale(.2) rotate(90deg)";
	DOM("CANVASPAL").style.opacity = "0";
	setTimeout(function() {
		DOM("CANVASPAL").style.display = "none";
		colorPaletteVisible = false;
		palette_cb = "";
	}, 600);
}

function palette_render(colorIndex) {
	colorPaletteCTX.clearRect(0, 0, 400, 400);
	for(var ptr = 0; ptr < 20; ptr++) {
		colorarc(ptr);
	}
	for(var ptr = 0; ptr < 20; ptr++) { 
		greyarc(colorIndex, ptr);
	}
}

function colorarc(index) {
	var colorStep = .1;
	colorPaletteCTX.beginPath();
	colorPaletteCTX.lineWidth = 70;
	colorPaletteCTX.strokeStyle =  '#' + colorPalette[index];
	colorPaletteCTX.arc(200, 200, 165, index * colorStep * Math.PI, (index * colorStep + colorStep) * Math.PI);
	colorPaletteCTX.stroke();	
}

function greyarc(colorIndex, greyLevel) {
	var colorStep = .1;
	var step = .1;
	colorPaletteCTX.beginPath();
	colorPaletteCTX.lineWidth = 60;
	var c = colorToArray( '#' + colorPalette[colorIndex]);
	if(greyLevel < 10) {	
		c.r = c.r  * (greyLevel / 10); if(c.r > 255) c.r = 255;
		c.g = c.g  * (greyLevel / 10); if(c.g > 255) c.g = 255;
		c.b = c.b  * (greyLevel / 10); if(c.b > 255) c.b = 255;
	} else {
		c.r = ~~((255 - c.r) * ((greyLevel - 10) / 9) + c.r); if(c.r > 255) c.r = 255;
		c.g = ~~((255 - c.g) * ((greyLevel - 10) / 9) + c.g); if(c.g > 255) c.g = 255;
		c.b = ~~((255 - c.b) * ((greyLevel - 10) / 9) + c.b); if(c.b > 255) c.b = 255;	
	}
	colorPaletteCTX.strokeStyle =  "#" + RGBToHex(~~c.r, ~~c.g, ~~c.b);
	var decalator = colorIndex - 10; 
	colorPaletteCTX.arc(200, 200, 101, (decalator * .1) * Math.PI + greyLevel * step * Math.PI, (decalator * .1) * Math.PI +  (greyLevel * step + step) * Math.PI);
	colorPaletteCTX.stroke();
}

function pal_end(inputId) {
	var ebag =  touchMap[inputId];
	var p = getPos(DOM("CANVASPAL"));
	var x = ebag.hitpos.x - p.x;
	var y = ebag.hitpos.y - p.y;
	var d = getDistance({x: p.x + 140, y: p.y + 140}, {x: ebag.hitpos.x, y: ebag.hitpos.y});
	var pix = colorPaletteCTX.getImageData(~~(x * 400 / 280), ~~(y * 400 / 280), 1, 1).data;

	var color = RGBToHex(pix[0], pix[1], pix[2]);
	var rgbcolor = "rgba(" + pix[0] + "," + pix[1] + "," + pix[2] + ",1)";
	if(d < 90) {
		if(palette_cb !== "") {
			palette_cb(rgbcolor);
		}
	} else {
		palette_cb(rgbcolor);
		for(var index = 0; index < 20; index++) { 
			if(color === colorPalette[index]) {
				palette_render(index);
			}
		}
	}
	
}
