var exampleCPU = new CPU();
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
	cpu.setRam = function(next) {maxRam = next;};

	cpu.getReadyQueue = function() {return readyQueue;};
	cpu.getNextReadyProgram = function() {return readyQueue[readyIndex].getName();};
	cpu.setReadyQueue = function(next) {readyQueue = next;};




	cpu.nextCycle = function() {

		if(readyQueue.length == 0) return;

		if(readyIndex > readyQueue.length);
			// this is where I call schedule code
			var x = 0;
			//readyQueue = getSchedule(jobQueue);


		console.log(readyQueue[readyIndex].getAssCycles());
		if(readyQueue[readyIndex].getAssCycles() > 0) {
			 readyQueue[readyIndex].decAssCycles();
		}
		else {
			readyIndex += 1;
			cpu.nextCycle();
		}
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

	program.getReqCycles = function() {return cycles;};
	program.setReqCycles = function(next) {cycles = next;};


	program.getAssCycles = function() {return assignedCycles;};
	program.setAssCycles = function(next) {assignedCycles = next;};

	program.decCycles = function(dec) {

		program.addBurst();
		if(burstCycles > 0) {

		}

		if(requiredCycles > 0) requiredCycles--;
		else assignedCycles = 0;


		if(assignedCycles > 0) assignedCycles--;
	};

	program.addBurst = function() {
		
	}


	return program
}

function Scheduler() {
	var scheduler = {};

	var waitingQueue = [];
	var readyQueue = [];
	var terminatedQueue = [];
	var type = 0; // 0 = round robin, 1 = FIFO, 2 = earliest deadline first
	var readyQueueIndex = 0;



	scheduler.setType = function(t) {
		type = t;
	}

	scheduler.generateSchedule = function() {
		if (type == 1) {
			// type 1 is FIFO

		} else if (type == 2) {
			// type 2 is earliest deadline first (fewest cycles remaining)

		} else {
			// default to round robin
			
		}
	}

	scheduler.queueNewJob = function(job) {
		waitingQueue.push(job);
	}



	scheduler.getNextReadyProgram = function() {
		if (readyQueue.length == 0) return null;
		if (readyQueueIndex >= readyQueue.length) {
			scheduler.generateSchedule();
			return scheduler.getNextReadyProgram();
		}

		return readyQueue[readyQueueIndex];
	}


	return scheduler;
}
