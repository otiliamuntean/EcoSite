// ======================== DATE PUNCTE RECICLARE MOLDOVA ========================
const DEFAULT_POINTS = [
    { id: "def1", name: "Piața Centrală – Sticlă & Plastic", address: "Piața Centrală, Chișinău", type: "sticla", lat: 47.0115, lng: 28.8475, isDefault: true },
    { id: "def2", name: "Parcul Valea Morilor – Hârtie/Metal", address: "Parcul Valea Morilor, Chișinău", type: "hartie", lat: 47.0314, lng: 28.8194, isDefault: true },
    { id: "def3", name: "Jumbo – Electrocasnice", address: "Șos. Muncești 1, Chișinău", type: "electrocasnice", lat: 47.0150, lng: 28.8820, isDefault: true },
    { id: "def4", name: "Green Ecos – Textile", address: "Str. Albișoara 80, Chișinău", type: "textile", lat: 47.0267, lng: 28.8224, isDefault: true },
    { id: "def5", name: "Salubris – Deșeuri generale", address: "Str. Uzinelor 13, Chișinău", type: "deseuri generale", lat: 46.9812, lng: 28.8723, isDefault: true },
    { id: "def6", name: "Kaufland Botanica – PET & Metal", address: "Bd. Dacia 35, Chișinău", type: "plastic", lat: 46.9976, lng: 28.8540, isDefault: true },
    { id: "def7", name: "Bălți – Centru baterii", address: "Str. Ștefan cel Mare 45, Bălți", type: "electrocasnice", lat: 47.7617, lng: 27.9285, isDefault: true },
    { id: "def8", name: "Lidl Ciocana – Sticlă/Hârtie", address: "Str. Nicolae Dimo 1, Chișinău", type: "sticla", lat: 47.0102, lng: 28.9123, isDefault: true },
    { id: "def9", name: "Parcul Dendrariu – Selectiv", address: "Str. I. Creangă, Chișinău", type: "hartie", lat: 47.0157, lng: 28.8355, isDefault: true }
];
let customPoints = [], allPoints = [], currentUserLocation = null, map, markersLayer;

function loadCustom() { const stored = localStorage.getItem("ecomoldova_points"); if(stored) { customPoints = JSON.parse(stored); customPoints.forEach(p=>{p.isDefault=false; if(!p.id)p.id="c_"+Date.now()+Math.random();});} else customPoints=[]; refreshAll(); }
function saveCustom() { localStorage.setItem("ecomoldova_points", JSON.stringify(customPoints)); refreshAll(); updateDashboardStats(); }
function refreshAll() { allPoints = [...DEFAULT_POINTS, ...customPoints]; renderMapMarkers(); if(currentUserLocation) updateNearestList(currentUserLocation.lat,currentUserLocation.lng); else updateNearestList(47.0105,28.8638); updateDashboardStats(); }
function getDistance(lat1,lng1,lat2,lng2){ const R=6371; const dLat=(lat2-lat1)*Math.PI/180; const dLng=(lng2-lng1)*Math.PI/180; const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLng/2)**2; const c=2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); return R*c; }
function updateNearestList(userLat,userLng) { if(!userLat||!userLng) return; const filterVal=document.getElementById("filterType").value; let filtered=allPoints.filter(p=>filterVal==="all"||p.type.toLowerCase().includes(filterVal.toLowerCase())); let withDist=filtered.map(p=>({...p,dist:getDistance(userLat,userLng,p.lat,p.lng)})).sort((a,b)=>a.dist-b.dist); const container=document.getElementById("nearestPointsList"); if(withDist.length===0){container.innerHTML="<div>Niciun punct pentru filtru.</div>";return;} container.innerHTML=""; for(let p of withDist.slice(0,8)){ const distText=p.dist<1?`${(p.dist*1000).toFixed(0)} m`:`${p.dist.toFixed(2)} km`; const delBtn=!p.isDefault?`<button class="btn-small danger delete-point" data-id="${p.id}"><i class="fas fa-trash"></i> Șterge</button>`:''; const div=document.createElement("div");div.className="point-item"; div.innerHTML=`<div><strong>${escapeHtml(p.name)}</strong> <span class="badge-type" style="background:#d9e8cf; border-radius:30px; padding:3px 12px;">${p.type}</span></div><div><i class="fas fa-location-arrow"></i> ${distText}</div><div><small>${escapeHtml(p.address)}</small></div><div><button class="btn-small direction-btn" data-lat="${p.lat}" data-lng="${p.lng}"><i class="fas fa-directions"></i> Direcții</button> ${delBtn}</div>`; container.appendChild(div); if(!p.isDefault) div.querySelector(".delete-point")?.addEventListener("click",()=>deleteCustomPoint(p.id)); div.querySelector(".direction-btn")?.addEventListener("click",()=>{ if(currentUserLocation) window.open(`https://www.openstreetmap.org/directions?from=${currentUserLocation.lat},${currentUserLocation.lng}&to=${p.lat},${p.lng}`,'_blank'); else alert("Activează localizarea");}); } }
function deleteCustomPoint(id){ customPoints=customPoints.filter(p=>p.id!==id); saveCustom(); if(currentUserLocation) updateNearestList(currentUserLocation.lat,currentUserLocation.lng); else updateNearestList(47.0105,28.8638); }
function renderMapMarkers(){ if(!markersLayer) return; markersLayer.clearLayers(); allPoints.forEach(p=>{ const marker=L.marker([p.lat,p.lng]).bindPopup(`<b>${escapeHtml(p.name)}</b><br>${p.type}<br>${escapeHtml(p.address)}`); marker.addTo(markersLayer); }); }
function addCustomPoint(name,address,type,lat,lng){ if(!name||!lat||!lng){alert("Completează numele și click pe hartă");return false;} customPoints.push({id:"c_"+Date.now()+Math.random(),name,address,type,lat:parseFloat(lat),lng:parseFloat(lng),isDefault:false}); saveCustom(); alert("Punct adăugat!"); return true; }
function initMap(){ map=L.map('map').setView([47.0105,28.8638],12); L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{attribution:'&copy; OSM & CartoDB'}).addTo(map); markersLayer=L.layerGroup().addTo(map); refreshAll(); map.on('click',(e)=>{ document.getElementById("newPointLat").value=e.latlng.lat.toFixed(6); document.getElementById("newPointLng").value=e.latlng.lng.toFixed(6); }); document.getElementById("locateMe").addEventListener("click",()=>{ if(navigator.geolocation) navigator.geolocation.getCurrentPosition(pos=>{ currentUserLocation={lat:pos.coords.latitude,lng:pos.coords.longitude}; document.getElementById("locationStatus").innerHTML=`📍 ${currentUserLocation.lat.toFixed(4)}, ${currentUserLocation.lng.toFixed(4)}`; map.setView([currentUserLocation.lat,currentUserLocation.lng],13); updateNearestList(currentUserLocation.lat,currentUserLocation.lng); if(window.userMarker) map.removeLayer(window.userMarker); window.userMarker=L.marker([currentUserLocation.lat,currentUserLocation.lng],{icon:L.divIcon({html:'<i class="fas fa-user-circle" style="font-size:28px; color:#236b3c;"></i>',iconSize:[28,28]})}).addTo(map); },()=>alert("Locație respinsă")); else alert("Geolocație indisponibilă");}); document.getElementById("filterType").addEventListener("change",()=>{ if(currentUserLocation) updateNearestList(currentUserLocation.lat,currentUserLocation.lng); else updateNearestList(47.0105,28.8638);}); document.getElementById("addPointBtn").addEventListener("click",()=>{ addCustomPoint(document.getElementById("newPointName").value,document.getElementById("newPointAddress").value,document.getElementById("newPointType").value,document.getElementById("newPointLat").value,document.getElementById("newPointLng").value); document.getElementById("newPointName").value=""; document.getElementById("newPointAddress").value=""; document.getElementById("newPointLat").value=""; document.getElementById("newPointLng").value=""; }); }

// Provocări verzi
const challenges = [
    { id: "ch1", text: "Reciclează 10 sticle de plastic sau PET", points: 10, done: false, icon: "fa-bottle-water" },
    { id: "ch2", text: "Plantează un copac sau participă la o acțiune de plantare", points: 15, done: false, icon: "fa-tree" },
    { id: "ch3", text: "Redu consumul de plastic (pungă reutilizabilă o săptămână)", points: 10, done: false, icon: "fa-bag-shopping" },
    { id: "ch4", text: "Mergi cu bicicleta sau transportul public timp de 5 zile", points: 12, done: false, icon: "fa-bicycle" },
    { id: "ch5", text: "Economisește apă (duș scurt 7 zile)", points: 8, done: false, icon: "fa-water" },
    { id: "ch6", text: "Donează haine vechi la un centru social", points: 10, done: false, icon: "fa-shirt" },
    { id: "ch7", text: "Colectează baterii uzate și du-le la punct special", points: 12, done: false, icon: "fa-battery-full" }
];
function loadChallenges() { const stored = localStorage.getItem("ecomoldova_challenges"); if(stored) { const saved = JSON.parse(stored); challenges.forEach(ch => { const found = saved.find(s => s.id === ch.id); if(found) ch.done = found.done; }); } renderChallenges(); updateEcoScore(); }
function saveChallenges() { localStorage.setItem("ecomoldova_challenges", JSON.stringify(challenges)); renderChallenges(); updateEcoScore(); updateDashboardStats(); }
function renderChallenges() {
    const container = document.getElementById("challengesList");
    container.innerHTML = "";
    challenges.forEach(ch => {
        const card = document.createElement("div");
        card.className = `challenge-card ${ch.done ? 'completed' : ''}`;
        card.innerHTML = `
            <div><input type="checkbox" class="challenge-checkbox" data-id="${ch.id}" ${ch.done ? "checked" : ""}></div>
            <div style="flex:1"><div class="challenge-text">${escapeHtml(ch.text)}</div><div class="challenge-points"><i class="fas fa-star"></i> ${ch.points} puncte eco</div></div>
            <div><i class="fas ${ch.icon || 'fa-leaf'}"></i></div>
        `;
        container.appendChild(card);
        const cb = card.querySelector(".challenge-checkbox");
        cb.addEventListener("change", (e) => { ch.done = e.target.checked; saveChallenges(); updateEcoScore(); updateDashboardStats(); });
    });
    const totalEarned = challenges.reduce((sum, ch) => sum + (ch.done ? ch.points : 0), 0);
    const maxPoints = challenges.reduce((sum, ch) => sum + ch.points, 0);
    document.getElementById("totalPointsEarned").innerText = totalEarned;
    document.getElementById("maxPointsAvailable").innerText = maxPoints;
    document.getElementById("resetChallengesBtn").addEventListener("click", () => { challenges.forEach(ch => ch.done = false); saveChallenges(); });
}
function updateEcoScore() { 
    let totalPoints = challenges.reduce((s,ch)=>s+(ch.done?ch.points:0),0);
    const maxPoints = challenges.reduce((s,ch)=>s+ch.points,0);
    const percent = maxPoints===0 ? 0 : Math.round((totalPoints/maxPoints)*100);
    document.getElementById("ecoScorePercent").innerText = percent+"%";
    document.getElementById("ecoProgressFill").style.width = percent+"%";
    document.getElementById("challengeScore").innerText = challenges.filter(c=>c.done).length+"/"+challenges.length;
    const circle = document.getElementById("progressCircle");
    if(circle) { const circumference = 339.292; circle.style.strokeDashoffset = circumference - (percent/100)*circumference; }
    const totalEarned = challenges.reduce((sum, ch) => sum + (ch.done ? ch.points : 0), 0);
    const maxP = challenges.reduce((sum, ch) => sum + ch.points, 0);
    if(document.getElementById("totalPointsEarned")) { document.getElementById("totalPointsEarned").innerText = totalEarned; document.getElementById("maxPointsAvailable").innerText = maxP; }
}
function updateDashboardStats() { document.getElementById("totalPointsCount").innerText = allPoints.length; document.getElementById("treesSaved").innerText = Math.floor(allPoints.length * 2.8 + 110); }

// Test ecologic
const quizData = [
    { q: "Care material se reciclează cel mai eficient?", opts: ["Sticlă","Plastic moale","Pungi bio"], correct: 0 },
    { q: "Ce înseamnă simbolul Mobius (3 săgeți în cerc)?", opts: ["Produs reciclabil","Periculos","Bio"], correct: 0 },
    { q: "Câți ani durează descompunerea unei sticle de plastic?", opts: ["50 ani","450 ani","10 ani"], correct: 1 },
    { q: "Unde ar trebui aruncate bateriile uzate?", opts: ["La gunoi menajer","La puncte speciale","În natură"], correct: 1 },
    { q: "Ce este compostarea?", opts: ["Reciclarea plasticului","Transformarea resturilor organice în îngrășământ","Arderea deșeurilor"], correct: 1 },
    { q: "Care dintre acestea nu este sursă regenerabilă?", opts: ["Solară","Eoliană","Cărbune"], correct: 2 },
    { q: "Câtă apă se economisește dacă închidem robinetul când ne spălăm pe dinți?", opts: ["~2 litri/minut","~10 litri/minut","~0.5 litri/minut"], correct: 0 },
    { q: "Ce efect are defrișarea excesivă?", opts: ["Creșterea biodiversității","Eroziunea solului și CO₂","Îmbunătățirea aerului"], correct: 1 },
    { q: "Care este cel mai mare poluator al oceanelor?", opts: ["Petrolul","Microplasticele","Deșeuri radioactive"], correct: 1 },
    { q: "Ce înseamnă amprentă de carbon?", opts: ["Cantitatea de CO₂ emisă","Numărul de copaci tăiați","Consumul de energie"], correct: 0 }
];
function renderQuiz() { let html=""; quizData.forEach((q,idx)=>{ html+=`<div class="quiz-question"><strong>${idx+1}. ${q.q}</strong><div>`; q.opts.forEach((opt,optIdx)=>{ html+=`<label class="quiz-option"><input type="radio" name="q${idx}" value="${optIdx}"> ${opt}</label>`; }); html+=`</div></div>`; }); document.getElementById("quizContainer").innerHTML=html; }
function initQuiz(){ renderQuiz(); document.getElementById("submitQuiz").addEventListener("click",()=>{ let score=0; for(let i=0;i<quizData.length;i++){ let selected=document.querySelector(`input[name="q${i}"]:checked`); if(selected && parseInt(selected.value)===quizData[i].correct) score++; } document.getElementById("quizScore").innerHTML=`Scor: ${score} / ${quizData.length}<br>${score===quizData.length?"🌟 Expert ecologic! Perfect!":"📚 Mai poți învăța. Explorează secțiunea de inspirație!"}`; }); }

// Carbon
function initCarbon(){ document.getElementById("calcCarbon").addEventListener("click",()=>{ let car=parseFloat(document.getElementById("carKm").value)||0; let flight=parseFloat(document.getElementById("flightHours").value)||0; let elec=parseFloat(document.getElementById("electricityKwh").value)||0; let waste=parseFloat(document.getElementById("wasteKg").value)||0; let co2=car*0.21+flight*90+elec*0.233+waste*0.5; document.getElementById("carbonResult").innerHTML=`🌍 Amprenta lunară: <strong>${co2.toFixed(1)} kg CO₂</strong><br>${co2>300?"🔴 Încearcă să reduci transportul sau consumul.":"🟢 Felicitări! Sub media națională."}`; let red=document.getElementById("co2ReducedStat"); if(red) red.innerText=(co2/100).toFixed(1); }); }

// Eco Impact Calculator
function initImpactCalculator() {
    const bottlesInput = document.getElementById("plasticBottles");
    const bagsInput = document.getElementById("plasticBags");
    const cupsInput = document.getElementById("disposableCups");
    const cutleryInput = document.getElementById("plasticCutlery");
    const bottlesVal = document.getElementById("plasticBottlesValue");
    const bagsVal = document.getElementById("plasticBagsValue");
    const cupsVal = document.getElementById("disposableCupsValue");
    const cutleryVal = document.getElementById("plasticCutleryValue");
    const co2Span = document.getElementById("co2Saved");
    const plasticSpan = document.getElementById("plasticSaved");
    const treesSpan = document.getElementById("treesEquivalent");

    function updateImpact() {
        let bottles = parseInt(bottlesInput.value) || 0;
        let bags = parseInt(bagsInput.value) || 0;
        let cups = parseInt(cupsInput.value) || 0;
        let cutlery = parseInt(cutleryInput.value) || 0;
        bottlesVal.innerText = bottles;
        bagsVal.innerText = bags;
        cupsVal.innerText = cups;
        cutleryVal.innerText = cutlery;

        // Factori de emisie și plastic (estimativi pe an)
        const weeks = 52;
        const months = 12;

        let plasticBottlesKg = bottles * 0.02 * weeks;
        let plasticBagsKg = bags * 0.01 * weeks;
        let plasticCupsKg = cups * 0.02 * weeks;
        let plasticCutleryKg = cutlery * 0.015 * months;
        let totalPlasticKg = plasticBottlesKg + plasticBagsKg + plasticCupsKg + plasticCutleryKg;

        let co2Bottles = bottles * 0.25 * weeks;
        let co2Bags = bags * 0.05 * weeks;
        let co2Cups = cups * 0.1 * weeks;
        let co2Cutlery = cutlery * 0.08 * months;
        let totalCo2Kg = co2Bottles + co2Bags + co2Cups + co2Cutlery;

        let trees = totalCo2Kg / 20;

        plasticSpan.innerText = totalPlasticKg.toFixed(1);
        co2Span.innerText = totalCo2Kg.toFixed(1);
        treesSpan.innerText = trees.toFixed(1);
    }

    bottlesInput.addEventListener("input", updateImpact);
    bagsInput.addEventListener("input", updateImpact);
    cupsInput.addEventListener("input", updateImpact);
    cutleryInput.addEventListener("input", updateImpact);
    updateImpact();
}

// Inspirație verde
let inspirationList = [
    "🌳 În 2023, peste 10.000 de copaci au fost plantați în Chișinău prin campania „Orașul Verde”.",
    "♻️ Punctele de colectare a bateriilor din Moldova au colectat peste 50 de tone de baterii uzate anul trecut.",
    "🚴‍♀️ Bicicletele publice din Chișinău au fost folosite de peste 20.000 de ori în ultimul an, reducând emisiile.",
    "🏭 O fabrică din Bălți a redus consumul de apă cu 30% prin tehnologii eco-inovatoare.",
    "📦 Rețeaua „Zero Waste Moldova” a salvat peste 5 tone de alimente de la risipă în 2024.",
    "💡 Un proiect local instalează panouri solare pe blocurile din sectorul Botanica.",
    "🌊 Voluntarii au curățat 15 km de malul Nistrului, strângând 8 tone de deșeuri.",
    "🏫 Peste 50 de școli din țară au implementat programe de colectare separată a deșeurilor."
];
let currentInspirationIndex = 0;
function loadInspirations() { const stored = localStorage.getItem("ecomoldova_inspirations"); if(stored) { try { const parsed = JSON.parse(stored); if(Array.isArray(parsed) && parsed.length) inspirationList = parsed; } catch(e){} } renderInspiration(); }
function saveInspirations() { localStorage.setItem("ecomoldova_inspirations", JSON.stringify(inspirationList)); }
function renderInspiration() { document.getElementById("inspirationText").innerHTML = inspirationList[currentInspirationIndex]; }
function nextInspiration() { currentInspirationIndex = (currentInspirationIndex + 1) % inspirationList.length; renderInspiration(); }
function prevInspiration() { currentInspirationIndex = (currentInspirationIndex - 1 + inspirationList.length) % inspirationList.length; renderInspiration(); }
function randomInspiration() { currentInspirationIndex = Math.floor(Math.random() * inspirationList.length); renderInspiration(); }
function addInspiration(text) { if(text.trim()) { inspirationList.push(text.trim()); saveInspirations(); currentInspirationIndex = inspirationList.length-1; renderInspiration(); alert("Inspirația a fost adăugată!"); } else alert("Scrie ceva inspirator."); }
function initInspiration() { loadInspirations(); document.getElementById("nextInspiration").addEventListener("click", nextInspiration); document.getElementById("prevInspiration").addEventListener("click", prevInspiration); document.getElementById("randomInspiration").addEventListener("click", randomInspiration); const addLink = document.getElementById("addInspirationBtn"); const formDiv = document.getElementById("addInspirationForm"); addLink.addEventListener("click", (e) => { e.preventDefault(); formDiv.style.display = formDiv.style.display === "none" ? "block" : "none"; }); document.getElementById("saveInspirationBtn").addEventListener("click", () => { const newText = document.getElementById("newInspirationText").value; addInspiration(newText); document.getElementById("newInspirationText").value = ""; formDiv.style.display = "none"; }); }

// Tabs
function initTabs(){ document.querySelectorAll(".tab-btn").forEach(btn=>{ btn.addEventListener("click",()=>{ const tabId=btn.getAttribute("data-tab"); document.querySelectorAll(".tab-btn").forEach(b=>b.classList.remove("active")); btn.classList.add("active"); document.querySelectorAll(".tab-pane").forEach(p=>p.classList.remove("active-pane")); document.getElementById(tabId+"Pane").classList.add("active-pane"); if(tabId==="recycling" && map) setTimeout(()=>map.invalidateSize(),200); }); }); }
function escapeHtml(str){ if(!str)return ""; return str.replace(/[&<>]/g,function(m){if(m==='&')return '&amp;';if(m==='<')return '&lt;';if(m==='>')return '&gt;';return m;}); }

// Inițializare
document.addEventListener("DOMContentLoaded", () => {
    loadCustom();
    initMap();
    initCarbon();
    initQuiz();
    loadChallenges();
    initImpactCalculator();
    initInspiration();
    initTabs();
    updateDashboardStats();
    setTimeout(()=>{ if(!currentUserLocation) updateNearestList(47.0105,28.8638); },500);
});