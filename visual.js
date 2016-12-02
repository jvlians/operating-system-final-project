function updateVisuals() {
	updateTotalClock();
	updateRam();

	var tQueue	= sched.getTerminatedQueue();
	var tVis	= document.getElementById("terminatedQueue");
	for (var i = 0; i < tQueue.length; i++) {
		removeElement("#readyQueue #j"+tQueue[i].getId());
		removeElement("#waitingQueue #j"+tQueue[i].getId());
		if (tVis.textContent.indexOf("["+tQueue[i].getId()+"]") > -1) {
			updateContents("#terminatedQueue #j"+tQueue[i].getId()+" #data",tQueue[i].getElementWithoutContainer());
		} else {
			addContents("#terminatedQueue",tQueue[i].getElementWithContainer());
		}
	}

	var rQueue	= sched.getReadyQueue();
	var rVis	= document.getElementById("readyQueue");
	for (var i = 0; i < rQueue.length; i++) {
		removeElement("#waitingQueue #j"+rQueue[i].getId());
		if (rVis.textContent.indexOf("["+rQueue[i].getId()+"]") > -1) {
			updateContents("#readyQueue #j"+rQueue[i].getId()+" #data",rQueue[i].getElementWithoutContainer());
		} else {
			addContents("#readyQueue",rQueue[i].getElementWithContainer());
		}
	}
	

	var wQueue	= sched.getWaitingQueue();
	var wVis	= document.getElementById("waitingQueue");
	for (var i = 0; i < wQueue.length; i++) {
		if (wVis.textContent.indexOf("["+wQueue[i].getId()+"]") > -1) {
			updateContents("#waitingQueue #j"+wQueue[i].getId()+" #data",wQueue[i].getElementWithoutContainer());
		} else {
			addContents("#waitingQueue",wQueue[i].getElementWithContainer());
		}
	}
}

function resetVisuals() {

	var tVis	= document.getElementById("terminatedQueue");
	tVis.innerHTML = "";
	var rVis	= document.getElementById("readyQueue");
	rVis.innerHTML = "";
	var wVis	= document.getElementById("waitingQueue");
	wVis.innerHTML = "";
	updateTotalClock();
	updateRam();
}

function addContents(selector, text) {
	document.querySelector(selector).appendChild(text);
}

function updateContents(selector, text) {
	var up = document.querySelector(selector);
	if (up) {
		up.innerHTML = text;
	}
}

function removeElement(selector) {
	var rem = document.querySelector(selector);
	if (rem) {
		rem.remove();
	}
}



function log(text) {
	var log = document.getElementById('log');
	var isScrolledToBottom = log.scrollHeight - log.clientHeight <= log.scrollTop + 1;

	var div = document.createElement('div');
	div.innerHTML = "> " + text;
	log.appendChild(div);

	if(isScrolledToBottom) {
		log.scrollTop = log.scrollHeight;
	}

	console.log(text);
}

function resetLog() {
	var l = document.getElementById('log');
	if (l) {
		l.innerHTML = "";
	}
}

function updateTotalClock(){
	document.getElementById('ClockOutput').innerHTML = i5.getTotalCycles();
}

function updateRam() {
	document.getElementById('maxRam').innerHTML = i5.getMaxRam();
	document.getElementById('usedRam').innerHTML = sched.getReadyQueueMemoryInUse();
}