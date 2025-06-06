const apiKey = "1ea076923fad980723ff35e2340f56e3";

const urlParams = new URLSearchParams(window.location.search);
const fixtureId = urlParams.get("id");

if (!fixtureId) {
  document.getElementById("content").innerHTML = "<p>❌ لم يتم تحديد المباراة.</p>";
  throw new Error("Missing fixture ID");
}

const headers = {
  "x-apisports-key": apiKey
};

const fetchData = async () => {
  document.getElementById("content").innerHTML = "<div class='loader'>⏳ جاري تحميل تفاصيل المباراة...</div>";

  const [lineupRes, eventsRes, statsRes] = await Promise.all([
    fetch(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${fixtureId}`, { headers }),
    fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${fixtureId}`, { headers }),
    fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${fixtureId}`, { headers }),
  ]);

  const lineupData = await lineupRes.json();
  const eventsData = await eventsRes.json();
  const statsData = await statsRes.json();

  const content = document.getElementById("content");
  content.innerHTML = "";

  if (lineupData.response.length) {
    lineupData.response.forEach(team => {
      const div = document.createElement("div");
      div.className = "team-box";
      div.innerHTML = `
        <h2>🧍‍♂️ ${team.team.name}</h2>
        <p><strong>المدرب:</strong> ${team.coach.name}</p>
        <p><strong>الخطة:</strong> ${team.formation}</p>
        <p><strong>الأساسيين:</strong><br>${team.startXI.map(p => p.player.name).join(" - ")}</p>
        <p><strong>الاحتياطيين:</strong><br>${team.substitutes.map(p => p.player.name).join(" - ")}</p>
      `;
      content.appendChild(div);
    });
  }

  if (eventsData.response.length) {
    const goals = eventsData.response.filter(e => e.type === "Goal");
    const cards = eventsData.response.filter(e => e.type === "Card");
    const subs = eventsData.response.filter(e => e.type === "subst");

    const section = document.createElement("div");
    section.className = "team-box";
    section.innerHTML = `<h2>📅 أحداث المباراة</h2>`;

    if (goals.length) {
      section.innerHTML += `<h3>🎯 أهداف:</h3>` + goals.map(e => `<div class="event">${e.time.elapsed}': ${e.player.name} (${e.team.name})</div>`).join("");
    }

    if (cards.length) {
      section.innerHTML += `<h3>🟥 بطاقات:</h3>` + cards.map(e => `<div class="event">${e.time.elapsed}': ${e.player.name} - ${e.detail}</div>`).join("");
    }

    if (subs.length) {
      section.innerHTML += `<h3>🔄 تبديلات:</h3>` + subs.map(e => `<div class="event">${e.time.elapsed}': ${e.player.name} ⬅️ ${e.assist.name}</div>`).join("");
    }

    content.appendChild(section);
  }

  if (statsData.response.length) {
    statsData.response.forEach(teamStat => {
      const sDiv = document.createElement("div");
      sDiv.className = "stat-box";
      sDiv.innerHTML = `<h2>📊 إحصائيات ${teamStat.team.name}</h2>`;
      sDiv.innerHTML += teamStat.statistics.map(stat => `<p>${stat.type}: ${stat.value}</p>`).join("");
      content.appendChild(sDiv);
    });
  }
};

fetchData();

