
var eventQueue = [];

var heap = new BinaryHeap(function(event){return event.time;});

var curTime = 0;

var timeStep = 100;

function executeEvent(event){

	console.log(event.type + " at " + event.time);

}

function clockTrigger(){
	
	/*
	var i = 0;
	for(; i < eventQueue.length; i++){
	
		if(eventQueue[i].time <= curTime){
		
			executeEvent(eventQueue[i]);
			
		}else
			break;
	
	}
	
	//Remove executed events
	if(i > 0){
		eventQueue.splice(0, i);	//Here, i equals to the number of executed events.
	}
	*/

	while(heap.size() > 0 && heap.peek().time <= curTime){

		executeEvent(heap.pop());
	
	}
	
	curTime += timeStep;
	
}
setInterval(clockTrigger, 100);

function createEvents(config, task){

	var delay = parseInt(config["commDelay"]);
	var numMapper = parseInt(config["numMapMachines"]);
	var sizeMapPiece = parseInt(config["sizeMapPiece"]);
	
	var sizeRecord = parseFloat(task["sizeRecord"]);
	var numRecord = parseInt(task["numRecord"]);
	var timePerRecord = parseFloat(task["timePerRecord"]);
	
	var sizeTotalData = numRecord * sizeRecord;
	var numRecordPerPiece = sizeMapPiece / sizeRecord;
	var numPiece = sizeTotalData / sizeMapPiece;
	var numPiecePerMapper = Math.round(numPiece / numMapper);
	//TODO1: [5] Some pieces could be missing due to integer calculation. It might
	//be ok for large data sets, but will case trouble in small data sets.
	
	console.log("sizeMapPiece: " + sizeMapPiece);
	console.log("sizeRecord: " + sizeRecord);
	console.log("numRecordPerPiece: " + numRecordPerPiece);
	console.log("numPiecePerMapper: " + numPiecePerMapper);
	
	var assignTime = 0;
	for(i = 0; i < numMapper; i++){
	
		var eventMapperStart = {};
		eventMapperStart.time = assignTime;
		eventMapperStart.type = "MapperStart";
		//eventQueue.push(eventMapperStart);
	
		heap.push(eventMapperStart);
	
		//There will be a communication delay for assignment.
		assignTime += delay;
		
		//Do we need to have a start up delay? 
		
		//We assume that all data is ready at mapper. If we want to change this
		//assumption, we need to study GFS.
		
		
		//Now, let's estimate the computation time.
		
		var eventMapperFinish = {};
		eventMapperFinish.time = eventMapperStart.time + numPiecePerMapper * numRecordPerPiece * timePerRecord;
		eventMapperFinish.type = "MapperFinish";
		//eventQueue.push(eventMapperFinish);
		
		heap.push(eventMapperFinish);
		
	}
	
	
}

function runSim(){

	d3.json("config.json", function(errorConfig, config) {

		console.log(config["numMachines"]);
	
		d3.json("task.json", function(errorTask, task) {
		
			createEvents(config, task);

			clockTrigger();
		
		});

	});
	
}


//All TODOs
	//TODO1: [5] Some pieces could be missing due to integer calculation. It might
	//be ok for large data sets, but will case trouble in small data sets.
