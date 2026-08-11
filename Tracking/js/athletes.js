document.addEventListener("DOMContentLoaded",()=>{


function get(key){

return Number(localStorage.getItem(key)) || 0;

}



function loadProfile(){
  try {
    const user = JSON.parse(localStorage.getItem("zenfit_user") || "null");
    const prof = JSON.parse(localStorage.getItem("zenfitProfile") || "null");
    let raw = (user && (user.fullName || user.name || user.email)) || (prof && (prof.name || prof.email)) || "User";
    if (raw.includes("@")) {
      const parts = raw.split("@");
      if (parts[0]) raw = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
    return { name: raw };
  } catch(e) {
    return { name: "User" };
  }
}

const profile=loadProfile();

const distance=get("zenfitDistance");
const calories=get("zenfitCalories");
const workouts=get("zenfitWorkoutSessions");

/* NAME */
const name=document.getElementById("athleteName");
if(name){
  name.textContent = profile.name;
}




/* STATS */


document.getElementById("athDistance")
.textContent=
distance.toFixed(1)+" km";


document.getElementById("athCalories")
.textContent=
calories;



document.getElementById("athWorkout")
.textContent=
workouts;







/* SCORE */


let score=0;


score += Math.min(workouts*10,40);

score += Math.min(distance*5,30);


if(profile.height && profile.weight){

score+=20;

}


score=Math.min(score,100);



const scoreText=
document.getElementById("performanceScore");


if(scoreText)
scoreText.textContent=score;



const ring=
document.querySelector(".performance-ring");


if(ring){

ring.style.background=
`conic-gradient(
#00ff88 ${score*3.6}deg,
#273449 ${score*3.6}deg
)`;

}






/* LEVEL */


const level=
document.getElementById("fitnessLevel");


if(level){

if(score<30)
level.textContent="Beginner";

else if(score<70)
level.textContent="Intermediate";

else
level.textContent="Elite";

}







/* RECORDS */


const longest=
document.getElementById("longestDistance");


if(longest)
longest.textContent=
distance.toFixed(1)+" km";





const streak=
document.getElementById("streak");


if(streak)
streak.textContent=
(workouts*2)+" Days";









/* SEARCH */


const search=
document.getElementById("searchAthlete");


if(search){

search.addEventListener("input",()=>{

console.log(
"Searching:",
search.value
);


});

}




/* FILTERS */


document
.querySelectorAll(".filters button")
.forEach(btn=>{


btn.onclick=()=>{


document
.querySelectorAll(".filters button")
.forEach(b=>
b.classList.remove("active")
);


btn.classList.add("active");


};


});


  const upgradeBtn = document.getElementById("upgradeProBtn");
  if (upgradeBtn) {
    upgradeBtn.addEventListener("click", () => {
      alert("🚀 ZENFIT Pro Upgrade is Coming Soon! Stay tuned for elite performance tracking.");
    });
  }

  const proPill = document.getElementById("proPill");
  if (proPill) {
    proPill.addEventListener("click", () => {
      alert("🚀 ZENFIT Pro Upgrade is Coming Soon! Stay tuned for elite performance tracking.");
    });
  }

});