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
  header.className = "accordion-button";

  const contentDiv = document.createElement("div");
  contentDiv.className = "accordion-content";

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

      if (!data.response || data.response.length === 0) {
        container.innerHTML = "<p>لا توجد مباريات لهذا التاريخ.</p>";
        return;
      }

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

          const teams = fixture.teams;
          const dateTime = new Date(fixture.fixture.date);
          const dateString = dateTime.toLocaleDateString();
          const timeString = dateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

          div.innerHTML = `
            <a href="details.html?id=${fixture.fixture.id}" target="_blank" rel="noopener">
              <div style="text-align:center;">
                <img src="${teams.home.logo}" alt="${teams.home.name}"/>
                <strong>${teams.home.name}</strong>
              </div>
              <div style="font-size: 18px; margin: 0 10px;">vs</div>
              <div style="text-align:center;">
                <img src="${teams.away.logo}" alt="${teams.away.name}"/>
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
    })
    .catch(() => {
      document.getElementById("matches").innerHTML = "<p>حدث خطأ أثناء جلب البيانات.</p>";
    });
}

// زر تغيير التاريخ
document.getElementById("yesterdayBtn").addEventListener("click", () => {
  setActiveButton("yesterdayBtn");
  loadMatches("yesterday");
});
document.getElementById("todayBtn").addEventListener("click", () => {
  setActiveButton("todayBtn");
  loadMatches("today");
});
document.getElementById("tomorrowBtn").addEventListener("click", () => {
  setActiveButton("tomorrowBtn");
  loadMatches("tomorrow");
});

function setActiveButton(id) {
  document.querySelectorAll(".buttons button").forEach(btn => {
    btn.classList.remove("active");
  });
  document.getElementById(id).classList.add("active");
}

// تحميل مباريات اليوم افتراضياً
loadMatches();
