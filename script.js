const apiKey = "1ea076923fad980723ff35e2340f56e3";

const headers = {
  "x-apisports-key": apiKey
};

function getDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
}

function loadMatches(type = 'today') {
  document.getElementById("matches").innerHTML = "<p>جاري التحميل...</p>";

  let date;
  if (type === "yesterday") date = getDate(-1);
  else if (type === "tomorrow") date = getDate(1);
  else date = getDate(0);

  fetch(`https://v3.football.api-sports.io/fixtures?date=${date}`, {
    headers
  })
    .then(res => res.json())
    .then(data => {
      console.log("عدد النتائج:", data.response.length, data);
      const container = document.getElementById("matches");
      container.innerHTML = "";
      data.response.forEach(fixture => {
        const div = document.createElement("div");
        div.className = "match";

        const teams = fixture.teams;
        const league = fixture.league;
        const dateTime = new Date(fixture.fixture.date);
        const dateString = dateTime.toLocaleDateString();
        const timeString = dateTime.toLocaleTimeString();

        div.innerHTML = `
          <a href="details.html?id=${fixture.fixture.id}">
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
          </a>
        `;
        container.appendChild(div);
      });
    });
}

loadMatches();
