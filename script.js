const apiKey = "1ea076923fad980723ff35e2340f56e3";

const today = new Date().toISOString().split('T')[0]; // التاريخ بصيغة YYYY-MM-DD
const url = `https://v3.football.api-sports.io/fixtures?date=${today}`;

fetch(url, {
  method: "GET",
  headers: {
    "x-apisports-key": apiKey
  }
})
  .then(response => response.json())
  .then(data => {
    const matchesDiv = document.getElementById("matches");
    matchesDiv.innerHTML = ""; // حذف النص الأولي

    if (data.response.length === 0) {
      matchesDiv.innerHTML = "<p>لا توجد مباريات اليوم.</p>";
      return;
    }

    data.response.forEach(match => {
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
