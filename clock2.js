var exams = new Array(); // format: name, start_time_secs, end_time_secs, extra_end_time_secs

// Function to get the current date with time set to 0 hours and 0 minutes
function getDateWithZeroTime() {
    let date = new Date();
    date.setHours(0, 0, 0, 0); // Set hours, minutes, seconds, and milliseconds to 0
    return date;
}

// Function to add minutes to a JavaScript Date object
function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes * 60000); // 60000 milliseconds in a minute
}
// Function to add seconds to a given date
function addSeconds(date, seconds) {
    return new Date(date.getTime() + seconds * 1000); // 1000 milliseconds in a second
}
function addHours(date, hours) {
    date.setHours(date.getHours() + hours);
    return date;
}
function splitTime(timeString) {
	 // Check if timeString is a string
    if (typeof timeString !== 'string') {
		console.log("timeString",timeString);
        throw new Error('Input is not a string');
    }

    // Split the time string into hours and minutes
    let [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
}
// Function to format a date object to HH:mm format
function formatDateToHHMM(date) {
    // Extract hours and minutes from the date object
    let hours = date.getHours();
    let minutes = date.getMinutes();

    // Ensure that single-digit hours and minutes are padded with leading zeros
    let formattedHours = (hours < 10 ? '0' : '') + hours;
    let formattedMinutes = (minutes < 10 ? '0' : '') + minutes;

    // Construct the HH:mm string
    return formattedHours + ':' + formattedMinutes;
}
function addExam(){
	// get raw input from the form
	var add_exam_form = document.forms[0];
	var name = add_exam_form.elements["new_exam_name"].value;
	var start_time = add_exam_form.elements["new_exam_start_time"].value;
	
	var durationString = add_exam_form.elements["new_exam_duration"].value;
	var duration =durationString;
	duration = duration.split(":");
	console.log(duration);
	// get the current time and convert to secs
	var date = new Date;
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	var current_secs = hours*60*60 + minutes*60 + seconds;
	//convert start time to seconds
	var start_time_secs = start_time[0]*600*60 + start_time[1]*60*60 + start_time[3]*600 + start_time[4]*60;
	// check if start_time is blank first
	if (start_time_secs == 0){
		start_time_secs = current_secs + 10;
	}
	//check that we're not starting in the past
	if (start_time_secs < current_secs){
		alert("Start time is in the past. Exam has been running for "+ getTimeString(current_secs - start_time_secs,true));
		//return 0; // Break out without adding an exam
	}
	//convert duration to secs
	//var duration_secs = duration[0]*600*60 + duration[1]*60*60 + duration[3]*600 + duration[4]*60;
	var duration_secs = parseInt(duration[0])*60*60 + parseInt(duration[1])*60;
	console.log(parseInt(duration[0])*60*60);
	console.log( parseInt(duration[1])*60);
	console.log(duration_secs);
	//calculate end time in secs
	var end_time_secs = start_time_secs + duration_secs;
	var extra_end_time_secs = start_time_secs + duration_secs*1.25;
	
	var startDate = getDateWithZeroTime();
	var startTimeHoursMinutes = splitTime(start_time);
	startDate = addHours(startDate , startTimeHoursMinutes.hours);
	startDate = addMinutes(startDate , startTimeHoursMinutes.minutes);
	
	var endDate = startDate;
	var endTimeHoursMinutes = splitTime(durationString);
	endDate = addHours(startDate , endTimeHoursMinutes.hours);
	endDate = addMinutes(startDate , endTimeHoursMinutes.minutes);
	
	
	// create an exam with the given specs and add it to the exams Array
	var new_exam = new Array(name, start_time_secs, end_time_secs, extra_end_time_secs , start_time , formatDateToHHMM(endDate));
	exams.push(new_exam);
	console.log("startDate" , startDate , "endDate" , endDate);
	console.log("new_exam" , new_exam , "exams" , exams);
	add_exam_form.elements["new_exam_name"].value = "";
}

function updateCountdowns(){
	// clear the divs
	for (var i = 0; i < 10; i++){
			document.getElementById("exam_"+(i+1)).innerHTML = '';
	}
	// get the current time and convert to secs
	var date = new Date;
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	var current_secs = hours*60*60 + minutes*60 + seconds;
	// loop through exams.
	for (var i = 0; i < exams.length; i++) {
		// The string to write
		var str = '';
		var ongoing = true;
		// If one hasn't started, draw time until start
		if (current_secs<exams[i][1]){
			// draw time until started
			str = "Starting in " + getTimeString(exams[i][1]-current_secs,false);
		}
		// If one is ongoing, draw time remaining
		else if (current_secs<exams[i][2]){
			// draw time until end
			str = getTimeString(exams[i][2]-current_secs,true) + " . (Extra time: " + getTimeString(exams[i][3]-current_secs,true) + ")"
		}
		// If one is in extra time, draw that
		else if (current_secs<exams[i][3]){
			// draw time until end
			str = '<span id="exam_time" class="exam_green">Finished.</span> ' + getTimeString(exams[i][3]-current_secs,true) + " remaining for extra time."
		}
		// If one finished in the last 1 min, draw finished
		else if (current_secs<exams[i][3] + 60){
			// draw time until end
			str = '<span id="exam_time" class="exam_green">Finished.</span>'
		}
		// If one finished longer than 1 min ago, don't draw it
		else {
			ongoing = false;
		}
		str = (str + ' [Start '+ exams[i][4] +'     '+ '   End '+ exams[i][5] + ']')
		// Write the string
		if (ongoing == true){
			document.getElementById("exam_"+(i+1)).innerHTML = "<input type=\"button\" value=\"&times;\" style=background-color:#4CAF50 font-size: 30px; onclick=\"javascript:cancelExam("+i+");\">"+ " <b>"+ exams[i][0] + ":</b> " + str
		}

	}
	// loop through again (backwards) deleting those that finished a while ago
	for (var i = exams.length - 1; i >= 0; i--) {
		if (current_secs>exams[i][3] + 60){
			exams.splice(i, 1);
		}
	}

}

function cancelExam(i){
	exams.splice(i, 1);
}

function getTimeString(secs,apply_style){
	//convert to string hh:mm:ss
	var hours   = Math.floor(secs / 3600);
  var minutes = Math.floor((secs - (hours * 3600)) / 60);
  var seconds = secs - (hours * 3600) - (minutes * 60);
  if (hours   < 10) {hours   = hours;}
  if (minutes < 10) {minutes = "0"+minutes;}
	if ((hours == '00')&&(minutes=='00')){
		if (seconds == 1){ return '<span id="exam_time" class="exam_yellow" class="blink_me">1 second</span>';}
		return '<span id="exam_time" class="exam_yellow">'+seconds + ' seconds</span>';
	}
	if (hours == '00'){
		if (apply_style) {
			var int_minutes = parseInt(minutes);
			var minute_class = 'normal';
			if (int_minutes <=10 && int_minutes >5) {
				minute_class = 'black';
			} else if (int_minutes <=5 && int_minutes >0) {
				minute_class = 'red';
			}
			if (minutes == '01'){return '<span id="exam_time" class="exam_'+minute_class+'">1 min</span>"'};
			return '<span id="exam_time" class="exam_'+minute_class+'">'+Math.floor((secs - (hours * 3600)) / 60) + ' mins</span>';
		} else {
			if (minutes == '01'){return '1 min'};
			return Math.floor((secs - (hours * 3600)) / 60) + ' mins';

		}
	}
  return '<span id="exam_time">'+hours+' hr '+minutes+' mins</span>';

}

function drawclockpara(){
	main_clock = document.getElementById("main_clock");
	main_clock.innerHTML="Hello";
	var date = new Date;
	var hour = date.getHours();
        var meridiem = hour >= 12 ? "PM": "AM";
	var hours = hour > 12 ? hour - 12 : hour;
	//var hours = hour;louis
	var minutes = date.getMinutes();
	if (minutes <= 9){
		minutes = "0" + minutes;
	}
	//main_clock.innerHTML = hours + ":" + minutes + " <span id='meridiem'>"+meridiem+"</span>";
	main_clock.innerHTML = hours + ":" + minutes;
}

function removeAdds(){
	// look for adds at the bottom of the page and remove them. Nt working :(
	var divs = document.getElementsByTagName("div");
	if (divs.length>4){
		for(var i = 4; i < divs.length; i++){
   		//remove add
   		divs[i].innerHTML = "";
		}
	}
}

function updateEverything() {
	drawclockpara();
	updateCountdowns();
}

function open_new_exam() {
    var x = document.getElementById('new_exam_form');
    if (x.style.display === 'none') {
        x.style.display = 'block';
	document.getElementById("open_new_exam").value="[x]"	
    } else {
        x.style.display = 'none';
	document.getElementById("open_new_exam").value="[-]"	
    }

}

function blinker() {
    $('.blink_me').fadeOut(500);
    $('.blink_me').fadeIn(500);

setInterval(blinker, 1000); //Runs every second

}
(function() {
	var date = new Date;
        var hour = date.getHours();
        var minutes = date.getMinutes();
        start_time = hour + ":" + minutes;
	document.getElementById('new_exam_start_time').value = start_time;
	document.getElementById('new_exam_duration').value = "";
})();


// Initialization................................................
drawclockpara();
updateCountdowns();
loop = setInterval(updateEverything, 1000);
