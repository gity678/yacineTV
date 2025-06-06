const apiKey = "1ea076923fad980723ff35e2340f56e3";
const headers = {
  "x-apisports-key": apiKey
};

const loadMatches = async (dayOffset) => {
  const container = document.getElementById("matches");
  container.innerHTML = "🔄 جاري تحميل المباريات...";

  const date = new Date();
  date.setDate(date.getDate() + dayOffset);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const dateString = `${y}-${m}-${d}`;

  const url = `https://v3.football.api-sports.io/fixtures?date=${dateString}&type=Friendlies&season=2024`;

  const res = await fetch(url, { headers });
  const data = await res.json();

