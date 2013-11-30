
var eventQueue = [];

var curTime = 0;

var timeStep = 100;

function executeEvent(event){

	console.log(event.type + " at " + event.time);

}

function clockTrigger(){

	var i = 0;
	for(; i < eventQueue.length; i++){
	
		if(eventQueue[i].time <= curTime){
		
			executeEvent(eventQueue[i]);
			
		}else
			break;
	
	}
	
	//Remove executed events
	if(i > 0){
		eventQuery[i].splice(0, i);	//Here, i equals to the number of executed events.
	}
	
	curTime += timeStep;

}
setInterval(clockTrigger, 100);

function createEvents(){

	var event = {};
	event.time = 500;
	event.type = "MapperStart";
	eventQueue.push(event);
	
	var event2 = {};
	event2.time = 1000;
	event2.type = "MapperEnd";
	eventQueue.push(event2);
	
}

function runSim(){

	createEvents();

	clockTrigger();

}
