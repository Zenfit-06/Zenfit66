document.addEventListener(
"DOMContentLoaded",
function(){



const saveBtn =
document.getElementById(
"saveWorkout"
);



saveBtn.addEventListener(
"click",
function(){



const exercise =
document.getElementById(
"exercise"
).value;



const duration = Math.abs(Number(document.getElementById("duration").value) || 0);
const distance = Math.abs(Number(document.getElementById("distance").value) || 0);

if (!duration || duration <= 0) {
  alert("Please enter a valid positive workout duration");
  return;
}



/*
CALORIES
*/


const calorieRate = {


"Running":10,

"Cycling":8,

"Weight Training":6,

"Yoga":4,

"HIIT":12


};



const calories =
duration *
calorieRate[exercise];



/*
OLD DATA
*/


let oldCalories =
Number(
localStorage.getItem(
"zenfitCalories"
)
)||0;



let oldDistance =
Number(
localStorage.getItem(
"zenfitDistance"
)
)||0;



let oldSessions =
Number(
localStorage.getItem(
"zenfitWorkoutSessions"
)
)||0;



/*
SAVE DASHBOARD DATA
*/


localStorage.setItem(
"zenfitCalories",
oldCalories + calories
);



localStorage.setItem(
"zenfitDistance",
oldDistance + distance
);



localStorage.setItem(
"zenfitWorkoutSessions",
oldSessions + 1
);



/*
LATEST ACTIVITY
*/


localStorage.setItem(
"zenfitActivityName",
exercise
);



localStorage.setItem(
"zenfitDuration",
duration + " min"
);



localStorage.setItem(
"zenfitActivityTime",
new Date()
.toLocaleString()
);



/*
HEATMAP
*/


let heatmap =
JSON.parse(
localStorage.getItem(
"zenfitActivityData"
)
)||[];



let level=1;


if(calories>200)
level=2;


if(calories>400)
level=3;


if(calories>700)
level=4;



heatmap.push(level);



if(heatmap.length>35){

heatmap.shift();

}



localStorage.setItem(
"zenfitActivityData",
JSON.stringify(heatmap)
);



/*
SUCCESS
*/


document
.getElementById("success")
.style.display="block";



setTimeout(
function(){

window.location.href=
"dashboard.html";


},
1000
);



});


});