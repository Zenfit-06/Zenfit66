document.addEventListener(
"DOMContentLoaded",
()=>{


const profile =
JSON.parse(
localStorage.getItem(
"zenfitProfile"
)
||
"{}"
);


const user =
JSON.parse(
localStorage.getItem("zenfit_user")
);


const name =
profile.name || "User";


document.getElementById("profileName").innerHTML =
user.fullName;



document.getElementById(
"userGoal"
).textContent =
profile.goal || "--";





let height =
Number(profile.height);


let weight =
Number(profile.weight);


let age =
Number(profile.age);




document.getElementById(
"height"
).textContent =
height ?
height+" cm":
"--";



document.getElementById(
"weight"
).textContent =
weight ?
weight+" kg":
"--";




let bmi=0;


if(height && weight){

bmi =
weight /
Math.pow(
height/100,
2
);

}



document.getElementById(
"bmi"
).textContent =
bmi?
bmi.toFixed(1):
"--";



document.getElementById(
"bmiScore"
).textContent =
bmi?
Math.round(bmi):
0;





let bmr=0;


if(
height &&
weight &&
age
){


if(
profile.gender==="Male"
){


bmr =
10*weight+
6.25*height-
5*age+
5;


}
else{


bmr =
10*weight+
6.25*height-
5*age-
161;


}

}



document.getElementById(
"bmr"
).textContent =
bmr?
Math.round(bmr)+" kcal":
"--";





let fat =
Number(profile.bodyFat)||0;


document.getElementById(
"bodyFat"
).textContent =
fat+"%";



document.getElementById(
"fatProgress"
).style.width =
Math.min(
fat,
100
)+"%";





document.getElementById(
"calories"
).textContent =
bmr?
Math.round(bmr)+" kcal":
"Complete Profile";



});


const photoUpload =
document.getElementById(
"photoUpload"
);


const profilePhoto =
document.getElementById(
"profilePhoto"
);



if(photoUpload){


photoUpload.addEventListener(
"change",
function(e){


const file =
e.target.files[0];


if(!file)
return;



const reader =
new FileReader();



reader.onload=function(){


profilePhoto.src =
reader.result;



localStorage.setItem(
"zenfitProfilePhoto",
reader.result
);


}



reader.readAsDataURL(file);



}

);


}





const savedPhoto =
localStorage.getItem(
"zenfitProfilePhoto"
);



if(savedPhoto && profilePhoto){

profilePhoto.src =
savedPhoto;

}

