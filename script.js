const apiKey = "1ea076923fad980723ff35e2340f56e3";

// الرموز الرسمية للبطولات التي نريد الإبقاء عليها فقط
const allowedLeagueIds = ["302", "13", "14", "15"];

const matchesContainer = document.getElementById("matches");
const yesterdayBtn = document.getElementById("yesterdayBtn");
const todayBtn = document.getElementById("todayBtn");
const tomorrowBtn = document.getElementById("tomorrowBtn");

function setActiveButton(activeBtn) {
  [yesterdayBtn, todayBtn, tomorrowBtn].forEach(btn => btn.classList.remove("active"));
  activeBtn.classList.add("active");
}

function getDate(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
}

async function fetchMatches(offset, button) {
  setActiveButton(button);
  matchesContainer.innerHTML = "جارٍ التحميل...";

  const date = getDate(offset);
  const url = `https://apiv3.apifootball.com/?action=get_events&from=${date}&to=${date}&APIkey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    const filtered = data.filter(match =>
      allowedLeagueIds.includes(match.league_id)
    );

    if (filtered.length === 0) {
      matchesContainer.innerHTML = "لا توجد مباريات لهذه البطولات.";
      return;
    }

    matchesContainer.innerHTML = "";
    filtered.forEach(match => {
      const div = document.createElement("div");
      div.className = "match";
      div.innerHTML = `
        <h3>${match.league_name}</h3>
        <p>${match.event_home_team} vs ${match.event_away_team}</p>
        <p>${match.event_time} - ${match.event_date}</p>
      `;
      matchesContainer.appendChild(div);
    });
  } catch (err) {
    matchesContainer.innerHTML = "فشل في جلب البيانات.";
    console.error(err);
  }
}

yesterdayBtn.addEventListener("click", () => fetchMatches(-1, yesterdayBtn));
todayBtn.addEventListener("click", () => fetchMatches(0, todayBtn));
tomorrowBtn.addEventListener("click", () => fetchMatches(1, tomorrowBtn));

fetchMatches(0, todayBtn);
