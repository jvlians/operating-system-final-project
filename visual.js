function updateVisuals() {
	var rQueue	= sched.getReadyQueue();
	var rVis	= document.getElementById("readyQueue");
	for (var i = 0; i < rQueue.length; i++) {
		removeElement("#waitingQueue #j"+rQueue[i].getId());
		if (rVis.textContent.indexOf(rQueue[i].getId()) > -1) {
			updateContents("#readyQueue #j"+i+" #data",rQueue[i].getElementWithoutContainer());
		} else {
			addContents("#readyQueue",rQueue[i].getElementWithContainer());
		}
	}
	

	var wQueue	= sched.getWaitingQueue();
	var wVis	= document.getElementById("waitingQueue");
	for (var i = 0; i < wQueue.length; i++) {
		removeElement("#readyQueue #j"+wQueue[i].getId());
		if (wVis.textContent.indexOf(wQueue[i].getId()) > -1) {
			updateContents("#waitingQueue #j"+i+" #data",wQueue[i].getElementWithoutContainer());
		} else {
			addContents("#waitingQueue",wQueue[i].getElementWithContainer());
		}
	}

	var tQueue	= sched.getTerminatedQueue();
	var tVis	= document.getElementById("terminatedQueue");
	for (var i = 0; i < tQueue.length; i++) {
		removeElement("#readyQueue #j"+tQueue[i].getId());
		removeElement("#waitingQueue #j"+tQueue[i].getId());
		if (tVis.textContent.indexOf(tQueue[i].getId()) > -1) {
			updateContents("#terminatedQueue #j"+i+" #data",tQueue[i].getElementWithoutContainer());
		} else {
			addContents("#terminatedQueue",tQueue[i].getElementWithContainer());
		}
	}
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