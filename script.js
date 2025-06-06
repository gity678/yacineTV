const apiKey = "1ea076923fad980723ff35e2340f56e3";
const today = new Date().toISOString().split('T')[0];
const url = `https://v3.football.api-sports.io/fixtures?date=${today}`;

// ✅ المفضلة:
const allowedLeagues = [1, 6, 10, 13];    // كأس العالم، أمم إفريقيا، ودية، تصفيات
const allowedTeams = [1096];             // المنتخب المغربي

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
      matchesDiv.innerHTML = "<p>لا توجد مباريات دولية أو للمنتخب المغربي اليوم.</p>";
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
        البطولة: ${league.name}<br>
        الوقت: ${fixture.date.slice(11, 16)}
      `;
