document.addEventListener("DOMContentLoaded", function () {
    "use strict";

    /* =====================================================
       DOM HELPERS
    ===================================================== */
    function $(id) {
        return document.getElementById(id);
    }

    /* =====================================================
       PROFILE & SIDEBAR LOGIC
    ===================================================== */
    const DEFAULT_PROFILE = {
        name: "User",
        email: "user@zenfit.com"
    };

    function loadProfile() {
        try {
            const saved = localStorage.getItem("zenfitProfile");
            const activeUser = JSON.parse(localStorage.getItem("zenfit_user") || "null");
            let merged = saved ? JSON.parse(saved) : DEFAULT_PROFILE;
            if (activeUser) {
                merged.name = activeUser.fullName || activeUser.name || merged.name;
                merged.email = activeUser.email || merged.email;
            }
            return merged;
        } catch (e) {
            return DEFAULT_PROFILE;
        }
    }

    const profile = loadProfile();

    function getInitials(name) {
        if (!name || !name.trim()) return "U";
        const parts = name.trim().split(/\s+/).filter(Boolean);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }

    function updateProfileUI() {
        const displayName = profile.name || "User";
        const initials = getInitials(displayName);
        if ($("headerAvatarText")) $("headerAvatarText").textContent = initials;
        if ($("sidebarAvatar")) $("sidebarAvatar").textContent = initials;
        if ($("sidebarUserName")) $("sidebarUserName").textContent = displayName;
        if ($("sidebarUserEmail")) $("sidebarUserEmail").textContent = profile.email || "ZenFit Member";
    }

    // Sidebar toggles
    const sidebar = $("sidebar");
    const sidebarOverlay = $("sidebarOverlay");
    const hamburgerBtn = $("hamburgerBtn");
    const sidebarClose = $("sidebarClose");

    function openSidebar() {
        if (sidebar) sidebar.classList.add("open");
        if (sidebarOverlay) sidebarOverlay.classList.add("open");
        document.body.classList.add("sidebar-open");
    }

    function closeSidebar() {
        if (sidebar) sidebar.classList.remove("open");
        if (sidebarOverlay) sidebarOverlay.classList.remove("open");
        document.body.classList.remove("sidebar-open");
    }

    if (hamburgerBtn) hamburgerBtn.addEventListener("click", openSidebar);
    if (sidebarClose) sidebarClose.addEventListener("click", closeSidebar);
    if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

    if ($("menuLogout")) {
        $("menuLogout").addEventListener("click", function (e) {
            e.preventDefault();
            if (confirm("Are you sure you want to logout?")) {
                localStorage.removeItem("zenfit_user");
                window.location.href = "login.html";
            }
        });
    }

    updateProfileUI();

    /* =====================================================
       GPS TRACKING CORE
    ===================================================== */
    let map = null;
    let polyline = null;
    let userMarker = null;
    let startMarker = null;
    let accuracyCircle = null;

    let isTracking = false;
    let watchId = null;
    let simInterval = null;
    let timerInterval = null;

    let routePoints = []; // [{lat, lng, timestamp, speed}]
    let totalDistanceMeters = 0;
    let startTime = null;
    let elapsedSeconds = 0;
    let currentSpeedKmh = 0;

    const DEFAULT_CENTER = [28.6139, 77.2090]; // Default fallback location

    // Banner message helper
    function showBanner(msg, type = "info") {
        const banner = $("gpsStatusBanner");
        const icon = $("gpsBannerIcon");
        const msgEl = $("gpsBannerMsg");
        if (!banner || !msgEl) return;

        banner.className = `gps-banner show ${type}`;
        if (icon) {
            icon.textContent = type === "warning" ? "⚠️" : type === "error" ? "❌" : "ℹ️";
        }
        msgEl.textContent = msg;
    }

    function hideBanner() {
        const banner = $("gpsStatusBanner");
        if (banner) banner.className = "gps-banner";
    }

    // Initialize Map
    function initMap() {
        if (typeof L === "undefined") {
            showBanner("Leaflet library not loaded. Please refresh.", "error");
            return;
        }

        const mapEl = $("map");
        if (!mapEl) return;

        // Prevent duplicate initialization error
        if (map !== null) {
            try { map.remove(); } catch(e) {}
            map = null;
        }

        try {
            map = L.map("map", {
                zoomControl: true
            }).setView(DEFAULT_CENTER, 15);

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                maxZoom: 19,
                subdomains: ["a", "b", "c"],
                attribution: "© OpenStreetMap contributors"
            }).addTo(map);

            polyline = L.polyline([], {
                color: "#00BCD4",
                weight: 5,
                opacity: 0.9,
                lineJoin: "round"
            }).addTo(map);

            // Ensure map recalculates size properly after rendering across all device scales & orientations
            [100, 300, 600, 1200].forEach(function (delay) {
                setTimeout(function () {
                    if (map) map.invalidateSize();
                }, delay);
            });

            // Attempt initial location centering
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    function (pos) {
                        const lat = pos.coords.latitude;
                        const lng = pos.coords.longitude;
                        if (map) map.setView([lat, lng], 16);
                        if (!userMarker && map) {
                            userMarker = L.circleMarker([lat, lng], {
                                radius: 8,
                                fillColor: "#00BCD4",
                                color: "#FFFFFF",
                                weight: 3,
                                fillOpacity: 1
                            }).addTo(map).bindPopup("Current Position");
                        } else if (userMarker) {
                            userMarker.setLatLng([lat, lng]);
                        }
                    },
                    function (err) {
                        console.log("Initial geolocation fallback used.");
                    },
                    { enableHighAccuracy: true, timeout: 5000 }
                );
            }
        } catch (e) {
            console.error("Map initialization failed:", e);
        }
    }

    // Haversine distance calculation in meters
    function getHaversineDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Radius of Earth in meters
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    function formatDuration(sec) {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    }

    function updateStatsUI(accuracyMeters = null) {
        if ($("statDistance")) {
            $("statDistance").textContent = totalDistanceMeters < 1000
                ? `${Math.round(totalDistanceMeters)} m`
                : `${(totalDistanceMeters / 1000).toFixed(2)} km`;
        }
        if ($("statDuration")) {
            $("statDuration").textContent = formatDuration(elapsedSeconds);
        }
        if ($("statCurrentSpeed")) {
            $("statCurrentSpeed").textContent = `${currentSpeedKmh.toFixed(1)} km/h`;
        }

        const avgSpeed = elapsedSeconds > 0 ? (totalDistanceMeters / elapsedSeconds) * 3.6 : 0;
        if ($("statAvgSpeed")) {
            $("statAvgSpeed").textContent = `${avgSpeed.toFixed(1)} km/h`;
        }

        if ($("statAccuracy") && accuracyMeters !== null) {
            $("statAccuracy").textContent = `±${Math.round(accuracyMeters)} m`;
        }
    }

    // Handle incoming position
    function addPosition(lat, lng, accuracy = 10, speedMps = 0) {
        const point = { lat, lng, time: Date.now() };

        if (routePoints.length > 0) {
            const prev = routePoints[routePoints.length - 1];
            const dist = getHaversineDistance(prev.lat, prev.lng, lat, lng);
            if (dist >= 0.5) {
                totalDistanceMeters += dist;
            }
        }
        routePoints.push(point);

        currentSpeedKmh = speedMps ? (speedMps * 3.6) : 0;

        // Map updates
        const latLng = [lat, lng];
        if (polyline) polyline.addLatLng(latLng);

        // Start marker on first point
        if (routePoints.length === 1) {
            if (startMarker && map) map.removeLayer(startMarker);
            startMarker = L.circleMarker(latLng, {
                radius: 7,
                fillColor: "#10B981",
                color: "#FFFFFF",
                weight: 2,
                fillOpacity: 1
            }).addTo(map).bindPopup("Start Point");
        }

        // Single Current User Marker (Updated dynamically)
        if (!userMarker) {
            userMarker = L.circleMarker(latLng, {
                radius: 8,
                fillColor: "#00BCD4",
                color: "#FFFFFF",
                weight: 3,
                fillOpacity: 1
            }).addTo(map);
        } else {
            userMarker.setLatLng(latLng);
        }

        // Accuracy Circle
        if (!accuracyCircle) {
            accuracyCircle = L.circle(latLng, {
                radius: accuracy,
                color: "#00BCD4",
                fillColor: "#00BCD4",
                fillOpacity: 0.15,
                weight: 1
            }).addTo(map);
        } else {
            accuracyCircle.setLatLng(latLng);
            accuracyCircle.setRadius(accuracy);
        }

        if (map) map.panTo(latLng);
        updateStatsUI(accuracy);
    }

    // Start Simulation Fallback (for desktop testing without physical movement)
    function startSimulatedTracking() {
        showBanner("Simulated GPS active (Demo Mode for route testing).", "info");
        let simLat = routePoints.length > 0 ? routePoints[routePoints.length - 1].lat : DEFAULT_CENTER[0];
        let simLng = routePoints.length > 0 ? routePoints[routePoints.length - 1].lng : DEFAULT_CENTER[1];

        simInterval = setInterval(() => {
            if (!isTracking) return;
            simLat += 0.00015 + (Math.random() * 0.00005);
            simLng += 0.00018 + (Math.random() * 0.00005);
            const simSpeedMps = 3.3 + (Math.random() * 0.5);
            addPosition(simLat, simLng, 5, simSpeedMps);
        }, 1500);
    }

    // Start Tracking
    function startTracking() {
        if (isTracking) return;

        isTracking = true;
        routePoints = [];
        totalDistanceMeters = 0;
        elapsedSeconds = 0;
        startTime = Date.now();

        if (polyline) polyline.setLatLngs([]);
        if (startMarker && map) { map.removeLayer(startMarker); startMarker = null; }

        if ($("startBtn")) $("startBtn").disabled = true;
        if ($("stopBtn")) $("stopBtn").disabled = false;
        if ($("liveBadge")) $("liveBadge").style.display = "inline-flex";
        if ($("routeSummaryCard")) $("routeSummaryCard").style.display = "none";

        hideBanner();

        // Timer interval
        timerInterval = setInterval(() => {
            elapsedSeconds++;
            updateStatsUI();
        }, 1000);

        if ("geolocation" in navigator) {
            showBanner("Acquiring GPS Signal...", "info");
            watchId = navigator.geolocation.watchPosition(
                function (pos) {
                    hideBanner();
                    const lat = pos.coords.latitude;
                    const lng = pos.coords.longitude;
                    const acc = pos.coords.accuracy || 10;
                    const spd = pos.coords.speed || 0;
                    addPosition(lat, lng, acc, spd);
                },
                function (err) {
                    console.warn("Geolocation watch error:", err);
                    if (routePoints.length === 0) {
                        startSimulatedTracking();
                    }
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 1000 }
            );
        } else {
            startSimulatedTracking();
        }
    }

    // Stop Tracking
    function stopTracking() {
        if (!isTracking) return;

        isTracking = false;

        if (watchId !== null) {
            navigator.geolocation.clearWatch(watchId);
            watchId = null;
        }
        if (simInterval !== null) {
            clearInterval(simInterval);
            simInterval = null;
        }
        if (timerInterval !== null) {
            clearInterval(timerInterval);
            timerInterval = null;
        }

        if ($("startBtn")) $("startBtn").disabled = false;
        if ($("stopBtn")) $("stopBtn").disabled = true;
        if ($("liveBadge")) $("liveBadge").style.display = "none";

        const distKm = parseFloat((totalDistanceMeters / 1000).toFixed(2));
        const durationText = formatDuration(elapsedSeconds);
        const avgSpeed = elapsedSeconds > 0 ? (totalDistanceMeters / elapsedSeconds) * 3.6 : 0;
        const calories = Math.round(distKm * 65);

        const now = new Date();
        const timestampStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" }) + ", " +
            now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

        const session = {
            id: "gps_" + Date.now(),
            name: "GPS Outdoor Session",
            timestamp: timestampStr,
            distanceMeters: Math.round(totalDistanceMeters),
            distanceKm: distKm,
            distanceText: `${distKm} km`,
            durationSeconds: elapsedSeconds,
            durationText: durationText,
            avgSpeedKmH: parseFloat(avgSpeed.toFixed(1)),
            calories: calories,
            points: routePoints.map(p => ({ lat: p.lat, lng: p.lng })),
            startLoc: routePoints[0] ? `${routePoints[0].lat.toFixed(3)}, ${routePoints[0].lng.toFixed(3)}` : "Current Location",
            endLoc: routePoints.length > 0 ? `${routePoints[routePoints.length - 1].lat.toFixed(3)}, ${routePoints[routePoints.length - 1].lng.toFixed(3)}` : "Destination"
        };

        // Save session to localStorage
        try {
            let sessions = JSON.parse(localStorage.getItem("zenfit_gps_sessions") || "[]");
            sessions.push(session);
            localStorage.setItem("zenfit_gps_sessions", JSON.stringify(sessions));

            // Set as latest activity for Dashboard
            localStorage.setItem("zenfit_latest_activity", JSON.stringify(session));

            // Also update accumulative distance in zenfitDistance
            const currentDist = Number(localStorage.getItem("zenfitDistance") || 0);
            localStorage.setItem("zenfitDistance", String(currentDist + distKm));
        } catch (e) {
            console.error("Failed to save session:", e);
        }

        // Show Route Summary Card
        if ($("routeSummaryCard")) {
            $("routeSummaryCard").style.display = "block";
            if ($("summaryTimestamp")) $("summaryTimestamp").textContent = `Completed at ${timestampStr}`;
            if ($("summaryDistance")) $("summaryDistance").textContent = `${distKm} km`;
            if ($("summaryDuration")) $("summaryDuration").textContent = durationText;
            if ($("summaryAvgSpeed")) $("summaryAvgSpeed").textContent = `${avgSpeed.toFixed(1)} km/h`;
            if ($("summaryStartLoc")) $("summaryStartLoc").textContent = session.startLoc;
            if ($("summaryEndLoc")) $("summaryEndLoc").textContent = session.endLoc;
            if ($("summaryPointCount")) $("summaryPointCount").textContent = `${routePoints.length} GPS Points`;
        }

        showBanner("Tracking complete! Session saved to dashboard.", "info");
        renderRecentSessions();
    }

    // Render Recent Sessions list
    function renderRecentSessions() {
        const container = $("sessionsList");
        if (!container) return;

        let sessions = [];
        try {
            sessions = JSON.parse(localStorage.getItem("zenfit_gps_sessions") || "[]");
        } catch (e) { sessions = []; }

        if (!Array.isArray(sessions) || sessions.length === 0) {
            container.innerHTML = `<div style="color: #7890a9; font-size: 0.9rem; font-style: italic;">No previous GPS sessions recorded yet.</div>`;
            return;
        }

        container.innerHTML = sessions.slice(-5).reverse().map(s => `
            <div class="session-row">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="width: 38px; height: 38px; border-radius: 10px; background: #E0F7FA; color: #00838F; display: flex; align-items: center; justify-content: center; font-size: 1.1rem; font-weight: bold;">📍</div>
                    <div>
                        <div style="font-weight: 700; color: #10213b; font-size: 0.92rem;">${s.name}</div>
                        <div style="color: #7890a9; font-size: 0.78rem;">${s.timestamp} • ${s.points ? s.points.length : 0} points</div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: 800; color: #00838F; font-size: 1rem;">${s.distanceText}</div>
                    <div style="color: #7890a9; font-size: 0.78rem;">⏱ ${s.durationText} • 🔥 ${s.calories} kcal</div>
                </div>
            </div>
        `).join("");
    }

    // Attach control button listeners
    if ($("startBtn")) $("startBtn").addEventListener("click", startTracking);
    if ($("stopBtn")) $("stopBtn").addEventListener("click", stopTracking);

    // Initial setups
    initMap();
    renderRecentSessions();

    // Window resize handler for Leaflet responsiveness
    let mapResizeTimer = null;
    window.addEventListener("resize", function () {
        clearTimeout(mapResizeTimer);
        mapResizeTimer = setTimeout(function () {
            if (map) map.invalidateSize();
        }, 150);
    });
});
