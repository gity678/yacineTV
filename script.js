const apiKey = "1ea076923fad980723ff35e2340f56e3";
const today = new Date().toISOString().split('T')[0];
const url = `https://v3.football.api-sports.io/fixtures?date=${today}`;

const allowedLeagues = [2, 39, 140];  // مثال: دوري أبطال أوروبا، إنجليزي، إسباني
const allowedTeams = [541, 529];     // مثال: ريال مدريد، برشلونة

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
      const homeId = match.teams.home.id;
      const awayId = match.teams.away.id;

      return (
        allowedLeagues.includes(leagueId) ||
        allowedTeams.includes(homeId) ||
        allowedTeams.includes(awayId)
      );
    });

    if (filteredMatches.length === 0) {
      matchesDiv.innerHTML = "<p>لا توجد مباريات مفضلة اليوم.</p>";
      return;
    }

    filteredMatches.forEach(match => {
      const fixture = match.fixture;
      const teams = match.teams;
      const league = match.league;

      const matchDiv = document.createElement("div");
      matchDiv.className = "match";
      matchDiv.innerHTML = `
        <strong>${teams.home.name}</strong> vs <strong>${teams.away.name}</strong><br>
        الدوري: ${league.name}<br>
        الوقت: ${fixture.date.slice(11, 16)}
      `;
      matchesDiv.appendChild(matchDiv);
    });
  })
  .catch(error => {
    console.error("خطأ:", error);
    document.getElementById("matches").innerHTML = "حدث خطأ أثناء جلب البيانات.";
  });
