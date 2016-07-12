

function slides_init() {
	currentSlide = slide_add(false);
	if(editor) docChecksum = getDocumentChecksum();
}

function slide_refresh_dot() {
	if(editor) {
		var slides = document.getElementsByClassName("slide");
		var slides_count = slides.length;
		DOM("info_page").innerHTML = (slide_index + 1) + "/" + slides_count;
	}
}

function slides_refresh() {
	var slides = document.getElementsByClassName("slide");
	var slides_count = slides.length;
	if(scr.w / slides_width < scr.h / slides_height) {
		slides_scale = (scr.w / slides_width);
	} else {
		slides_scale = (scr.h / slides_height);
	}

	slides_left = ~~(scr.w / 2 - (slides_width / 2));
	slides_top = ~~(scr.h / 2 - (slides_height / 2));
	
	// Slides
	for(var i = 0; i < slides_count; i++) {
		slides.item(i).style.transform = "scale(" + slides_scale + ")";
		slides.item(i).style.webkitTransform = "scale(" + slides_scale + ")";
		slides.item(i).style.width = slides_width + "px";
		slides.item(i).style.height = slides_height + "px";
		slides.item(i).style.left = slides_left + "px";
		slides.item(i).style.top = slides_top + "px";
	}

	// Same position for all slides
	slidesPos.width = slides_width * slides_scale
	slidesPos.height =slides_height * slides_scale
	slidesPos.left = (scr.w  /2 - slidesPos.width / 2 ) 
	slidesPos.top = (scr.h / 2 - slidesPos.height / 2)
	slide_refresh_dot();
}

/** Add or duplicate the current slide **/
function slide_add(duplicate) {
	//if(duplicate) {
		set_selection( null );
		var slides = document.getElementsByClassName("slide");
		var slides_count = slides.length;
		if(slides_count < slides_max) {
			var defaultContent = duplicate ? currentSlide.innerHTML : "";
			var backgroundColor = duplicate ? currentSlide.style.backgroundColor : defaultBackgroundColor;
			var element = document.createElement("DIV");
			element.setAttribute("id", "SLIDE_" + Date.now());
			element.setAttribute("class", "slide");
			element.setAttribute("style", "background-color: " + backgroundColor + ";");
			element.setAttribute("clickable", "true");
			element.setAttribute("inputpress", "slideInputPress()");
			document.body.appendChild(element);
			element.innerHTML = defaultContent;
			currentSlide = element;
			slide_index++;
			slide_renewAllIDs(currentSlide);
			slides_refreshVisibility();
			slide_refresh_dot();
			return element;
		}
	//} else {
	//	pick_slide_template();
	//}
		
}

function slide_renewAllIDs(slide) {
	var elements = slide.querySelectorAll("[removable]");
	var elementsCount = elements.length;
	for(var index = 0; index < elementsCount; index++) {
		if(elements[index].hasAttribute("id")) {
			elements[index].setAttribute("id", elements[index].getAttribute("id").split("_")[0] + "_" + createId()); 
		}
	}	
}

function slideInputPress() {
	if(playMode) {
		if(currentSlide.querySelector("[ainit]") === null && 
			currentSlide.querySelector("[aclk]") === null && 
			currentSlide.querySelector("[aclke]") === null && 
			currentSlide.querySelector("[astart]") === null &&
			currentSlide.querySelector("[amv]") === null &&
			currentSlide.querySelector("[aend]") === null
		) { // No custom behavior: go to next slide
			if(autonav) slide_next();
		}
	} else {
		if(!eraser_enable) {
			clipart_hide();
			set_selection( null );
			switch_root(activeTool, "dot_main");
		}
		resize();
	}
}


// ------------------------------------------------------------------------------------

/** Returns the index for the slide **/
function getSlideIndex(slideToSearch) {
	var slides = document.getElementsByClassName("slide");
	var returnIndex = 0;
	slides_count = slides.length;
	for(var slideIndex = 0; slideIndex < slides_count; slideIndex++) {
		if(slideToSearch == document.getElementsByClassName("slide")[slideIndex]) {
			returnIndex = slideIndex;
			break;
		}
	}
	return(returnIndex);
}

/** Goes to a specific slide **/
function slide_goto(newIndex, serverSessionUpdate) {
	if(typeof embed_end !== "undefined") embed_end(); 
	newIndex = parseInt(newIndex);
	if(typeof set_selection != "undefined") set_selection( null );
	var slides = document.getElementsByClassName("slide");
	slides_count = slides.length;
	slide_index = newIndex < 0 ? 0 : (newIndex >= slides_count ? slides_count -1 : newIndex);
	
	currentSlide.style.opacity = 0;
	currentSlide.style.display = "none";
	
	currentSlide = null;
	for(var i = 0; i < slides_count; i++) {
		if(i == slide_index) {
			currentSlide = slides.item(i);
			break;
		}
	}
	if(currentSlide == null) {
		slide_index = 0;
		currentSlide = slides.item(slide_index);
	}
	window.setTimeout(function() {
		slides_resetIndexes();
		slides_refreshVisibility();
		slide_refresh_dot();
		initializeSlideEvents();
	}, 150);
	
	if(typeof serverSessionUpdate == "undefined" || serverSessionUpdate == true) {
		slide_refresh_serverInfo();
	}
}

/** Goes to the previous slide **/
function slide_previous() {
	if(typeof embed_end !== "undefined") embed_end();
	if(typeof set_selection != "undefined") set_selection( null );
	var slides = document.getElementsByClassName("slide");
	slides_count = slides.length;
	
	currentSlide.style.opacity = 0;
	currentSlide.style.display = "none";

	
	var index = 0;
	var previousSlideIndex = -1;
	var previousSlideElement = null;
	for(var i = 0; i < slides_count; i++) {
		index++;
		if(slides.item(i) == currentSlide) {
			if(previousSlideIndex == -1) {
				slide_index = slides_count;
				currentSlide = slides.item(slides_count - 1);
			} else {
				slide_index = previousSlideIndex;
				currentSlide = previousSlideElement;
			}
			break;
		}
		previousSlideIndex = index;
		previousSlideElement = slides.item(i);
	}
	setTimeout(function() {
		slides_resetIndexes();
		slides_refreshVisibility();
		slide_refresh_dot();
		initializeSlideEvents();
	}, 150);
	if(typeof serverSessionUpdate == "undefined" || serverSessionUpdate == true) {	
		slide_refresh_serverInfo();
	}
}

/** Goes to the next slide **/
function slide_next() {
	if(typeof embed_end !== "undefined") embed_end();
	if(typeof set_selection != "undefined") set_selection( null );
	
	currentSlide.style.opacity = 0;
	currentSlide.style.display = "none";
	
	var slides = document.getElementsByClassName("slide");
	slides_count = slides.length;
	var index = 0;
	var isNext = false;
	for(var i = 0; i < slides_count; i++) {
		index++;
		if(isNext) {
			slide_index = index;
			currentSlide = slides.item(i);
			isNext = false;
			break;
		}
		if(slides.item(i) == currentSlide) {
			isNext = true;
		}
	}
	if(isNext) {
		slide_index = 0;
		currentSlide = slides.item(0);	
	}
	setTimeout(function() {
		slides_resetIndexes();
		slides_refreshVisibility();
		slide_refresh_dot();
		initializeSlideEvents();
	}, 150);
	if(typeof serverSessionUpdate == "undefined" || serverSessionUpdate == true) {	
		slide_refresh_serverInfo();
	}
}

/** Hides all slides **/
function slides_hideAll() {
	var slides = document.getElementsByClassName("slide");
	slides_count = slides.length;
	for(var i = 0; i < slides_count; i++) {
		slides.item(i).style.display = "none";
		slides.item(i).style.opacity = 0;
	}
}

/** Hides all slides and show the current one **/
function slides_refreshVisibility() {
	if(currentSlide !== null) {
		var slides = document.getElementsByClassName("slide");
		slides_count = slides.length;
		for(var i = 0; i < slides_count; i++) {
			if(slides.item(i) == currentSlide) {
				slides.item(i).style.display = "block";
				slides.item(i).style.opacity = 1;
				slide_index = i;
			} else {
				slides.item(i).style.display = "none";
				slides.item(i).style.opacity = 0;
			}
		}
		applyBackgroundColor(currentSlide.style.backgroundColor);
	}
}

// ------------------------------------------------------------------------------------

function slide_refresh_serverInfo() {
	pingASAP();
}

function slides_clearAll() {
	if(typeof embed_end !== "undefined") embed_end();
	while(document.getElementsByClassName("slide").length > 0) {
		document.getElementsByClassName("slide")[0].parentNode.removeChild(document.getElementsByClassName("slide")[0]);
	};
}

function slide_remove() {
	if(typeof embed_end !== "undefined") embed_end();
	set_selection( null );
	
	if(slides_count == 1) {
		currentSlide.innerHTML = "";
		currentSlide.setAttribute("style", "background-color: "+defaultBackgroundColor+";");
	} else {
		var removeIndex = -1;
		var slides = document.getElementsByClassName("slide");
		slides_count = slides.length;
		for(var i = 0; i < slides_count; i++) {
			if(slides.item(i) == currentSlide) {
				removeIndex = i;
			}
		}
		if(removeIndex > -1) {
			currentSlide.parentNode.removeChild(currentSlide);
			currentSlide = null;
			slides_resetIndexes();
			var slides = document.getElementsByClassName("slide");
			slides_count = slides.length;
			for(var i = 0; i < slides_count; i++) {
				if(removeIndex >= i) {
					currentSlide = slides.item(i);
				}
			}
			if(currentSlide == null) {
				currentSlide = slides.item(0)
			}
			slides_resetIndexes();
			slides_refreshVisibility();
			slide_refresh_dot();
			slide_refresh_serverInfo();
		}
	}
}


// ------------------------------------------------------------------------------------

function slides_resetIndexes() {
	var currentPage = 0;
	var slides = document.getElementsByClassName("slide");
	slides_count = slides.length;
	for(var i = 0; i < slides_count; i++) {
		if(slides.item(i) == currentSlide) {
			slide_index = i;
			break;
		}
	}
}

// ------------------------------------------------------------------------------------

function slide_moveToFirst() {
	memSlide = currentSlide.outerHTML; 
	currentSlide.parentNode.removeChild(currentSlide);
	
	var slides = document.getElementsByClassName("slide");
	slides.item(0).insertAdjacentHTML("beforebegin", memSlide);

	var slides = document.getElementsByClassName("slide");
	currentSlide = slides.item(0);
	go(1);

	slides_resetIndexes()
	slides_refreshVisibility();
}
function slide_moveToLast() {
	memSlide = currentSlide.outerHTML; 
	currentSlide.parentNode.removeChild(currentSlide);
	
	var slides = document.getElementsByClassName("slide");
	slides.item(slides.length - 1).insertAdjacentHTML("afterend", memSlide);	

	var slides = document.getElementsByClassName("slide");
	currentSlide = slides.item(slides.length - 1);
	go(slides.length);

	slides_resetIndexes()
	slides_refreshVisibility();	
}

var memorySlides = "";
function slides_saveToLocal() {
	var data = "";
	currentSlide.style.opacity = "0";
	var slides = document.getElementsByClassName("slide");
	slides_count = slides.length;
	for(var i = 0; i < slides_count; i++) {
		data += slides.item(i).outerHTML;
	}
	currentSlide.style.opacity = "1";
	//localStorage.setItem("slides_data", data);
	memorySlides = data;
}

function slides_loadFromLocal() {
	//var data = localStorage.getItem("slides_data");
	var data = memorySlides;
	set_selection( null );
	slides_clearAll();
	document.body.insertAdjacentHTML('beforeend', data);

	var slides = document.getElementsByClassName("slide");
	var slides_count = slides.length;
	if(slides_count == 0) {
		slide_add(false);
	}
}