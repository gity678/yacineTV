const allowedLeagues = [
  "Friendlies",
  "WC Qualification South America",
  "WC Qualification Europe",
  "WC Qualification CONCACAF"
];

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

  try {
    const response = await fetch(`https://www.thesportsdb.com/api/v1/json/1/eventsday.php?d=${date}&s=Soccer`);
    const data = await response.json();

    if (!data || !data.events) {
      matchesContainer.innerHTML = "لا توجد مباريات.";
      return;
    }

    const filtered = data.events.filter(event =>
      allowedLeagues.includes(event.strLeague)
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
        <h3>${match.strLeague}</h3>
        <p>${match.strHomeTeam} vs ${match.strAwayTeam}</p>
        <p>${match.strTime} - ${match.dateEvent}</p>
      `;
      matchesContainer.appendChild(div);
    });
  } catch (err) {
    matchesContainer.innerHTML = "حدث خطأ أثناء جلب البيانات.";
    console.error(err);
  }
}

yesterdayBtn.addEventListener("click", () => fetchMatches(-1, yesterdayBtn));
todayBtn.addEventListener("click", () => fetchMatches(0, todayBtn));
tomorrowBtn.addEventListener("click", () => fetchMatches(1, tomorrowBtn));

// بدء بعرض مباريات اليوم
fetchMatches(0, todayBtn);
