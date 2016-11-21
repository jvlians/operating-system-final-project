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
	var jobQueue = [];
	var waitingQueue = [];

	var readyIndex = 0;
	var jobIndex = 0;
	var waitingIndex = 0;


	cpu.getRam = function() {return ram;};
	cpu.setRam = function(next) {maxRam = next;};

	cpu.getReadyQueue = function() {return readyQueue;};
	cpu.getJobQueue = function() {return jobQueue;};
	cpu.getWaitingQueue = function(){return waitingQueue;};

	cpu.getNextReadyProgram = function() {return readyQueue[readyIndex].getName();};

	cpu.setReadyQueue = function(next) {readyQueue = next;};
	cpu.setJobQueue = function(next) {jobQueue = next;};
	cpu.setWaitingQueue = function(next) {waitingQueue = next;};



	cpu.nextCycle = function() {

		if(readyQueue.lenght == 0) return;

		if(readyIndex > readyQueue.length);
			// this is where I call schedule code
			var x = 0;
			//readyQueue = getSchedule(jobQueue);


		console.log(readyQueue[readyIndex].getAssCycles());
		if(readyQueue[readyIndex].getAssCycles() > 0) readyQueue[readyIndex].decAssCycles();
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


function Program(name) {

	var program = {};

	var reqRam;

	var cycles;
	var assignedCycles = 0;

	program.getName = function(){return name};


	program.setRam = function(next) {reqRam = next};
	program.getRam = function() {return reqRam};

	program.getCycles = function() {return cycles;};
	program.setCycles = function(next) {cycles = next;};
	program.decCycles = function(dec) {cycles -= dec;};


	program.getAssCycles = function() {return assignedCycles;};
	program.setAssCycles = function(next) {assignedCycles = next;};
	program.decAssCycles = function() {assignedCycles-=1;};


	return program
}