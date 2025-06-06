const apiKey = "1ea076923fad980723ff35e2340f56e3";
const today = new Date().toISOString().split('T')[0];
const url = `https://v3.football.api-sports.io/fixtures?date=${today}`;

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
      matchesDiv.innerHTML = "<p>لا توجد مباريات ودية دولية اليوم.</p>";
      return;
    }

    filteredMatches.forEach(match => {
      const fixture = match.fixture;
      const teams = match.teams;
      const league = match.league;

      const matchDiv = document.createElement("div");
      matchDiv.className = "match";
      matchDiv.innerHTML = `
        <div style="display: flex; justify-content: space-around; align-items: center;">
          <div>
            <img src="${teams.home.logo}" alt="${teams.home.name}" width="40"><br>
            <strong>${teams.home.name}</strong>
          </div>
          <div style="font-size: 20px;">vs</div>
          <div>
            <img src="${teams.away.logo}" alt="${teams.away.name}" width="40"><br>
            <strong>${teams.away.name}</strong>
          </div>
        </div>
        <p>البطولة: ${league.name}</p>
        <p>الوقت: ${fixture.date.slice(11, 16)}</p>
      `;
      matchesDiv.appendChild(matchDiv);
    });
  })
  .catch(error => {
    console.error("خطأ:", error);
    document.getElementById("matches").innerHTML = "حدث خطأ أثناء جلب البيانات.";
  });
