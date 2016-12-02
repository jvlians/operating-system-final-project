var i5 = new CPU();
var sched = new Scheduler();
var progId = 0;


sched.setCPU(i5);
i5.setScheduler(sched);
i5.setRam(256);




/*for(var i = 1; i < 10; i++) {
	sched.queueNewJob(new Program("test" + i,10,i,i,false));
}*/

//sched.queueNewJob(new Program("DoubleSortTestLast",1,1,30,-1));

//sched.queueNewJob(new Program("DoubleSortTestFirst",1,2,30,-1));
//sched.queueNewJob(new Program("DoubleSortTestMid",1,2,31,-1));

//i5.runCycles(200);
/*
log(sched.getCurReadyProgram().getName());
i5.nextCycle();
log(sched.getCurReadyProgram().getName());
i5.runCycles(8);
log(sched.getCurReadyProgram().getName());
i5.nextCycle();
log(sched.getCurReadyProgram().getName()); */

function progNameId(prog) {
	return prog.getName() + ":" + prog.getId() + "\t\t";
}



function CPU()  {

	var cpu = {};


	var maxRam;
	var curRam = 0;

	var readyQueue = [];

	var readyIndex = 0;
	var jobIndex = 0;
	var waitingIndex = 0;
	var totalCycles = 0;



	cpu.setScheduler = function(nextScheduler) { scheduler = nextScheduler; }

	cpu.getUsedRam = function() { return curRam; }
	cpu.getMaxRam = function() { return maxRam; }
	cpu.setRam = function(next) {
		if(scheduler.hasEmptyReadyQueue())
			maxRam = next;
	}

	cpu.getReadyQueue = function() {return readyQueue;}
	cpu.getNextReadyProgram = function() {return readyQueue[readyIndex].getName();}
	cpu.setReadyQueue = function(next) {readyQueue = next;}


	cpu.getTotalCycles = function() {return totalCycles};
	cpu.incTotalCycles = function() {totalCycles++};


	cpu.nextCycle = function() {

		var curProgram = scheduler.getNextReadyProgram();
		//while(curProgram != null && curProgram.getReqCycles() == 0)
		//curProgram = scheduler.getNextReadyProgram();

		if(curProgram == null) log("Calculated nothing");
		else curProgram.decCycles();

		cpu.incTotalCycles();
	}	

	cpu.runCycles = function(cycles) {
		for(var i = 0; i < cycles; i++) {
			cpu.nextCycle();
		}
		
		updateTotalClock();
		updateVisuals();
	}



	return cpu;
}


var progId = 0;
function Program(name,reqRam,priority,initCycles,cyclesUntilBurst) {

	var program = {};

	// 0 = Yeild , 1 = IO Burst, 2 = Calculating
	var state = 0;
	var stateToStr = {0:"Yield",1:"I/O Burst",2:"Calculating"};


	var burstable = true;
	var id = progId++;			// the unique ID of this job
	//var reqRam = 0;				// how much space the job requires in RAM
	//var priority = 0;			// the priority of this job as compared to other jobs
	//var initCycles = 0;			// how many cycles we expect the program to run for
	var requiredCycles = initCycles;		// how many cycles truly remain (INCLUDING I/O BURSTS)
	var burstCycles = 0;		// how many cycles an I/O burst takes
	var assignedCycles = 0;		// how many cycles we're allowed to occupy the RAM for remaining

	//var burstable = false;		// whether or not this job may have an I/O burst in processing it
	

	program.getName = function(){return name;}

	program.getState = function(){
		program.updateState();
		return state;
	}

	program.getElementWithContainer = function() {
		// this function returns a stringified version of the job
		// it's necessary for the visuals

		var rtn = "<div id='j"+id+"'>";											// create the div for this data with its unique ID
		rtn += "<div id='header'><i>" + name + "</i> [" + id + "]</div><br>";	// create the header (style with 'header' css id)
		rtn += "<div id='data'>";												// create data section (style with 'data' css id)
		rtn += program.getElementWithoutContainer();
		rtn += "</div>";
		rtn += "</div>";

		return rtn.toDOM();
	}

	program.getElementWithoutContainer = function() {
		var data = program.getDataAsDictionary();
		var ret = "";

		ret += "<b>Priority</b>: " + data.priority + "<br>";							// add data to data section line-by-line
		ret += "<b>Required Ram</b>: " + data.reqRam + " bytes<br>";
		ret += "<b>Required Cycles</b>: " + data.reqCycles + "<br>";
		// ret += "<b>I/O Burst Cycles</b>: " + data.ioBurstCycles + "<br>";			// we have no 'ioBurstCycles' measurement at the moment - TODO: add that
		ret += "<b>Assigned Cycles</b>: " + data.assCycles + "<br>";
		ret += "<b>Needs I/O</b>: " + data.burstable + "<br>";
		ret += "<b>State:</b> " + stateToStr[data.state];

		ret.toDOM();
		return ret;
	}

	program.getDataAsDictionary = function() {
		var dict = {
			"id"		: id,
			"name"		: name,
			"priority"	: priority,
			"reqRam"	: reqRam,
			"reqCycles"	: requiredCycles,
			// "ioBurstcycles" :	ioBurstCycles,
			"assCycles"	: assignedCycles,
			"burstable"	: burstable,
			"state"		: state
		};
		return dict;
	}

	program.setRam = function(next) {reqRam = next};
	program.getRam = function() {return reqRam};
	program.getId = function(){return id;}

	program.getReqCycles = function() {return requiredCycles;};
	program.getInitCycles = function() {return initCycles;};
	program.setReqCycles = function(next) {
		initCycles = next;
		requiredCycles = next;
	};

	program.getBurstCycles = function() {return burstCycles;};
	program.setBurstable = function(canBurst) {burstable = canBurst;};


	program.getAssCycles = function() {return assignedCycles;};
	program.setAssCycles = function(next) {
		if (next > requiredCycles) {
			assignedCycles = requiredCycles;
		} else {
			assignedCycles = next;
		}

		log(progNameId(this) + "Set assigned cycles to " + assignedCycles);
	};

	program.getPriority = function() {return priority;}


	program.updateState = function() {
		if(burstCycles > 0) {
			if(state != 1) log(progNameId(this) + "State Set to IO Burst for program ");
			state = 1;
		} else if(requiredCycles == 0 || assignedCycles == 0) {
			if(state != 0) log(progNameId(this) + "State Set to Yield for program ");
			state = 0;
		} else {
			if(state != 2) log(progNameId(this) + "State set to Calculating for program ");
			state = 2;
		}
	}

	program.decCycles = function(dec) {

		program.addBurst();

		if(state == 1) {
			burstCycles--;
			if(assignedCycles > 0) {
				assignedCycles--;
			}

			log(progNameId(this) + "Calculated burst Cycle");
			// log burst cycle complete

		}

		if(state == 2) {
			requiredCycles--;
			assignedCycles--;
			if(cyclesUntilBurst > 0) cyclesUntilBurst--;

			log(progNameId(this) + "Calculated normal cycle");
		} 


		//log(requiredCycles);
		program.updateState();

	};

	program.addBurst = function() {
		if(state != 1){
			if(cyclesUntilBurst == 0) {
				cyclesUntilBurst = -1;
				burstCycles = Math.floor(Math.random() * (26)) + 25;
				log(progNameId(this) + "Added " + burstCycles + " planned IO cycles");
			}
			if(burstable && Math.floor(Math.random() * (101)) == 1 ) {
				burstable = false;
				cyclesUntilBurst = -1;
				burstCycles = Math.floor(Math.random() * (26)) + 25;
				log(progNameId(this) + "Added " + burstCycles + " externally initalized IO cycles");
			}
		}

		program.updateState();
	}


	return program;
}

function Scheduler() {
	var scheduler = {};
	var cpu = {};
	var v = {};
	var waitingQueue = [];
	var readyQueue = [];
	var terminatedQueue = [];
	var memorySwapping = false;
	var type = 0; // 0 = priority-based, 1 = FIFO, 2 = earliest deadline first
	var readyQueueIndex = 0;
	var readyQueueMemoryInUse = 0;
	var maxAssCycles = 10;


	scheduler.getMaxAssCycles = function() { return maxAssCycles; }
	scheduler.setMaxAssCycles = function() { return setMaxAssCycles; }
	scheduler.getReadyQueue = function() { return readyQueue; }
	scheduler.getWaitingQueue = function() { return waitingQueue; }
	scheduler.getTerminatedQueue = function() { return terminatedQueue; }
	scheduler.hasEmptyReadyQueue = function() { return (readyQueue.length == 0 || readyQueueIndex >= readyQueue.length); }
	scheduler.getCurReadyProgram = function() { 
		return readyQueue[readyQueueIndex]; 

	}
	scheduler.setCPU = function(next) { cpu = next; }
	scheduler.setType = function(t) { type = t; }

	scheduler.sortQueue = function(a,b) {
		if (type == 1) {
			// compare ids to determine which job was queued earliest
			return a.id - b.id;
		}
		if (type == 2 && a.getReqCycles() - b.getReqCycles() !== 0) {
			// compare cycles remaining to determine which job has fewest
			return a.getReqCycles() - b.getReqCycles();
		} 
		if (b.getPriority() - a.getPriority() !== 0) return b.getPriority() - a.getPriority();
		if (a.getReqCycles() - b.getReqCycles() !== 0) return a.getReqCycles() - b.getReqCycles();
		return a.id - b.id;
	}
	scheduler.generateSchedule = function() {
		// This function gets called ONLY when we need to re-evaluate the ready queue
		readyQueueIndex = 0;
		// thus, we always need to reset the readyQueueIndex when we're making a new readyQueue.

		// First, check the readyQueue for completed jobs and remove them as necessary.
		for (var n = 0; n < readyQueue.length; n++) {
			if (readyQueue[n].getReqCycles() <= 0) {
				// if the job at index n has no cycles remaining, move it to the
				// terminatedQueue and dequeue it
				readyQueueMemoryInUse -= readyQueue[n].getRam();
				log(progNameId(readyQueue[n]) + "Removing program from ready queue");
				log(progNameId(readyQueue[n]) + "Adding program to terminated queue");
				terminatedQueue.push(readyQueue[n]);
				readyQueue.splice(n,1);
				n--;
			} else {
				readyQueue[n].setAssCycles(10);
				log(progNameId(readyQueue[n]) + "Set assigned cycles to 10");
			}
		}

		// Then, if the waitingQueue has programs for us to evaluate...
		if (waitingQueue.length > 0) {
			waitingQueue.sort(scheduler.sortQueue);	// sort the array using the custom sortQueue function in scheduler
			for (var i = 0; i < waitingQueue.length; i++) {
				if (waitingQueue[i].getRam() < cpu.getMaxRam() - readyQueueMemoryInUse) {	// if we can fit this process in RAM
					readyQueueMemoryInUse += waitingQueue[i].getRam();
					waitingQueue[i].setAssCycles(10); 								// TODO: SWITCH THIS TO A VARIABLE THAT CAN BE MANUALLY CHANGED
					console.log(progNameId(readyQueue[n]) + "Removing program from ready queue");
					console.log(progNameId(readyQueue[n]) + "Added program to ready queue");
					console.log(progNameId(readyQueue[n]) + "Set assigned cycles to 10");
					readyQueue.push(tempQueue[i]);									// queue that bad boy up
					waitingQueue.splice(i,1);		// remove the job from the waiting queue
					i--;
				}
			}
		}
	}

	scheduler.queueNewJob = function(job) {
		if (job.getRam() > cpu.getMaxRam() || job.getRam() < 0) {
			log(job.getName() + " [" + job.id + "] does not have valid RAM - job not queued.");
			return;
		}
		if (job.getReqCycles() <= 0) {
			log(job.getName() + " [" + job.id + "] completed in 0 cycles");
			terminatedQueue.push(job);
			return;
		}
		waitingQueue.push(job);
		log(progNameId(job) + " Added program to waiting queue");
		updateVisuals();
	}

	scheduler.getNextReadyProgram = function() {
		// If the readyQueue is empty AND the waitingQueue is empty, 
		// we have no job to provide.
		if (readyQueue.length == 0) {
			if (waitingQueue.length == 0) return null;

			scheduler.generateSchedule();
		}

		while (readyQueueIndex < readyQueue.length && readyQueue[readyQueueIndex].getState() == 0) {
			readyQueueIndex++;
		}

		if (readyQueueIndex >= readyQueue.length) {
			// If the index of the next program exceeds the readyQueue's length, 
			// OR if there are 0 jobs in the readyQueue,
			// we need to regenerate the readyQueue and retry
			scheduler.generateSchedule();
			return scheduler.getNextReadyProgram();
		}

		// if the readyQueue is fine and the readyQueueIndex doesn't exceed the length,
		// hand the job as normal.
		return readyQueue[readyQueueIndex];
	}

	scheduler.generateSchedule = function() {
		log(" ");
		log("-- Generating Schedule --");
		// This function gets called ONLY when we need to re-evaluate the ready queue
		readyQueueIndex = 0;
		// thus, we always need to reset the readyQueueIndex when we're making a new readyQueue.

		// First, check the readyQueue for completed jobs and remove them as necessary.
		for (var n = 0; n < readyQueue.length; n++) {
			if (readyQueue[n].getReqCycles() <= 0) {
				// if the job at index n has no cycles remaining, move it to the
				// terminatedQueue and dequeue it
				readyQueueMemoryInUse -= readyQueue[n].getRam();
				log(progNameId(readyQueue[n]) + "Removing program from ready queue");
				log(progNameId(readyQueue[n]) + "Adding program to terminated queue");
				terminatedQueue.push(readyQueue[n]);
				readyQueue.splice(n,1);
				n--;
			} else {
				// if the job at index n still has cycles remaining, we need to assign it
				// more cycles so it can be processed.
				if (maxAssCycles > 0) {
					// if there is an assignment cap, attempt to assign it that many
					readyQueue[n].setAssCycles(maxAssCycles);
				} else {
					// otherwise, assign the number of cycles known to be remaining
					readyQueue[n].setAssCycles(readyQueue[n].getReqCycles());
				}
			}
		}

		// Then, if the waitingQueue has programs for us to evaluate...
		if (waitingQueue.length > 0) {
			waitingQueue.sort(scheduler.sortQueue);	// sort the array using the custom sortQueue function in scheduler
			for (var i = 0; i < waitingQueue.length; i++) {
				if (waitingQueue[i].getRam() < cpu.getMaxRam() - readyQueueMemoryInUse) {	// if we can fit this process in RAM
					readyQueueMemoryInUse += waitingQueue[i].getRam();
					if (maxAssCycles > 0) {
						// if there is an assignment cap, attempt to assign it that many
						waitingQueue[i].setAssCycles(maxAssCycles);
					} else {
						// otherwise, assign the number of cycles known to be remaining
						waitingQueue[i].setAssCycles(waitingQueue[i].getReqCycles());
					}
					log(progNameId(waitingQueue[i]) + "Removing program from waiting queue");
					log(progNameId(waitingQueue[i]) + "Adding program to ready queue");
					readyQueue.push(waitingQueue[i]);		// queue that bad boy up
					waitingQueue.splice(i,1);				// remove the job from the waiting queue
					i--;
				}
			}
		}

		log("-- Schedule Generated --");
		log(" ");
	}


	return scheduler;
}

function globalReset() {
	i5 = new CPU();
	sched = new Scheduler();
	progId = 0;


	sched.setCPU(i5);
	i5.setScheduler(sched);
	i5.setRam(256);

	resetLog();
	resetVisuals();
}

String.prototype.toDOM = function() {
	var d = document,
		i,
		a = d.createElement("div"),
		b = d.createDocumentFragment();
	a.innerHTML = this;
	while (i = a.firstChild) b.appendChild(i);
	return b;
};