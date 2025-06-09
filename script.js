const apiKey = "1ea076923fad980723ff35e2340f56e3";

// المسابقات المسموح بها فقط
const allowedCompetitions = [
  "Friendlies",
  "World Cup - Qualification South America",
  "World Cup - Qualification CONCACAF",
  "World Cup - Qualification Europe"
];

const matchesContainer = document.getElementById("matches");
const yesterdayBtn = document.getElementById("yesterdayBtn");
const todayBtn = document.getElementById("todayBtn");
const tomorrowBtn = document.getElementById("tomorrowBtn");

yesterdayBtn.addEventListener("click", () => fetchMatches(-1));
todayBtn.addEventListener("click", () => fetchMatches(0));
tomorrowBtn.addEventListener("click", () => fetchMatches(1));

// تغيير الزر النشط
function setActiveButton(offset) {
  yesterdayBtn.classList.remove("active");
  todayBtn.classList.remove("active");
  tomorrowBtn.classList.remove("active");

  if (offset === -1) yesterdayBtn.classList.add("active");
  else if (offset === 0) todayBtn.classList.add("active");
  else if (offset === 1) tomorrowBtn.classList.add("active");
}

// جلب التاريخ بناء على الإزاحة
function getDateByOffset(offset) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split("T")[0];
}

// دالة جلب المباريات
async function fetchMatches(offset) {
  setActiveButton(offset);
  matchesContainer.innerHTML = "جارٍ التحميل...";

  const date = getDateByOffset(offset);
  const url = `https://apiv3.apifootball.com/?action=get_events&from=${date}&to=${date}&APIkey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    // فلترة البطولات
    const filteredMatches = data.filter(match =>
      allowedCompetitions.includes(match.league_name)
    );

    if (filteredMatches.length === 0) {
      matchesContainer.innerHTML = "لا توجد مباريات في هذه البطولات.";
      return;
    }

    matchesContainer.innerHTML = "";

    filteredMatches.forEach(match => {
      const matchElement = document.createElement("div");
      matchElement.className = "match";
      matchElement.innerHTML = `
        <h3>${match.league_name}</h3>
        <p>${match.event_home_team} vs ${match.event_away_team}</p>
        <p>${match.event_time} - ${match.event_date}</p>
      `;
      matchesContainer.appendChild(matchElement);
    });

  } catch (error) {
    matchesContainer.innerHTML = "حدث خطأ أثناء جلب البيانات.";
    console.error("Fetch error:", error);
  }
}

// عرض مباريات اليوم تلقائيًا عند التحميل
fetchMatches(0);
