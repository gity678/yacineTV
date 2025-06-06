const apiKey = "1ea076923fad980723ff35e2340f56e3";
const allowedLeagues = [10]; // مباريات ودية دولية فقط

function getDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
}

function loadMatches(offset) {
  const selectedDate = getDate(offset);
  const url = `https://v3.football.api-sports.io/fixtures?date=${selectedDate}`;

  const matchesDiv = document.getElementById("matches");
  matchesDiv.innerHTML = "جاري التحميل...";

  fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey
    }
  })
    .then(response => response.json())
    .then(data => {
      matchesDiv.innerHTML = "";

      const filtered = data.response.filter(match =>
        allowedLeagues.includes(match.league.id)
      );

      if (filtered.length === 0) {
        matchesDiv.innerHTML = "<p>لا توجد مباريات في هذا اليوم.</p>";
        return;
      }

      filtered.forEach(match => {
        const fixture = match.fixture;
        const teams = match.teams;
        const league = match.league;

        const date = new Date(fixture.date);
        const dateString = date.toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
        const timeString = date.toLocaleTimeString("ar-EG", { hour: '2-digit', minute: '2-digit' });

        const div = document.createElement("div");
        div.className = "match";

        div.innerHTML = `
          <div class="teams">
            <div>
              <img src="${teams.home.logo}" width="50" height="50"><br>
              <strong>${teams.home.name}</strong>
            </div>
            <div style="font-size: 20px;">vs</div>
            <div>
              <img src="${teams.away.logo}" width="50" height="50"><br>
              <strong>${teams.away.name}</strong>
            </div>
          </div>
          <p>📅 ${dateString} - 🕒 ${timeString}</p>
          <p>🏆 ${league.name}</p>
        `;

        matchesDiv.appendChild(div);
      });
    })
    .catch(err => {
      console.error("خطأ:", err);
      matchesDiv.innerHTML = "حدث خطأ أثناء جلب البيانات.";
    });
}
