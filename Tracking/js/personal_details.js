document.addEventListener("DOMContentLoaded", () => {
    let user = null;
    try {
        user = JSON.parse(localStorage.getItem('zenfit_user') || 'null');
    } catch (e) {
        user = null;
    }

    if (!user) {
        window.location.href = "login.html";
        return;
    }

    const fullName = user.fullName || user.name || "User";
    const initials = fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || "U";

    const initialsEl = document.getElementById("profileInitials");
    if (initialsEl) initialsEl.textContent = initials;

    const nameEl = document.getElementById("profileName");
    if (nameEl) nameEl.textContent = fullName;

    const emailEl = document.getElementById("profileEmail");
    if (emailEl) emailEl.textContent = user.email || "user@zenfit.com";

    const ageEl = document.getElementById("profileAge");
    if (ageEl) ageEl.textContent = user.age || "—";

    const genderEl = document.getElementById("profileGender");
    if (genderEl) genderEl.textContent = user.gender || "—";

    const heightEl = document.getElementById("profileHeight");
    if (heightEl) heightEl.textContent = user.height ? `${user.height} cm` : "—";

    const weightEl = document.getElementById("profileWeight");
    if (weightEl) weightEl.textContent = user.weight ? `${user.weight} kg` : "—";

    // Recalculate BMI if needed
    let bmiVal = user.bmi;
    if (!bmiVal && user.height && user.weight) {
        const hM = parseFloat(user.height) / 100;
        const wKg = parseFloat(user.weight);
        if (hM > 0 && wKg > 0) {
            bmiVal = (wKg / (hM * hM)).toFixed(1);
        }
    }
    const bmiEl = document.getElementById("profileBMI");
    if (bmiEl) bmiEl.textContent = bmiVal || "—";

    // Backdrop click & Escape key return to dashboard
    const backdrop = document.getElementById("modalBackdrop");
    if (backdrop) {
        backdrop.addEventListener("click", () => {
            window.location.href = "dashboard.html";
        });
    }

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            window.location.href = "dashboard.html";
        }
    });
});