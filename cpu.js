var i5 = new CPU();
var sched = new Scheduler();


i5.setRam(100);


for(var i = 1; i < 10; i++) {
	sched.queueNewJob(new Program("test" + i,i,i,i,false));
}
console.log(sched.getCurReadyProgram());
i5.runCycles(9);
console.log(sched.getCurReadyProgram());
i5.nextCycle();
console.log(sched.getCurReadyProgram());
i5.runCycles(8);
console.log(sched.getCurReadyProgram());
i5.nextCycle();
console.log(sched.getCurReadyProgram());




function CPU()  {

	var cpu = {};


	var maxRam;
	var curRam = 0;

	var readyQueue = [];

	var readyIndex = 0;
	var jobIndex = 0;
	var waitingIndex = 0;

	var scheduler;


	cpu.setScheduler = function(nextScheduler) {
		scheduler = nextScheduler;
	};

	cpu.getUsedRam = function() {return curRam;};
	cpu.getMaxRam = function() {return maxRam};
	cpu.setRam = function(next) {
		if(scheduler.hasEmptyReadyQueue())
			maxRam = next;
	};

	cpu.getReadyQueue = function() {return readyQueue;};
	cpu.getNextReadyProgram = function() {return readyQueue[readyIndex].getName();};
	cpu.setReadyQueue = function(next) {readyQueue = next;};




	cpu.nextCycle = function() {

		var curProgram = scheduler.getNextReadyProgram();
		while(curProgram != null && curProgram.getReqCycles == 0)
			curProgram = scheduler.getNextReadyProgram();

		if(curProgram == null) return;
		else curProgram.decCycles();
	}

	cpu.runCycles = function(cycles) {
		for(var i = 0; i < cycles; i++) {
			cpu.nextCycle();
		}
	}



	return cpu;
}


var progId = 0;
function Program(name,reqRam,priority,initCycles,burstable) {

	var program = {};

	var id = progId++;			// the unique ID of this job
	//var reqRam = 0;				// how much space the job requires in RAM
	//var priority = 0;			// the priority of this job as compared to other jobs
	//var initCycles = 0;			// how many cycles we expect the program to run for
	var requiredCycles = 0;		// how many cycles truly remain (INCLUDING I/O BURSTS)
	var burstCycles = 0;		// how many cycles an I/O burst takes
	var assignedCycles = 0;		// how many cycles we're allowed to occupy the RAM for remaining

	//var burstable = false;		// whether or not this job may have an I/O burst in processing it
	

	program.getName = function(){return name};


	program.setRam = function(next) {reqRam = next};
	program.getRam = function() {return reqRam};

	program.getReqCycles = function() {return requiredCycles;};
	program.getInitCycles = function() {return initCycles;};
	program.setReqCycles = function(next) {
		initCycles = next;
		requiredCycles = next;
	};

	program.getBurstCycles = function() {return burstCycles;};
	program.setBurstable = function(canBurst) {burstable = canBurst;};


	program.getAssCycles = function() {return assignedCycles;};
	program.setAssCycles = function(next) {assignedCycles = next;};

	program.decCycles = function(dec) {

		program.addBurst();

		if(requiredCycles <= 0) {
			assignedCycles = 0;
			burstCycles = 0;
		}

		if(assignedCycles > 0) {
			requiredCycles--;
			assignedCycles--;
			if(burstCycles > 0) burstCycles--;
		} 
	};

	program.addBurst = function() {
		if(burstable && Math.floor(Math.random() * (101)) == 1 ) {
			burstable = false;
			burstCycles = Math.floor(Math.random() * (26)) + 25;
			requiredCycles+=burstCycles;
		}
	}


	return program
}

function Scheduler() {
	var scheduler = {};

	var waitingQueue = [];
	var readyQueue = [];
	var terminatedQueue = [];
	var memorySwapping = false;
	var type = 0; // 0 = priority-based, 1 = FIFO, 2 = earliest deadline first
	var readyQueueIndex = 0;
	var readyQueueMemoryInUse = 0;


	scheduler.getReadyQueue = function() {return readyQueue;};
	scheduler.getWaitingQueue = function() {return waitingQueue;};
	scheduler.getTerminatedQueue = function() {return terminatedQueue;};


	scheduler.setType = function(t) {
		type = t;
	}

	scheduler.sortQueue = function(a,b) {
		if (type == 1) {
			// compare ids to determine which job was queued earliest
			return a.id - b.id;
		} else if (type == 2) {
			// compare cycles remaining to determine which job has fewest
			return a.getAssCycles() - b.getAssCycles();
		} else {
			// **DEFAULT CASE**
			// compare priorities to determine which priority is higher
			// NOTE: values reversed because higher priority is more valuable, 
			// and negative values make a go before b, and vice versa
			// thus, inverting the order will return which has the LARGER priority as the "earlier"
			// in the array, instead of the SMALLER priority as outlined in the other code blocks
			return b.priority - a.priority;
		}
	}

	scheduler.generateSchedule = function() {
		// This function gets called ONLY when we need to re-evaluate the ready queue
		readyQueueIndex = 0;
		// thus, we always need to reset the readyQueueIndex when we're making a new readyQueue.

		// First, check the readyQueue for completed jobs and remove them as necessary.
		for (int n = 0; n < readyQueue.length; n++) {
			if (readyQueue[n].getReqCycles <= 0) {
				// if the job at index n has no cycles remaining, move it to the
				// terminatedQueue and dequeue it
				readyQueueMemoryInUse -= readyQueue[n].getRam();
				terminatedQueue.push(readyQueue[n]);
				readyQueue.splice(n,1);
				n--;
			}
		}

		// Then, if the waitingQueue has programs for us to evaluate...
		if (waitingQueue.length > 0) {
			var tempQueue = waitingQueue;
			tempQueue.sort(scheduler.sortQueue);	// sort the array using the custom sortQueue function in scheduler
			for (int i = 0; i < tempQueue.length; i++) {
				if (tempQueue[i].getRam() < cpu.getMaxRam() - readyQueueMemoryInUse) {	// if we can fit this process in RAM
					readyQueueMemoryInUse += tempQueue[i].getRam();
					readyQueue.push(tempQueue[i]);									// queue that bad boy up
					waitingQueue.splice(waitingQueue.indexOf(tempQueue[i]),1);		// remove the job from the waiting queue
				}
			}
		}
	}

	scheduler.queueNewJob = function(job) {
		if (job.getRam() > cpu.getMaxRam()) {
			// TODO: Log "job required ram exceeds max ram available in CPU 
			// - job cannot queue"
			return;
		}
		if (job.getReqCycles <= 0) {
			// TODO: Log "job completed in 0 cycles"
			terminatedQueue.push(job);
			return;
		}
		waitingQueue.push(job);
	}

	scheduler.hasEmptyReadyQueue = function() {
		return (readyQueue.length == 0 || readyQueueIndex >= readyQueue.length);
	}

	scheduler.getCurReadyProgram = function() {
		return readyQueue[readyQueueIndex];
	}
	scheduler.getNextReadyProgram = function() {
		// If the readyQueue is empty AND the waitingQueue is empty, 
		// we have no job to provide.
		if (readyQueue.length == 0 && waitingQueue.length == 0) return null;


		if(readyQueue[readyQueueIndex].getAssCycles() <= 0) readyQueueIndex++;

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


	return scheduler;
}
