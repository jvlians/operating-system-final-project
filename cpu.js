var i5 = new CPU();
var sched = new Scheduler();
exampleCPU.setRam(100);

var exampleQueue = [];
for(var i = 1; i < 10; i++) {
	var exampleProgram = new Program("test" + i);
	exampleProgram.setAssCycles(i);
	exampleQueue.push(exampleProgram);
}

exampleCPU.setReadyQueue(exampleQueue);
exampleCPU.runCycles(3);
exampleCPU.nextCycle();
console.log(exampleCPU.getNextReadyProgram());



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
	}

	cpu.getUsedRam = function() {return curRam;};
	cpu.getMaxRam = function() {return maxRam};
	cpu.setRam = function(next) {
		if(scheduler.hasEmptyReadyQueue())
			maxRam = next;};
	}

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
function Program(name) {

	var program = {};

	var id = progId++;
	var reqRam = 0;
	var priority = 0;
	var initCycles = 0;
	var requiredCycles = 0;;
	var burstCycles = 0;
	var assignedCycles = 0;

	var burstable = false;
	

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
		if (waitingQueue.length > 0) {
			var tempQueue = waitingQueue;
			tempQueue.sort(scheduler.sortQueue);	// sort the array using the custom sortQueue function in scheduler
			for (int i = 0; i < tempQueue.length; i++) {
				if (tempQueue[i].getRam() < cpu.getMaxRam() - cpu.getUsedRam()) {	// if we can fit this process in RAM
					readyQueue.push(tempQueue[i]);									// queue that bad boy up
					waitingQueue.splice(waitingQueue.indexOf(tempQueue[i]),1);		// remove the job from the waiting queue
				}
			}
			return readyQueue;
		}

		// if there is no waiting queue, return null
		return null;
	}

	scheduler.queueNewJob = function(job) {
		if (job.getRam() > cpu.getMaxRam()) {
			// TODO: Log "job required ram exceeds max ram available - job cannot queue"
			return;
		}
		waitingQueue.push(job);
	}

	scheduler.hasEmptyReadyQueue = function() {
		return (readyQueue.length == 0 || readyQueueIndex >= readyQueue.length);
	}
	scheduler.getNextReadyProgram = function() {
		readyQueueIndex++;
		if (readyQueue.length == 0) return null;
		if (readyQueueIndex >= readyQueue.length) {
			scheduler.generateSchedule();
			return scheduler.getNextReadyProgram();
		}

		return readyQueue[readyQueueIndex];
	}


	return scheduler;
}
