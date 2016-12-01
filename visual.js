function updateVisuals() {
	var rQueue	= sched.getReadyQueue();
	var rVis	= document.getElementById("readyQueue");
	for (var i = 0; i < rQueue.length(); i++) {
		removeContents("#waitingQueue #"+id);
		if (rVis.text().indexOf(rQueue[i].id) > -1) {
			setContents("#readyQueue #"+i+" #data",rQueue[i].getStringifiedWithoutContainer());
		} else {
			addContents("#readyQueue",rQueue[i].getStringifiedWithContainer());
		}
	}
	

	var wQueue	= sched.getWaitingQueue();
	var wVis	= document.getElementById("waitingQueue");
	for (var i = 0; i < wQueue.length(); i++) {
		removeContents("#readyQueue #"+id);
		if (wVis.text().indexOf(wQueue[i].id) > -1) {
			setContents("#waitingQueue #"+i+" #data",wQueue[i].getStringifiedWithoutContainer());
		} else {
			addContents("#waitingQueue",wQueue[i].getStringifiedWithContainer());
		}
	}

	var tQueue	= sched.getTerminatedQueue();
	var tVis	= document.getElementById("terminatedQueue");
	for (var i = 0; i < tQueue.length(); i++) {
		removeContents("#readyQueue");
		removeContents("#waitingQueue");
		if (tVis.text().indexOf(tQueue[i].id) > -1) {
			setContents("#terminatedQueue #"+i+" #data",tQueue[i].getStringifiedWithoutContainer());
		} else {
			addContents("#terminatedQueue",tQueue[i].getStringifiedWithContainer());
		}
	}
}

function addContents(selector, text) {
	document.querySelector(selector).appendChild(document.createTextNode(text));
}

function updateContents(selector, text) {
	document.querySelector(selector).innerHTML = text;
}

function removeElement(selector) {
	document.querySelector(selector).remove();
}