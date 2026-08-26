document.addEventListener("DOMContentLoaded", function () {

    "use strict";


    /* =====================================================
       HELPER
    ===================================================== */

    function $(id) {
        return document.getElementById(id);
    }


    /* =====================================================
       PROFILE STORAGE
    ===================================================== */

  const DEFAULT_PROFILE = {
    name: "User",
    email: "user@zenfit.com",
    phone: "",
    password: "",
    gender: "Male",
    age: "25",
    height: "175",
    weight: "70",
    bodyFat: "15%",
    goal: "Maintain Fitness"
};

    function loadProfile() {
        try {
            let activeUser = null;
            try {
                activeUser = JSON.parse(localStorage.getItem("zenfit_user") || "null");
            } catch (e) {}

            const saved = localStorage.getItem("zenfitProfile");
            let savedObj = saved ? JSON.parse(saved) : {};

            let merged = {
                ...DEFAULT_PROFILE,
                ...savedObj
            };

            if (activeUser) {
                merged.name = activeUser.fullName || activeUser.name || merged.name;
                merged.email = activeUser.email || merged.email;
                if (activeUser.gender) merged.gender = activeUser.gender;
                if (activeUser.age) merged.age = activeUser.age;
                if (activeUser.height) merged.height = activeUser.height;
                if (activeUser.weight) merged.weight = activeUser.weight;
                if (activeUser.fitnessGoal || activeUser.goal) merged.goal = activeUser.fitnessGoal || activeUser.goal;
                if (activeUser.password) merged.password = activeUser.password;
                if (activeUser.bmi) merged.bmi = activeUser.bmi;
            }

            if (!activeUser) {
                activeUser = {
                    fullName: merged.name,
                    name: merged.name,
                    email: merged.email,
                    gender: merged.gender,
                    age: merged.age,
                    height: merged.height,
                    weight: merged.weight,
                    goal: merged.goal,
                    fitnessGoal: merged.goal
                };
                localStorage.setItem("zenfit_user", JSON.stringify(activeUser));
            }

            localStorage.setItem("zenfitProfile", JSON.stringify(merged));
            return merged;
        } catch (error) {
            console.error("ZENFIT profile load error:", error);
            return { ...DEFAULT_PROFILE };
        }
    }

    let profile = loadProfile();

    function saveProfile() {
        localStorage.setItem("zenfitProfile", JSON.stringify(profile));

        let currentUser = null;
        try {
            currentUser = JSON.parse(localStorage.getItem("zenfit_user") || "{}");
        } catch(e) { currentUser = {}; }

        currentUser.fullName = profile.name;
        currentUser.name = profile.name;
        currentUser.email = profile.email;
        currentUser.gender = profile.gender;
        currentUser.age = profile.age;
        currentUser.height = profile.height;
        currentUser.weight = profile.weight;
        currentUser.goal = profile.goal;
        currentUser.fitnessGoal = profile.goal;
        if (profile.password) currentUser.password = profile.password;

        localStorage.setItem("zenfit_user", JSON.stringify(currentUser));

        try {
            let users = JSON.parse(localStorage.getItem("zenfit_users") || "[]");
            let idx = users.findIndex(u => u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase());
            if (idx !== -1) {
                users[idx] = { ...users[idx], ...currentUser };
            } else if (currentUser.email) {
                users.push(currentUser);
            }
            localStorage.setItem("zenfit_users", JSON.stringify(users));
        } catch(e) {}
    }



    /* =====================================================
       INITIALIZE NUMERIC STORAGE
    ===================================================== */

    function getNumber(key) {

        const value =
            Number(
                localStorage.getItem(key)
            );

        return Number.isFinite(value)
            ? value
            : 0;
    }


    function setNumber(key, value) {

        localStorage.setItem(
            key,
            String(value)
        );
    }



    /* =====================================================
       GREETING
    ===================================================== */

    function updateGreeting() {

        const greeting = $("greeting");

        if (!greeting) return;


        const hour =
            new Date().getHours();


        let greetingText =
            "Good Morning";


        if (hour >= 12 && hour < 17) {

            greetingText =
                "Good Afternoon";

        } else if (hour >= 17) {

            greetingText =
                "Good Evening";
        }


        const name =
            profile.name &&
            profile.name.trim()
                ? profile.name.trim()
                : "User";


        greeting.textContent =
            `${greetingText}, ${name}! 👋`;
    }



    /* =====================================================
       INITIALS
    ===================================================== */

    function getInitials(name) {

        if (!name || !name.trim()) {
            return "U";
        }


        const parts =
            name
                .trim()
                .split(/\s+/)
                .filter(Boolean);


        if (parts.length === 1) {

            return parts[0]
                .charAt(0)
                .toUpperCase();
        }


        return (
            parts[0].charAt(0) +
            parts[parts.length - 1].charAt(0)
        ).toUpperCase();
    }



    /* =====================================================
       PROFILE UI
    ===================================================== */

    function updateProfileUI() {
        let displayName = profile.name || "User";
        if (displayName.includes("@")) {
            const parts = displayName.split("@");
            if (parts[0]) displayName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        }

        const initials = getInitials(displayName);

        const headerAvatarText = $("headerAvatarText");
        const modalAvatar = $("modalAvatar");
        const sidebarAvatar = $("sidebarAvatar");
        const sidebarUserName = $("sidebarUserName");
        const sidebarUserBadge = $("sidebarUserBadge") || $("sidebarUserEmail");

        if (headerAvatarText) headerAvatarText.textContent = initials;
        if (modalAvatar) modalAvatar.textContent = initials;
        if (sidebarAvatar) sidebarAvatar.textContent = initials;
        if (sidebarUserName) sidebarUserName.textContent = displayName;
        if (sidebarUserBadge) {
            sidebarUserBadge.textContent = "👑 Pro Member 👋";
            sidebarUserBadge.style.color = "#FF7043";
            sidebarUserBadge.style.fontWeight = "600";
        }

        updateGreeting();
    }



    /* =====================================================
       SIDEBAR
    ===================================================== */

    const sidebar =
        $("sidebar");

    const sidebarOverlay =
        $("sidebarOverlay");

    const hamburgerBtn =
        $("hamburgerBtn");

    const sidebarClose =
        $("sidebarClose");


 function openSidebar(){
    if(sidebar){
        sidebar.classList.add("open");
    }
    if(sidebarOverlay){
        sidebarOverlay.classList.add("open");
    }
    document.body.classList.add("sidebar-open");
}

function closeSidebar(){
    if(sidebar){
        sidebar.classList.remove("open");
    }
    if(sidebarOverlay){
        sidebarOverlay.classList.remove("open");
    }
    document.body.classList.remove("sidebar-open");
    if (
        !$("profileModalOverlay") ||
        !$("profileModalOverlay").classList.contains("show")
    ) {
        document.body.style.overflow = "";
    }
}

/* =====================================================
   LOGOUT
===================================================== */

const menuLogout =
    $("menuLogout");

if(menuLogout){
    menuLogout.addEventListener(
        "click",
        function(e){
            e.preventDefault();
            const confirmLogout =
                confirm(
                    "Are you sure you want to logout?"
                );
            if(!confirmLogout){
                return;
            }
            localStorage.removeItem("zenfit_user");
            window.location.href="login.html";
        }
    );
}

    if (hamburgerBtn) {

        hamburgerBtn.addEventListener(
            "click",
            openSidebar
        );
    }


    if (sidebarClose) {

        sidebarClose.addEventListener(
            "click",
            closeSidebar
        );
    }


    if (sidebarOverlay) {

        sidebarOverlay.addEventListener(
            "click",
            closeSidebar
        );
    }



    /* =====================================================
       PROFILE MODAL
    ===================================================== */

    const profileModalOverlay =
        $("profileModalOverlay");


    function clearErrors() {

        const errorIds = [
            "nameError",
            "emailError",
            "phoneError",
            "passwordError",
            "confirmPasswordError"
        ];


        errorIds.forEach(function (id) {

            const element = $(id);

            if (element) {
                element.textContent = "";
            }

        });


        document
            .querySelectorAll(".form-input.error")
            .forEach(function (input) {

                input.classList.remove(
                    "error"
                );
            });
    }



    function openProfileModal() {

        if (!profileModalOverlay) {
            return;
        }


        closeSidebar();


        $("editFullName").value =
            profile.name || "";


        $("editEmail").value =
            profile.email || "";


        $("editPhone").value =
            profile.phone || "";


        $("editPassword").value =
            "";


        $("editConfirmPassword").value =
            "";

        $("editAge").value =
profile.age || "";


$("editGender").value =
profile.gender || "";


$("editHeight").value =
profile.height || "";


$("editWeight").value =
profile.weight || "";


$("editGoal").value =
profile.goal || "";


        clearErrors();


        const saveMessage =
            $("saveMessage");


        if (saveMessage) {

            saveMessage.classList.remove(
                "show"
            );
        }


        profileModalOverlay.classList.add(
            "show"
        );


        document.body.style.overflow =
            "hidden";


        setTimeout(function () {

            const nameInput =
                $("editFullName");

            if (nameInput) {
                nameInput.focus();
            }

        }, 100);
    }



    function closeProfileModal() {
        if (!profileModalOverlay) {
            return;
        }

        profileModalOverlay.classList.remove(
            "show"
        );

        document.body.classList.remove(
            "sidebar-open"
        );

        document.body.style.overflow =
            "";
    }



    const headerAvatar =
        $("headerAvatar");


    if (headerAvatar) {

        headerAvatar.style.cursor = "pointer";

        headerAvatar.addEventListener(
            "click",
            function () {
                window.location.href = "personal_details.html";
            }
        );


        headerAvatar.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" ||
                    event.key === " "
                ) {

                    event.preventDefault();

                    window.location.href = "personal_details.html";
                }
            }
        );
    }



    const closeProfileModalBtn =
        $("closeProfileModal");


    if (closeProfileModalBtn) {

        closeProfileModalBtn.addEventListener(
            "click",
            closeProfileModal
        );
    }



    const cancelProfile =
        $("cancelProfile");


    if (cancelProfile) {

        cancelProfile.addEventListener(
            "click",
            closeProfileModal
        );
    }



    if (profileModalOverlay) {

        profileModalOverlay.addEventListener(
            "click",
            function (event) {

                if (
                    event.target ===
                    profileModalOverlay
                ) {

                    closeProfileModal();
                }
            }
        );
    }



    /* =====================================================
       FORM ERROR
    ===================================================== */

    function clearErrors() {
        const errorIds = ["nameError", "emailError", "phoneError", "passwordError", "confirmPasswordError", "ageError", "heightError", "weightError"];
        const inputIds = ["editFullName", "editEmail", "editPhone", "editPassword", "editConfirmPassword", "editAge", "editHeight", "editWeight"];

        errorIds.forEach(id => {
            const el = $(id);
            if (el) el.textContent = "";
        });

        inputIds.forEach(id => {
            const el = $(id);
            if (el) el.classList.remove("error");
        });
    }

    function showError(
        inputId,
        errorId,
        message
    ) {

        const input =
            $(inputId);

        const error =
            $(errorId);


        if (input) {

            input.classList.add(
                "error"
            );
        }


        if (error) {

            error.textContent =
                message;
        }
    }



    /* =====================================================
       PROFILE VALIDATION
    ===================================================== */

    function validateProfile() {

        clearErrors();


        let valid = true;


        const name =
            $("editFullName")
                .value
                .trim();


        const email =
            $("editEmail")
                .value
                .trim();


        const phone =
            $("editPhone")
                .value
                .trim();


        const password =
            $("editPassword")
                .value;


        const confirmPassword =
            $("editConfirmPassword")
                .value;



        /* NAME */

        if (name.length < 2) {

            showError(
                "editFullName",
                "nameError",
                "Please enter your full name."
            );

            valid = false;
        }



        /* EMAIL */

        if (!email) {

            showError(
                "editEmail",
                "emailError",
                "Please enter your email."
            );

            valid = false;

        } else {

            const emailRegex =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            if (!emailRegex.test(email)) {

                showError(
                    "editEmail",
                    "emailError",
                    "Please enter a valid email."
                );

                valid = false;
            }
        }



        /* PHONE */

        if (phone) {

            const digits =
                phone.replace(
                    /\D/g,
                    ""
                );


            if (digits.length < 10) {

                showError(
                    "editPhone",
                    "phoneError",
                    "Please enter a valid phone number."
                );

                valid = false;
            }
        }



        /* PASSWORD */

        if (password) {

            if (password.length < 6) {

                showError(
                    "editPassword",
                    "passwordError",
                    "Password must be at least 6 characters."
                );

                valid = false;
            }


            if (
                password !==
                confirmPassword
            ) {

                showError(
                    "editConfirmPassword",
                    "confirmPasswordError",
                    "Passwords do not match."
                );

                valid = false;
            }
        }


        /* AGE */
        const ageInput = $("editAge");
        if (ageInput && ageInput.value) {
            const ageNum = parseFloat(ageInput.value);
            if (isNaN(ageNum) || ageNum <= 0 || ageNum > 120) {
                showError("editAge", "ageError", "Age must be a valid positive number (1-120).");
                valid = false;
            }
        }

        /* HEIGHT */
        const heightInput = $("editHeight");
        if (heightInput && heightInput.value) {
            const heightNum = parseFloat(heightInput.value);
            if (isNaN(heightNum) || heightNum <= 0 || heightNum > 300) {
                showError("editHeight", "heightError", "Height must be a valid positive number (cm).");
                valid = false;
            }
        }

        /* WEIGHT */
        const weightInput = $("editWeight");
        if (weightInput && weightInput.value) {
            const weightNum = parseFloat(weightInput.value);
            if (isNaN(weightNum) || weightNum <= 0 || weightNum > 500) {
                showError("editWeight", "weightError", "Weight must be a valid positive number (kg).");
                valid = false;
            }
        }

        return valid;
    }



    /* =====================================================
       SAVE PROFILE
    ===================================================== */

    const saveProfileChanges =
        $("saveProfileChanges");


    if (saveProfileChanges) {

        saveProfileChanges.addEventListener(
            "click",
            function () {

                if (!validateProfile()) {
                    return;
                }


                profile.name =
                    $("editFullName")
                        .value
                        .trim();


                profile.email =
                    $("editEmail")
                        .value
                        .trim();


                profile.phone =
                    $("editPhone")
                        .value
                        .trim();


                profile.age =
$("editAge").value;


profile.gender =
$("editGender").value;


profile.height =
$("editHeight").value;


profile.weight =
$("editWeight").value;


profile.goal =
$("editGoal").value;



                const newPassword =
                    $("editPassword").value;


                if (newPassword) {

                    profile.password =
                        newPassword;
                }


                saveProfile();


                updateProfileUI();


                calculateBodyStats();


                updateDashboard();


                const saveMessage =
                    $("saveMessage");


                if (saveMessage) {

                    saveMessage.classList.add(
                        "show"
                    );
                }


                setTimeout(
                    closeProfileModal,
                    1000
                );

            }
        );
    }



    /* =====================================================
       BODY STATS
    ===================================================== */

    function calculateBodyStats() {

        const height =
            parseFloat(profile.height);


        const weight =
            parseFloat(profile.weight);


        const age =
            parseFloat(profile.age);


        const bmiElement =
            $("bmiValue");


        const heightElement =
            $("heightValue");


        const weightElement =
            $("weightValue");


        const bmrElement =
            $("bmrValue");


        if (heightElement) {

            heightElement.textContent =
                height > 0
                    ? `${height} cm`
                    : "--";
        }


        if (weightElement) {

            weightElement.textContent =
                weight > 0
                    ? `${weight} kg`
                    : "--";
        }


        if (
            height > 0 &&
            weight > 0
        ) {

            const heightMeters =
                height / 100;


            const bmi =
                weight /
                (heightMeters * heightMeters);


            if (bmiElement) {

                bmiElement.textContent =
                    bmi.toFixed(1);
            }


        } else {

            if (bmiElement) {
                bmiElement.textContent =
                    "--";
            }
        }


        const goalElement =
$("goalValue");


if(goalElement){

goalElement.textContent =
profile.goal || "--";

}




        /* BMR */

        if (
            height > 0 &&
            weight > 0 &&
            age > 0
        ) {

            let bmr;


            if (
                String(profile.gender)
                    .toLowerCase()
                    .startsWith("m")
            ) {

                bmr =
                    10 * weight +
                    6.25 * height -
                    5 * age +
                    5;

            } else {

                bmr =
                    10 * weight +
                    6.25 * height -
                    5 * age -
                    161;
            }


            if (bmrElement) {

                bmrElement.textContent =
                    `${Math.round(bmr)} kcal`;
            }


            const calorieValue =
                $("calorieNeedValue");


            const calorieBar =
                $("calorieNeedProgressBar");


            const calorieLabel =
                $("calorieNeedProgressLabel");


            if (calorieValue) {

                calorieValue.textContent =
                    Math.round(bmr);
            }


            if (calorieBar) {

                calorieBar.style.setProperty(
                    "--progress",
                    "100%"
                );
            }


            if (calorieLabel) {

                calorieLabel.textContent =
                    "Estimated daily need";
            }


        } else {

            if (bmrElement) {
                bmrElement.textContent =
                    "--";
            }


            const calorieValue =
                $("calorieNeedValue");


            const calorieBar =
                $("calorieNeedProgressBar");


            const calorieLabel =
                $("calorieNeedProgressLabel");


            if (calorieValue) {
                calorieValue.textContent =
                    "0";
            }


            if (calorieBar) {

                calorieBar.style.setProperty(
                    "--progress",
                    "0%"
                );
            }


            if (calorieLabel) {

                calorieLabel.textContent =
                    "Complete profile to calculate";
            }
        }
    }



    /* =====================================================
       FITNESS SCORE
    ===================================================== */

    function updateFitnessScore() {

        const sessions =
            getNumber(
                "zenfitWorkoutSessions"
            );


        const distance =
            getNumber(
                "zenfitDistance"
            );


        let score = 0;


        score += Math.min(
            sessions * 10,
            40
        );


        score += Math.min(
            distance * 5,
            30
        );


        if (
            profile.name &&
            profile.name !== "User"
        ) {

            score += 15;
        }


        if (
            profile.height &&
            profile.weight
        ) {

            score += 15;
        }


        score =
            Math.min(
                Math.round(score),
                100
            );


        const scoreElement =
            $("fitnessScore");


        const scoreRing =
            $("scoreRing");


        const scoreLabel =
            $("scoreLabel");


        if (scoreElement) {

            scoreElement.textContent =
                score;
        }


        if (scoreRing) {

            scoreRing.style.setProperty(
                "--score-degree",
                `${score * 3.6}deg`
            );
        }


        if (scoreLabel) {

            if (score === 0) {

                scoreLabel.textContent =
                    "No Activity Yet";

            } else if (score < 40) {

                scoreLabel.textContent =
                    "Getting Started";

            } else if (score < 70) {

                scoreLabel.textContent =
                    "Good";

            } else {

                scoreLabel.textContent =
                    "Excellent";
            }
        }
    }



    /* =====================================================
       DASHBOARD
    ===================================================== */

    function updateDashboard() {

        const distance =
            getNumber(
                "zenfitDistance"
            );


        const sessions =
            getNumber(
                "zenfitWorkoutSessions"
            );


        const calories =
            getNumber(
                "zenfitCalories"
            );



        /* DISTANCE */

        const distanceValue =
            $("distanceTopValue");


        const distanceBar =
            $("distanceProgressBar");


        const distanceLabel =
            $("distanceProgressLabel");


        if (distanceValue) {

            distanceValue.textContent =
                distance.toFixed(1);
        }


        const distancePercent =
            Math.min(
                (distance / 5) * 100,
                100
            );


        if (distanceBar) {

            distanceBar.style.setProperty(
                "--progress",
                `${distancePercent}%`
            );
        }


        if (distanceLabel) {

            distanceLabel.textContent =
                `${Math.round(distancePercent)}% of your goal`;
        }



        /* WORKOUT */

        const workoutValue =
            $("workoutSessionsValue");


        const workoutBar =
            $("workoutSessionsProgressBar");


        const workoutLabel =
            $("workoutSessionsProgressLabel");


        if (workoutValue) {

            workoutValue.textContent =
                sessions;
        }


        const workoutPercent =
            Math.min(
                (sessions / 5) * 100,
                100
            );


        if (workoutBar) {

            workoutBar.style.setProperty(
                "--progress",
                `${workoutPercent}%`
            );
        }


        if (workoutLabel) {

            workoutLabel.textContent =
                `${Math.round(workoutPercent)}% of your goal`;
        }



        /* CALORIES */

        if (
            !profile.height ||
            !profile.weight ||
            !profile.age
        ) {

            const calorieValue =
                $("calorieNeedValue");


            const calorieBar =
                $("calorieNeedProgressBar");


            const calorieLabel =
                $("calorieNeedProgressLabel");


            if (calorieValue) {
                calorieValue.textContent =
                    calories || 0;
            }


            if (calorieBar) {

                calorieBar.style.setProperty(
                    "--progress",
                    calories
                        ? "50%"
                        : "0%"
                );
            }


            if (calorieLabel) {

                calorieLabel.textContent =
                    calories
                        ? "Activity calories"
                        : "Complete profile to calculate";
            }
        }


        updateFitnessScore();
    }



    /* =====================================================
       HEATMAP
    ===================================================== */

    function generateHeatmap() {

        const heatmap =
            $("heatmap");


        if (!heatmap) {
            return;
        }


        heatmap.innerHTML =
            "";


        const activityData =
            getActivityData();


        const totalCells =
            35;


        for (
            let i = 0;
            i < totalCells;
            i++
        ) {

            const cell =
                document.createElement("div");


            cell.className =
                "heat-cell";


           const level =
    activityData[i] || 0;


cell.dataset.level =
    level;


/* PROFESSIONAL HEAT COLOR */

if(level === 1){

    cell.style.background =
        "#d9f99d";

}
else if(level === 2){

    cell.style.background =
        "#86efac";

}
else if(level === 3){

    cell.style.background =
        "#22c55e";

}
else if(level >= 4){

    cell.style.background =
        "#15803d";

}
else{

    cell.style.background =
        "#edf2f5";

}



cell.title =
    level === 0
        ? "No workout"
        : `Workout intensity: ${level}/4`;


            heatmap.appendChild(
                cell
            );
        }
    }


    function updateHeatmapStats(){

    const sessions =
        getNumber(
            "zenfitWorkoutSessions"
        );


    const distance =
        getNumber(
            "zenfitDistance"
        );


    const calories =
        getNumber(
            "zenfitCalories"
        );


    const days =
        $("heatWorkoutDays");


    const km =
        $("heatDistance");


    const cal =
        $("heatCalories");



    if(days){
        days.textContent =
            sessions;
    }


    if(km){
        km.textContent =
            distance.toFixed(1)+" km";
    }


    if(cal){
        cal.textContent =
            calories+" kcal";
    }

}




    function getActivityData() {
        let data = [];
        try {
            data = JSON.parse(localStorage.getItem("zenfitActivityData") || "[]");
        } catch(e) { data = []; }

        if (!Array.isArray(data)) data = [];

        let sessions = getNumber("zenfitWorkoutSessions");
        if (sessions > 0 && data.length === 0) {
            data = Array.from({ length: Math.min(sessions, 35) }, () => Math.floor(Math.random() * 4) + 1);
            localStorage.setItem("zenfitActivityData", JSON.stringify(data));
        }

        let padded = [...data];
        while (padded.length < 35) {
            padded.unshift(0);
        }
        if (padded.length > 35) {
            padded = padded.slice(padded.length - 35);
        }
        return padded;
    }



    /* =====================================================
       LATEST ACTIVITY
    ===================================================== */

    /* =====================================================
       LATEST ACTIVITY (Connected to GPS Tracking)
    ===================================================== */

    function updateLatestActivity() {
        let latestSession = null;
        try {
            const savedLatest = localStorage.getItem("zenfit_latest_activity");
            if (savedLatest) {
                latestSession = JSON.parse(savedLatest);
            }
            if (!latestSession) {
                const sessions = JSON.parse(localStorage.getItem("zenfit_gps_sessions") || "[]");
                if (Array.isArray(sessions) && sessions.length > 0) {
                    latestSession = sessions[sessions.length - 1];
                }
            }
        } catch (e) {
            console.warn("Could not load latest GPS session:", e);
        }

        const distance = latestSession ? (latestSession.distanceKm || (latestSession.distanceMeters / 1000) || 0) : getNumber("zenfitDistance");
        const duration = latestSession ? (latestSession.durationText || "00:00") : (localStorage.getItem("zenfitDuration") || "00:00");
        const calories = latestSession ? (latestSession.calories || 0) : getNumber("zenfitCalories");
        const activityName = latestSession ? (latestSession.name || "GPS Outdoor Workout") : (localStorage.getItem("zenfitActivityName") || "Outdoor Run Overview");
        const activityTime = latestSession ? (latestSession.timestamp || "Recently Completed") : (localStorage.getItem("zenfitActivityTime") || "Live GPS Tracking");

        const distanceElement = $("activityDistance");
        const durationElement = $("activityDuration");
        const caloriesElement = $("activityCalories");
        const nameElement = $("activityName");
        const timeElement = $("activityTime");
        const badgeElement = $("activityBadge");

        if (distanceElement) distanceElement.textContent = typeof distance === 'number' ? `${distance.toFixed(1)} km` : distance;
        if (durationElement) durationElement.textContent = duration;
        if (caloriesElement) caloriesElement.textContent = calories;

        if (nameElement) nameElement.textContent = activityName;
        if (timeElement) timeElement.textContent = activityTime;
        if (badgeElement) {
            badgeElement.textContent = latestSession ? "📍 GPS Verified Route" : "📍 GPS Ready";
        }

        // Setup Map Container & Redirect Handler (ONLY Map part redirects to gps.html)
        const mapContainer = $("activityMap");
        if (mapContainer) {
            // Add click listener ONLY on map part to direct to gps.html
            mapContainer.onclick = function (e) {
                e.stopPropagation();
                window.location.href = "gps.html";
            };

            // Render Leaflet Mini Route Map Overview inside activityMap
            if (typeof L !== 'undefined') {
                if (window.dashboardMiniMap) {
                    try { window.dashboardMiniMap.remove(); } catch (err) {}
                    window.dashboardMiniMap = null;
                }

                // Preserve or add hover hint tag
                let hintEl = mapContainer.querySelector(".map-hover-hint");
                if (!hintEl) {
                    hintEl = document.createElement("div");
                    hintEl.className = "map-hover-hint";
                    hintEl.textContent = "📍 Click map for GPS Tracker ↗";
                    mapContainer.appendChild(hintEl);
                }

                try {
                    const miniMap = L.map("activityMap", {
                        zoomControl: false,
                        attributionControl: false,
                        dragging: false,
                        scrollWheelZoom: false,
                        doubleClickZoom: false,
                        boxZoom: false,
                        keyboard: false,
                        touchZoom: false
                    });
                    window.dashboardMiniMap = miniMap;

                    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                        maxZoom: 18
                    }).addTo(miniMap);

                    let routeCoords = [];
                    if (latestSession && Array.isArray(latestSession.points) && latestSession.points.length > 0) {
                        routeCoords = latestSession.points.map(pt => [pt.lat, pt.lng]);
                    } else {
                        // Sample scenic overview route for visual excellence when no session is recorded yet
                        routeCoords = [
                            [28.6139, 77.2090],
                            [28.6160, 77.2115],
                            [28.6195, 77.2140],
                            [28.6210, 77.2185],
                            [28.6235, 77.2200]
                        ];
                    }

                    if (routeCoords.length > 0) {
                        const polyline = L.polyline(routeCoords, {
                            color: "#00BCD4",
                            weight: 5,
                            opacity: 0.9,
                            lineJoin: "round"
                        }).addTo(miniMap);

                        // Start Marker
                        L.circleMarker(routeCoords[0], {
                            radius: 6,
                            fillColor: "#10B981",
                            color: "#FFFFFF",
                            weight: 2,
                            fillOpacity: 1
                        }).addTo(miniMap);

                        // End Marker
                        L.circleMarker(routeCoords[routeCoords.length - 1], {
                            radius: 6,
                            fillColor: "#FF7043",
                            color: "#FFFFFF",
                            weight: 2,
                            fillOpacity: 1
                        }).addTo(miniMap);

                        miniMap.fitBounds(polyline.getBounds(), { padding: [18, 18] });
                    }
                } catch (mapErr) {
                    console.warn("Could not render mini Leaflet map:", mapErr);
                }
            }
        }
    }



    /* =====================================================
       BODY DETAILS BUTTON
    ===================================================== */

    const bodyDetailsBtn =
        $("bodyDetailsBtn");


    // if (bodyDetailsBtn) {

    //     bodyDetailsBtn.addEventListener(
    //         "click",
    //         function () {

    //             if (
    //                 profile.height &&
    //                 profile.weight
    //             ) {

    //                 const bmi =
    //                     $("bmiValue")
    //                         ? $("bmiValue")
    //                             .textContent
    //                         : "--";


    //                 alert(
    //                     `Body Details\n\n` +
    //                     `BMI: ${bmi}\n` +
    //                     `Height: ${profile.height} cm\n` +
    //                     `Weight: ${profile.weight} kg`
    //                 );

    //             } else {

    //                 openProfileModal();

    //             }
    //         }
    //     );
    // }



    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    const notifBtn =
        $("notifBtn");


    if (notifBtn) {

        notifBtn.addEventListener(
            "click",
            function () {

                alert(
                    "🔔 You have no new notifications."
                );
            }
        );
    }



    /* =====================================================
       SIDEBAR MENU
    ===================================================== */

    const menuDashboard =
        $("menuDashboard");


    if (menuDashboard) {

        menuDashboard.addEventListener(
            "click",
            function () {

                closeSidebar();


                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });
            }
        );
    }


    const menuWorkout =
$("menuWorkout");


if(menuWorkout){

    menuWorkout.addEventListener(
        "click",
        function(){

            window.location.href =
            "workout.html";

        }
    );

}




    const menuProfile =
        $("menuProfile");


    if (menuProfile) {

        menuProfile.addEventListener(
            "click",
            function () {

                closeSidebar();

                openProfileModal();
            }
        );
    }



const menuHealth = $("menuHealth");

document.getElementById("menuHealth")?.addEventListener("click", function(){
    closeSidebar();
    window.location.href = "health.html";
});

document.getElementById("menuGPS")?.addEventListener("click", function(){
    closeSidebar();
    window.location.href = "gps.html";
});

const menuNutrition = $("menuNutrition");

document.getElementById("menuNutrition")?.addEventListener("click", function(){
    closeSidebar();
    window.location.href = "nutrition.html";
});


    const menuAthletes =
        $("menuAthletes");


    if (menuAthletes) {

        menuAthletes.addEventListener(
            "click",
            function () {

                window.location.href =
                    "athletes.html";
            }
        );
    }



    const menuNotifications =
        $("menuNotifications");


    if (menuNotifications) {

        menuNotifications.addEventListener(
            "click",
            function () {

                closeSidebar();


                if (notifBtn) {
                    notifBtn.click();
                }
            }
        );
    }



    /* =====================================================
       RESET DASHBOARD
    ===================================================== */

    if (menuReset) {
        menuReset.addEventListener(
            "click",
            function () {
                const confirmed = confirm(
                    "Reset all saved ZENFIT activity and body metrics? (Your username & email will be preserved)"
                );

                if (!confirmed) {
                    return;
                }

                // Preserve username, email, password
                let preservedName = profile.name || "User";
                let preservedEmail = profile.email || "user@zenfit.com";
                let preservedPassword = profile.password || "";

                try {
                    const active = JSON.parse(localStorage.getItem("zenfit_user") || "null");
                    if (active) {
                        preservedName = active.fullName || active.name || preservedName;
                        preservedEmail = active.email || preservedEmail;
                        if (active.password) preservedPassword = active.password;
                    }
                } catch(e) {}

                const keys = [
                    "zenfitProfile",
                    "zenfitDistance",
                    "zenfitWorkoutSessions",
                    "zenfitCalories",
                    "zenfitDuration",
                    "zenfitActivityName",
                    "zenfitActivityTime",
                    "zenfitActivityData",
                    "zenfitMealData",
                    "zenfitSleepData",
                    "zenfitWaterIntake"
                ];

                keys.forEach(function (key) {
                    localStorage.removeItem(key);
                });

                const resetProfile = {
                    name: preservedName,
                    email: preservedEmail,
                    phone: "",
                    password: preservedPassword,
                    gender: "",
                    age: "",
                    height: "",
                    weight: "",
                    bodyFat: "",
                    goal: ""
                };

                const resetUser = {
                    fullName: preservedName,
                    name: preservedName,
                    email: preservedEmail,
                    password: preservedPassword,
                    gender: "",
                    age: "",
                    height: "",
                    weight: "",
                    goal: "",
                    fitnessGoal: "",
                    bmi: null
                };

                localStorage.setItem("zenfitProfile", JSON.stringify(resetProfile));
                localStorage.setItem("zenfit_user", JSON.stringify(resetUser));

                profile = resetProfile;

                updateProfileUI();
                calculateBodyStats();
                updateDashboard();
                updateLatestActivity();
                generateHeatmap();
                updateFitnessScore();

                closeSidebar();
                alert("Activity metrics reset successfully! Username and email preserved.");
            }
        );
    }



    /* =====================================================
       BOTTOM TABS
    ===================================================== */

    const tabs =
        document.querySelectorAll(
            ".bottom-tab"
        );


    tabs.forEach(function (tab) {

        tab.addEventListener(
            "click",
            function () {


                tabs.forEach(
                    function (item) {

                        item.classList.remove(
                            "active"
                        );
                    }
                );


                tab.classList.add(
                    "active"
                );



                /* DAILY */

                if (
                    tab.id ===
                    "tab-daily"
                ) {

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });
                }



                /* HEALTH */

                if(tab.id === "tab-health") {
                    window.location.href = "health.html";
                }



                /* ATHLETES */

                if (
                    tab.id ===
                    "tab-athletes"
                ) {

                    window.location.href =
                        "athletes.html";
                }

            }
        );
    });



    /* =====================================================
       ESC KEY
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key !==
                "Escape"
            ) {
                return;
            }


            closeSidebar();
            closeProfileModal();

        }
    );



    /* =====================================================
       CLICK OUTSIDE / ESC
    ===================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                event.target ===
                $("editConfirmPassword")
            ) {

                event.preventDefault();

                if (saveProfileChanges) {
                    saveProfileChanges.click();
                }
            }
        }
    );



    /* =====================================================
       UPDATE MONTH
    ===================================================== */

    function updateHeatmapMonth() {

        const monthElement =
            $("heatmapMonth");


        if (!monthElement) {
            return;
        }


        const date =
            new Date();


        const month =
            date.toLocaleString(
                "en-US",
                {
                    month: "long"
                }
            );


        const year =
            date.getFullYear();


        monthElement.textContent =
            `${month} ${year}`;
    }



    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    updateProfileUI();

    calculateBodyStats();

    updateDashboard();

    updateLatestActivity();

    updateHeatmapMonth();

    generateHeatmap();

    updateHeatmapStats();


    console.log(
        "ZENFIT Dashboard: READY"
    );

});


document.addEventListener("DOMContentLoaded",()=>{


const user =
JSON.parse(
localStorage.getItem("zenfit_user")
);



if(!user) return;



let name =
document.getElementById("userName");


if(name){

name.innerHTML =
user.fullName;

}



});


document.getElementById("tab-health")?.addEventListener("click", function(){
    window.location.href = "health.html";
});

