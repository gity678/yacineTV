const apiKey = "1ea076923fad980723ff35e2340f56e3";

// 🔁 تواريخ الأسبوع
function getDateString(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

const fromDate = getDateString(0);
const toDate = getDateString(7);

// ✅ رابط جلب مباريات الأسبوع
const url = `https://v3.football.api-sports.io/fixtures?from=${fromDate}&to=${toDate}`;

const allowedLeagues = [10]; // فقط مباريات ودية دولية

fetch(url, {
  method: "GET",
  headers: {
    "x-apisports-key": apiKey
  }
})
  .then(response => response.json())
  .then(data => {
    const matchesDiv = document.getElementById("matches");
    matchesDiv.innerHTML = "";

    const filteredMatches = data.response.filter(match => {
      const leagueId = match.league.id;
      return allowedLeagues.includes(leagueId);
    });

    if (filteredMatches.length === 0) {
      matchesDiv.innerHTML = "<p>لا توجد مباريات ودية دولية هذا الأسبوع.</p>";
      return;
    }

    filteredMatches.forEach(match => {
      const fixture = match.fixture;
      const teams = match.teams;
      const league = match.league;

      const date = new Date(fixture.date);
      const dateString = date.toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
      const timeString = date.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' });

      const matchDiv = document.createElement("div");
      matchDiv.className = "match";
      matchDiv.style = "margin-bottom: 20px; padding: 10px; border: 1px solid #ccc; text-align: center;";

      matchDiv.innerHTML = `
        <div style="display: flex; justify-content: space-around; align-items: center;">
          <div>
            <img src="${teams.home.logo}" alt="${teams.home.name}" width="50" height="50"><br>
            <strong>${teams.home.name}</strong>
          </div>
          <div style="font-size: 20px;">vs</div>
          <div>
            <img src="${teams.away.logo}" alt="${teams.away.name}" width="50" height="50"><br>
            <strong>${teams.away.name}</strong>
          </div>
        </div>
        <p>📅 ${dateString} - 🕒 ${timeString}</p>
        <p>🏆 ${league.name}</p>
      `;

      matchesDiv.appendChild(matchDiv);
    });
  })
  .catch(error => {
    console.error("خطأ:", error);
    document.getElementById("matches").innerHTML = "حدث خطأ أثناء جلب البيانات.";
  });
