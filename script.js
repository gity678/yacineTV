const apiKey = "1ea076923fad980723ff35e2340f56e3";

const headers = {
  "x-apisports-key": apiKey
};

function getDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
}

function createAccordion(title, content) {
  const container = document.createElement("div");
  container.style.marginBottom = "15px";

  const header = document.createElement("button");
  header.textContent = title;
  header.style.width = "100%";
  header.style.backgroundColor = "#003366";
  header.style.color = "white";
  header.style.border = "none";
  header.style.padding = "10px";
  header.style.cursor = "pointer";
  header.style.fontSize = "18px";
  header.style.borderRadius = "8px";
  header.style.textAlign = "right";
  header.style.outline = "none";

  const contentDiv = document.createElement("div");
  contentDiv.style.padding = "10px";
  contentDiv.style.display = "none";
  contentDiv.style.backgroundColor = "white";
  contentDiv.style.border = "1px solid #ccc";
  contentDiv.style.borderTop = "none";
  contentDiv.style.borderRadius = "0 0 8px 8px";

  contentDiv.appendChild(content);

  header.addEventListener("click", () => {
    contentDiv.style.display = contentDiv.style.display === "none" ? "block" : "none";
  });

  container.appendChild(header);
  container.appendChild(contentDiv);

  return container;
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
      const container = document.getElementById("matches");
      container.innerHTML = "";

      // تجميع المباريات حسب اسم البطولة
      const groupedByLeague = {};

      data.response.forEach(fixture => {
        const leagueName = fixture.league.name;

        if (!groupedByLeague[leagueName]) {
          groupedByLeague[leagueName] = [];
        }
        groupedByLeague[leagueName].push(fixture);
      });

      // لكل بطولة نُنشئ قائمة منسدلة
      Object.keys(groupedByLeague).forEach(leagueName => {
        const leagueMatches = groupedByLeague[leagueName];

        const leagueContent = document.createElement("div");

        leagueMatches.forEach(fixture => {
          const div = document.createElement("div");
          div.className = "match";
          div.style.border = "1px solid #ddd";
          div.style.padding = "10px";
          div.style.marginBottom = "10px";
          div.style.borderRadius = "8px";

          const teams = fixture.teams;
          const dateTime = new Date(fixture.fixture.date);
          const dateString = dateTime.toLocaleDateString();
          const timeString = dateTime.toLocaleTimeString();

          div.innerHTML = `
            <a href="details.html?id=${fixture.fixture.id}" style="display:flex; justify-content: space-between; align-items:center; text-decoration:none; color:#222;">
              <div style="text-align:center;">
                <img src="${teams.home.logo}" width="40" height="40"><br>
                <strong>${teams.home.name}</strong>
              </div>
              <div style="font-size: 18px; margin: 0 10px;">vs</div>
              <div style="text-align:center;">
                <img src="${teams.away.logo}" width="40" height="40"><br>
                <strong>${teams.away.name}</strong>
              </div>
              <div style="text-align:center; min-width:110px;">
                <p style="margin:0;">${dateString}</p>
                <p style="margin:0;">${timeString}</p>
              </div>
            </a>
          `;
          leagueContent.appendChild(div);
        });

        container.appendChild(createAccordion(leagueName, leagueContent));
      });
    });
}

// تحميل مباريات اليوم افتراضياً
loadMatches();
