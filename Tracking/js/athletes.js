/* ===========================================
        ZENFIT ATHLETES JS
              FINAL VERSION
=========================================== */


document.addEventListener("DOMContentLoaded",()=>{

    // 1. Authentication Check via localStorage
    let currentUser = null;
    try {
        currentUser = JSON.parse(localStorage.getItem('zenfit_user') || 'null');
    } catch (e) {
        currentUser = null;
    }

    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }

    setupUserInfo(currentUser);

    setupSidebarToggle();

    setupLogout();

    initChart();

    initSearch();

    initFilters();

    initAnimations();

    initCounter();

    initRipple();

    initModal();

    initScrollTop();

});


function setupUserInfo(user) {
    const fullName = user.fullName || user.name || 'User';
    const avatarInitials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    const headerAvatarEl = document.getElementById('headerAvatarText');
    if (headerAvatarEl) {
        headerAvatarEl.textContent = avatarInitials;
    }

    const sidebarAvatarEl = document.getElementById('sidebarAvatar');
    if (sidebarAvatarEl) {
        sidebarAvatarEl.textContent = avatarInitials;
    }

    const sidebarNameEl = document.getElementById('sidebarUserName');
    if (sidebarNameEl) {
        sidebarNameEl.textContent = fullName;
    }
}


function openSidebar() {
    document.body.classList.add('sidebar-open');
}

function closeSidebar() {
    document.body.classList.remove('sidebar-open');
}

function setupSidebarToggle() {
    const hamburgerBtn = document.getElementById('hamburgerBtn') || document.querySelector('.hamburger-btn');
    const closeBtn = document.getElementById('sidebarCloseBtn');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (document.body.classList.contains('sidebar-open')) {
                closeSidebar();
            } else {
                openSidebar();
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeSidebar();
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', () => {
            closeSidebar();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSidebar();
        }
    });
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Log out of ZENFIT?')) {
                localStorage.removeItem('zenfit_user');
                window.location.href = 'login.html';
            }
        });
    }
}





/* ===========================================
        PERFORMANCE CHART
=========================================== */


function initChart(){


    const canvas =
    document.getElementById("performanceChart");


    if(!canvas) return;



    new Chart(canvas,{


        type:"line",


        data:{


            labels:[
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Sun"
            ],



            datasets:[{


                label:"Performance",


                data:[
                    72,
                    80,
                    77,
                    88,
                    91,
                    95,
                    98
                ],



                borderColor:"#0EA5E9",


                backgroundColor:
                "rgba(14,165,233,.12)",



                fill:true,


                tension:.4,


                borderWidth:3,


                pointRadius:5



            }]



        },



        options:{


            responsive:true,


            maintainAspectRatio:false,



            plugins:{


                legend:{


                    display:false


                }


            }



        }



    });


}







/* ===========================================
        SEARCH ATHLETE
=========================================== */


function initSearch(){


    const search =
    document.getElementById("searchAthlete");



    if(!search) return;



    const cards =
    document.querySelectorAll(".athlete-card");



    search.addEventListener("input",()=>{


        let value =
        search.value.toLowerCase();



        cards.forEach(card=>{


            let name =
            card.querySelector("h3")
            .innerText
            .toLowerCase();



            let sport =
            card.querySelector("span")
            .innerText
            .toLowerCase();



            if(
                name.includes(value)
                ||
                sport.includes(value)
            ){


                card.style.display="block";


            }

            else{


                card.style.display="none";


            }



        });



    });



}








/* ===========================================
        FILTER SYSTEM
=========================================== */


function initFilters(){



    const buttons =
    document.querySelectorAll(".filter-btn");



    const cards =
    document.querySelectorAll(".athlete-card");



    buttons.forEach(button=>{



        button.addEventListener("click",()=>{


            buttons.forEach(btn=>

                btn.classList.remove("active")

            );



            button.classList.add("active");



            let filter =
            button.dataset.filter;



            cards.forEach(card=>{


                let sport =
                card.dataset.sport;



                if(
                    filter==="all"
                    ||
                    sport===filter
                ){


                    card.style.display="block";


                }

                else{


                    card.style.display="none";


                }



            });



        });



    });



}








/* ===========================================
        CARD ANIMATION
=========================================== */


function initAnimations(){

    const cards =
    document.querySelectorAll(
    ".stat-card,.athlete-card"
    );

    const observer =
    new IntersectionObserver(entries=>{

        entries.forEach(entry=>{

            if(entry.isIntersecting){

                entry.target.style.opacity="1";

                entry.target.style.transform=
                "translateY(0)";

                // Remove transition delay once initial reveal completes so hover animations trigger immediately
                setTimeout(()=>{
                    entry.target.style.transition = "";
                }, 800);

            }

        });

    },{

        threshold:.15

    });

    cards.forEach((card,index)=>{

        card.style.opacity="0";

        card.style.transform=
        "translateY(30px)";

        card.style.transition=
        `all .5s ease ${index*.05}s`;

        observer.observe(card);

    });

}







/* ===========================================
        COUNTER ANIMATION
=========================================== */


function initCounter(){



    document
    .querySelectorAll(".stat-card h1")
    .forEach(element=>{



        let original =
        element.innerText;



        let number =
        parseInt(original);



        if(isNaN(number))
        return;



        let suffix =
        original.replace(number,"");



        let start=0;



        let duration=1200;



        let increment =
        number/(duration/16);




        function update(){



            start += increment;



            if(start<number){


                element.innerText =
                Math.floor(start)+suffix;


                requestAnimationFrame(update);


            }

            else{


                element.innerText =
                number+suffix;


            }


        }



        update();



    });



}







/* ===========================================
        RIPPLE EFFECT
=========================================== */


function initRipple(){



    document
    .querySelectorAll("button")
    .forEach(button=>{



        button.addEventListener(
        "click",
        function(e){



            let ripple =
            document.createElement("span");



            let rect =
            this.getBoundingClientRect();



            ripple.className="ripple";



            ripple.style.width=
            ripple.style.height=
            "250px";



            ripple.style.left =
            e.clientX-rect.left-125+"px";



            ripple.style.top =
            e.clientY-rect.top-125+"px";



            this.appendChild(ripple);



            setTimeout(()=>{


                ripple.remove();


            },600);



        });



    });



}







/* ===========================================
        PROFILE MODAL
=========================================== */


function initModal(){



    const modal =
    document.getElementById("athleteModal");



    const close =
    document.querySelector(".close-modal");



    const image =
    document.getElementById("modalImage");



    const name =
    document.getElementById("modalName");



    if(!modal)
    return;




    document
    .querySelectorAll(".view-profile")
    .forEach(button=>{



        button.addEventListener("click",()=>{



            let card =
            button.closest(".athlete-card");



            name.innerText =
            card.querySelector("h3")
            .innerText;



            image.src =
            card.querySelector("img")
            .src;



            modal.classList.add("show");



        });



    });





    close.addEventListener("click",()=>{


        modal.classList.remove("show");


    });





    window.addEventListener("click",(e)=>{


        if(e.target===modal){


            modal.classList.remove("show");


        }


    });



}







/* ===========================================
        SCROLL TOP
=========================================== */


function initScrollTop(){



    const button =
    document.getElementById("scrollTop");



    if(!button)
    return;



    window.addEventListener("scroll",()=>{



        if(window.scrollY>400){


            button.classList.add("show");


        }

        else{


            button.classList.remove("show");


        }



    });





    button.addEventListener("click",()=>{


        window.scrollTo({


            top:0,


            behavior:"smooth"


        });



    });



}


/* ================= BODY MAP ================= */


const exerciseButtons =
document.querySelectorAll(".exercise-btn");


const muscles =
document.querySelectorAll(".muscle");



exerciseButtons.forEach(btn=>{


btn.addEventListener("click",()=>{


    muscles.forEach(m=>
        m.classList.remove("active")
    );


    let target =
    btn.dataset.muscle;



    if(target==="back"){

        document
        .querySelector(".back-muscle")
        ?.classList.add("active");

    }

    else{


        document
        .querySelector(`.${target}`)
        ?.classList.add("active");


    }



});


});





const toggleButtons =
document.querySelectorAll(".body-toggle");


const bodies =
document.querySelectorAll(".body-image");



toggleButtons.forEach((btn,index)=>{


btn.onclick=()=>{


toggleButtons.forEach(b=>
b.classList.remove("active")
);


btn.classList.add("active");



bodies.forEach(b=>
b.classList.remove("active")
);



bodies[index]
.classList.add("active");



}


});



document
.querySelector(".body-image.front")
?.classList.add("active");


const bodyBtn =
document.getElementById("openBodyMap");


const bodyModal =
document.getElementById("bodyModal");


bodyBtn.onclick=()=>{

bodyModal.classList.add("show");

};



document.querySelector(".close-body")
.onclick=()=>{

bodyModal.classList.remove("show");

};





document.querySelectorAll(".exercise-buttons button")
.forEach(btn=>{


btn.onclick=()=>{


document.querySelectorAll(".highlight")
.forEach(h=>h.classList.remove("active"));



let muscle =
btn.dataset.muscle;


document
.querySelectorAll("." + muscle)
.forEach(m=>
m.classList.add("active")
);


};


});





document.querySelector(".front-btn")
.onclick=()=>{


document.querySelector(".front-body")
.style.display="block";


document.querySelector(".back-body")
.style.display="none";


};



document.querySelector(".back-btn")
.onclick=()=>{


document.querySelector(".front-body")
.style.display="none";


document.querySelector(".back-body")
.style.display="block";


};

