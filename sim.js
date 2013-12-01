
var activeMappers = [];
var curActiveMappers = 0;

var connection = {
	"nodes": [],
	"links": []
};

var eventHeap = new BinaryHeap(function(event){return event.time;});

var curTime = 0;

var timeStep = 100;

var intervalId;

var masterID = 0;

var masterGroup = 0;
var mapperGroup = 1;

function executeEvent(event){

	//console.log(event.type + " at " + event.time);

	if(event.type == "MapStart"){
	
		curActiveMappers++;
	
	}else if(event.type == "MapFinish"){
	
		curActiveMappers--;
	
	}else if(event.type == "simFinish"){

		clearInterval(intervalId);
	
	}else if(event.type == "MapLoadStart"){

		connection["links"].push({"source":masterID,"target":event.machineID,"value":1});
	
	}
	
	//console.log(curActiveMappers);
}



function clockTrigger(){

	while(eventHeap.size() > 0 && eventHeap.peek().time <= curTime){

		executeEvent(eventHeap.pop());
	}
	
	curTime += timeStep;
	
	activeMappers.shift(); // remove the first element of the array
	activeMappers.push(curActiveMappers); // add a new element to the array (we're just taking the number we just shifted off the front and appending to the end)

	lineChart.redrawWithAnimation(activeMappers);
	
	networkGraph.redrawWithAnimation(connection);
	
}
intervalId = setInterval(clockTrigger, 100);


function createEvents(config, task){

	var delay = parseInt(config["commDelay"]);
	var numMapper = parseInt(config["numMapper"]);
	var numReducer = parseInt(config["numReducer"]);
	var sizeMapPiece = parseInt(config["sizeMapPiece"]);
	var commCostMin = parseInt(config["commCostMin"]);
	var commCostMax = parseInt(config["commCostMax"]);
	
	var sizeRecord = parseFloat(task["sizeRecord"]);
	var numRecord = parseInt(task["numRecord"]);
	var timePerRecordMapper = parseFloat(task["timePerRecordMapper"]);

	var numMapperPerReducer = Math.round(numMapper / numReducer);
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
	var lastTimePoint = 0;
	
	connection["nodes"].push({"name":masterID,"group":masterGroup});
	
	for(i = 1; i <= numMapper; i++){
	
		var eventMapLoadStart = {};
		eventMapLoadStart.time = curTime + assignTime;
		eventMapLoadStart.type = "MapLoadStart";
		eventMapLoadStart.machineID = i;
		eventHeap.push(eventMapLoadStart);
	
		//There will be a communication delay for assignment.
		assignTime += delay;
		
		//Do we need to have a start up delay? 
		
		var bandWidth = randomFromInterval(commCostMin, commCostMax) * 1000 / 8;
		
		var eventMapLoadFinish = {};
		eventMapLoadFinish.time = Math.round(eventMapLoadStart.time + numPiecePerMapper * sizeMapPiece / bandWidth * 1000);
		eventMapLoadFinish.type = "MapLoadFinish";
		eventHeap.push(eventMapLoadFinish);
		
		//Now, let's estimate the computation time.
		
		var eventMapperStart = {};
		eventMapperStart.time = eventMapLoadFinish.time;
		eventMapperStart.type = "MapStart";
		eventHeap.push(eventMapperStart);
	

		
		var eventMapperFinish = {};
		eventMapperFinish.time = eventMapperStart.time + numPiecePerMapper * numRecordPerPiece * timePerRecordMapper;
		eventMapperFinish.type = "MapFinish";
		eventHeap.push(eventMapperFinish);
		
		var reducerID = i / numMapperPerReducer;
		
		if(eventMapperFinish.time > lastTimePoint){
		
			lastTimePoint = eventMapperFinish.time;
		
		}
		
		connection["nodes"].push({"name":i,"group":mapperGroup});
		
	}
	
	var simulationFinish = {};
	simulationFinish.time = lastTimePoint + 1000;	//We add one minute delay
	simulationFinish.type = "simFinish";
	eventHeap.push(simulationFinish);
	
	for(i = 0; i < 100; i++){
		activeMappers.push(0);
		//connection["links"].push({"source":masterID,"target":i,"value":1});
	
	}
	
	lineChart.displayLineChart(activeMappers, 0, numMapper);
	
	networkGraph.displayNetwork(connection);
	
}

function runSim(){

	d3.json("config.json", function(errorConfig, config) {

		d3.json("task.json", function(errorTask, task) {
		
			createEvents(config, task);

			clockTrigger();
		
		});

	});
	
}


//All TODOs
	//TODO1: [5] Some pieces could be missing due to integer calculation. It might
	//be ok for large data sets, but will case trouble in small data sets.
