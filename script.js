const apiKey = "1ea076923fad980723ff35e2340f56e3";

const headers = {
  "x-apisports-key": apiKey
};

function getDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().split('T')[0];
}

// تحميل وتخزين المفضلات في localStorage
function getFavorites() {
  return JSON.parse(localStorage.getItem("favorites") || "[]");
}

function saveFavorites(favs) {
  localStorage.setItem("favorites", JSON.stringify(favs));
}

function isFavorited(type, id) {
  return getFavorites().some(f => f.type === type && f.id === id);
}

function toggleFavorite(item) {
  let favs = getFavorites();
  const index = favs.findIndex(f => f.type === item.type && f.id === item.id);
  if (index === -1) {
    favs.push(item);
  } else {
    favs.splice(index, 1);
  }
  saveFavorites(favs);
  renderFavorites();
  loadMatches(currentDateType); // لإعادة ترتيب المباريات حسب المفضلة
}

function renderFavorites() {
  const favs = getFavorites();
  const favSection = document.getElementById("favoritesSection");
  const favContainer = document.getElementById("favoritesContainer");

  if (favs.length === 0) {
    favSection.style.display = "none";
    return;
  }

  favSection.style.display = "block";
  favContainer.innerHTML = "";

  favs.forEach(fav => {
    const div = document.createElement("div");
    div.className = "favorite-item";

    const img = document.createElement("img");
    img.src = fav.logo;
    img.alt = fav.name;
    div.appendChild(img);

    const span = document.createElement("span");
    span.textContent = fav.name;
    div.appendChild(span);

    div.addEventListener("click", () => {
      // عند الضغط نفتح صفحة التفاصيل (مثلاً صفحة التشكيلة)
      if (fav.type === "team") {
        window.open(`team.html?id=${fav.id}`, "_blank");
      } else if (fav.type === "league") {
        // لم نقم بتحديد صفحة للبطولة، يمكن توسيع لاحقاً
        alert(`صفحة تفاصيل البطولة ${fav.name} غير متوفرة حالياً`);
      }
    });

    favContainer.appendChild(div);
  });
}

function createAccordion(title, content, leagueInfo) {
  const container = document.createElement("div");
  container.style.marginBottom = "15px";

  const header = document.createElement("button");
  header.className = "accordion-button";

  // عنوان البطولة مع أيقونة المفضلة
  const titleSpan = document.createElement("span");
  titleSpan.textContent = title;

  const favIcon = document.createElement("span");
  favIcon.className = "favorite-icon";
  favIcon.innerHTML = isFavorited("league", leagueInfo.id) ? "⭐️" : "☆";

  favIcon.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleFavorite({
      type: "league",
      id: leagueInfo.id,
      name: leagueInfo.name,
      logo: leagueInfo.logo || ""
    });
    favIcon.innerHTML = isFavorited("league", leagueInfo.id) ? "⭐️" : "☆";
  });

  header.appendChild(titleSpan);
  header.appendChild(favIcon);

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

let currentDateType = "today";

function loadMatches(type = 'today') {
  currentDateType = type;
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
        const leagueId = fixture.league.id;
        const leagueName = fixture.league.name;
        const leagueLogo = fixture.league.logo;

        if (!groupedByLeague[leagueId]) {
          groupedByLeague[leagueId] = {
            leagueInfo: { id: leagueId, name: leagueName, logo: leagueLogo },
            matches: []
          };
        }
        groupedByLeague[leagueId].matches.push(fixture);
      });

      // ترتيب المفضلة أولاً ثم الباقي
      const favs = getFavorites();
      const favLeagueIds = favs.filter(f => f.type === "league").map(f => f.id);

      // رتب المفصلة أولاً
      let leaguesOrdered = Object.values(groupedByLeague).sort((a, b) => {
        const aFav = favLeagueIds.includes(a.leagueInfo.id);
        const bFav = favLeagueIds.includes(b.leagueInfo.id);
        if (aFav && !bFav) return -1;
        if (!aFav && bFav) return 1;
        return a.leagueInfo.name.localeCompare(b.leagueInfo.name);
      });

      leaguesOrdered.forEach(({ leagueInfo, matches }) => {
        const leagueContent = document.createElement("div");

        // ترقيم فرق المفضلة لرفعهم للأعلى:
        const favTeamIds = favs.filter(f => f.type === "team").map(f => f.id);

        // رتب المباريات مع فرق مفضلة أولاً
        matches.sort((a, b) => {
          // الفرق المفضلة للفرق المنزلية
          const aHomeFav = favTeamIds.includes(a.teams.home.id);
          const bHomeFav = favTeamIds.includes(b.teams.home.id);
          if (aHomeFav && !bHomeFav) return -1;
          if (!aHomeFav && bHomeFav) return 1;

          // الفرق المفضلة للفرق الزائرة
          const aAwayFav = favTeamIds.includes(a.teams.away.id);
          const bAwayFav = favTeamIds.includes(b.teams.away.id);
          if (aAwayFav && !bAwayFav) return -1;
          if (!aAwayFav && bAwayFav) return 1;

          return 0;
        });

        matches.forEach(fixture => {
          const div = document.createElement("div");
          div.className = "match";

          const teams = fixture.teams;
          const dateTime = new Date(fixture.fixture.date);
          const dateString = dateTime.toLocaleDateString();
          const timeString = dateTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

          // أيقونات مفضلة لكل فريق
          function createTeamFavoriteIcon(team) {
            const icon = document.createElement("span");
            icon.className = "favorite-icon";
            icon.textContent = isFavorited("team", team.id) ? "⭐️" : "☆";
            icon.title = "إضافة/إزالة من المفضلة";
            icon.style.marginRight = "5px";
            icon.style.alignSelf = "center";

            icon.addEventListener("click", (e) => {
              e.stopPropagation();
              toggleFavorite({
                type: "team",
                id: team.id,
                name: team.name,
                logo: team.logo
              });
              icon.textContent = isFavorited("team", team.id) ? "⭐️" : "☆";
            });

            return icon;
          }

          // بناء محتوى المباراة
          const homeTeamLink = document.createElement("a");
          homeTeamLink.className = "team-link";
          homeTeamLink.href = `team.html?id=${teams.home.id}`;
          homeTeamLink.target = "_blank";
          homeTeamLink.rel = "noopener";
          homeTeamLink.title = `عرض تشكيلة ${teams.home.name}`;

          homeTeamLink.appendChild(createTeamFavoriteIcon(teams.home));
          const homeImg = document.createElement("img");
          homeImg.src = teams.home.logo;
          homeImg.alt = teams.home.name;
          homeTeamLink.appendChild(homeImg);
          const homeName = document.createElement("strong");
          homeName.textContent = teams.home.name;
          homeTeamLink.appendChild(homeName);

          const awayTeamLink = document.createElement("a");
          awayTeamLink.className = "team-link";
          awayTeamLink.href = `team.html?id=${teams.away.id}`;
          awayTeamLink.target = "_blank";
          awayTeamLink.rel = "noopener";
          awayTeamLink.title = `عرض تشكيلة ${teams.away.name}`;

          awayTeamLink.appendChild(createTeamFavoriteIcon(teams.away));
          const awayImg = document.createElement("img");
          awayImg.src = teams.away.logo;
          awayImg.alt = teams.away.name;
          awayTeamLink.appendChild(awayImg);
          const awayName = document.createElement("strong");
          awayName.textContent = teams.away.name;
          awayTeamLink.appendChild(awayName);

          const vsDiv = document.createElement("div");
          vsDiv.style.fontSize = "18px";
          vsDiv.style.margin = "0 10px";
          vsDiv.textContent = "vs";

          const dateDiv = document.createElement("div");
          dateDiv.style.textAlign = "center";
          dateDiv.style.minWidth = "110px";
          dateDiv.innerHTML = `<p style="margin:0;">${dateString}</p><p style="margin:0;">${timeString}</p>`;

          div.appendChild(homeTeamLink);
          div.appendChild(vsDiv);
          div.appendChild(awayTeamLink);
          div.appendChild(dateDiv);

          leagueContent.appendChild(div);
        });

        container.appendChild(createAccordion(leagueInfo.name, leagueContent, leagueInfo));
      });
    })
    .catch(() => {
      document.getElementById("matches").innerHTML = "<p>حدث خطأ أثناء جلب البيانات.</p>";
    });
}

// أزرار اختيار التاريخ
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

// تحميل المباريات افتراضياً
renderFavorites();
loadMatches();
