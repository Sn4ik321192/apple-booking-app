const SUPABASE_URL = "https://emivzihgdhuatebgchst.supabase.co";

const SUPABASE_ANON_KEY =
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtaXZ6aWhnZGh1YXRlYmdjaHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzOTY0NjYsImV4cCI6MjA5Mzk3MjQ2Nn0.zQpB1st-P2N5o-Pc6kXxu2UXPfA8VnaO4MRhCM8AnHQ";
const BOT_TOKEN = "8708273025:AAFCkyhImnun4XRnHsMhi0vV1lDBGnobI8Q";
const ADMIN_CHAT_ID = "6509764945";

let supabaseClient = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );
}
const tg = window.Telegram?.WebApp;

const ADMIN_ID = 6509764945;

if (tg) {
  tg.expand();
  tg.ready();
  tg.disableVerticalSwipes?.();
}

const defaultAvatar = "https://ui-avatars.com/api/?name=User&background=102116&color=ffffff";
const user = tg?.initDataUnsafe?.user;

let selectedService = "";

let selectedDate = "";
let selectedTime = "10:00";
let calendarDate = new Date();
let bookingsCache = [];

const slots = document.querySelectorAll(".time-slot");
const pages = {
  home: document.getElementById("homePage"),
  booking: document.getElementById("bookingPage"),
  admin: document.getElementById("adminPage"),
  profile: document.getElementById("profilePage"),
  assistant: document.getElementById("assistantPage")
};
const navItems = document.querySelectorAll(".nav-item");

function setUserProfile() {
  const avatarUrl = user?.photo_url ||
    "https://ui-avatars.com/api/?name=" + encodeURIComponent(user?.first_name || "User") + "&background=102116&color=ffffff";

  document.getElementById("userName").innerText = user?.first_name || "Пользователь";
  document.getElementById("userUsername").innerText = user?.username ? "@" + user.username : "Telegram user";
  document.getElementById("userAvatar").src = avatarUrl || defaultAvatar;
  document.getElementById("profileAvatar").src = avatarUrl || defaultAvatar;
  document.getElementById("profileName").innerText = user?.first_name || "User";
  document.getElementById("profileUsername").innerText = user?.username ? "@" + user.username : "@telegram";
  const currentUserId = user?.id;

if (currentUserId !== ADMIN_ID) {

  document.getElementById("adminNav").style.display = "none";

}
}

function hideKeyboard() {
  if (document.activeElement && document.activeElement.blur) {
    document.activeElement.blur();
  }
}

document.addEventListener("pointerdown", function(event) {
  const tag = event.target.tagName;
  const isEditable = tag === "INPUT" || tag === "TEXTAREA";
  if (!isEditable) hideKeyboard();
});

document.querySelectorAll("input").forEach(input => {
  input.addEventListener("focus", () => {
    setTimeout(() => input.scrollIntoView({ behavior: "smooth", block: "center" }), 250);
  });
});

function selectService(element, service) {
  selectedService = service;
  document.querySelectorAll(".service-card").forEach(card => card.classList.remove("active"));
  element.classList.add("active");
}

let services = [];

function isAdmin(){
  return user?.id === ADMIN_ID;
}

async function fetchServices(){

  const { data, error } = await supabaseClient
    .from("services")
    .select("*")
    .order("created_at", { ascending:true });

  if(error){
    console.log(error);
    alert("Ошибка загрузки услуг");
    return;
  }

  services = data || [];

  if(services.length > 0 && !selectedService){
    selectedService = services[0].title;
  }


  renderServices();
}

function renderServices(){

  const container =
    document.getElementById("servicesContainer");

  const addBtn =
    document.getElementById("addServiceBtn");

  if(!container) return;

  container.innerHTML = "";

  if(addBtn){
    addBtn.style.display =
      isAdmin() ? "block" : "none";
  }

  services.forEach(service=>{

    const card =
      document.createElement("div");

    card.className =
      "service-card" +
      (selectedService === service.title ? " active" : "");

    card.onclick = () => {
      selectedService = service.title;
      renderServices();
    };

    card.innerHTML = `
      <span>${service.icon}</span>

      <div>
        <strong>${service.title}</strong>
        <small>${service.description || ""}</small>

        ${
          isAdmin()
          ? `<button class="delete-service-btn">Удалить</button>`
          : ""
        }
      </div>
    `;

    if(isAdmin()){

      const deleteBtn =
        card.querySelector(".delete-service-btn");

      deleteBtn.onclick = async (event) => {
        event.stopPropagation();
        await deleteService(service.id);
      };
    }

    container.appendChild(card);
  });
}

async function addService(){

  if(!isAdmin()) return;

  const title =
    prompt("Название услуги");

  if(!title) return;

  const icon =
    prompt("Эмодзи услуги") || "✨";

  const description =
    prompt("Описание услуги") || "Новая услуга";

  const { error } = await supabaseClient
    .from("services")
    .insert([
      {
        icon:icon,
        title:title,
        description:description
      }
    ]);

  if(error){
    console.log(error);
    alert("Ошибка добавления услуги");
    return;
  }

  await fetchServices();
}

async function deleteService(id){

  if(!isAdmin()) return;

  const ok =
    confirm("Удалить услугу?");

  if(!ok) return;

  const { error } = await supabaseClient
    .from("services")
    .delete()
    .eq("id", id);

  if(error){
    console.log(error);
    alert("Ошибка удаления услуги");
    return;
  }

  await fetchServices();
}

function showPage(pageName, navIndex) {
  hideKeyboard();
  Object.values(pages).forEach(page => page.classList.remove("active-page"));
  pages[pageName].classList.add("active-page");

  navItems.forEach(item => item.classList.remove("active-nav"));
  if (typeof navIndex === "number") navItems[navIndex].classList.add("active-nav");

  window.scrollTo({ top: 0, behavior: "smooth" });
  if (pageName === "admin") loadBookings();
}

function openHomePage() { showPage("home", 0); }
function openBookingPage() { showPage("booking", 1); }
function openAdminPage() { showPage("admin", 2); }
function openProfilePage() { showPage("profile", 3); }
function openAssistantPage() { showPage("assistant"); }

function formatDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateHuman(key) {
  if (!key) return "Выбрать дату";
  const [y, m, d] = key.split("-");
  return `${d}.${m}.${y}`;
}

function openCalendar() {
  hideKeyboard();
  document.getElementById("calendarSheet").classList.toggle("open");
  renderCalendar();
}

function changeMonth(delta) {
  calendarDate.setMonth(calendarDate.getMonth() + delta);
  renderCalendar();
}

function renderCalendar() {
  const title = document.getElementById("calendarTitle");
  const grid = document.getElementById("calendarGrid");
  const monthNames = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  title.innerText = `${monthNames[month]} ${year}`;
  grid.innerHTML = "";

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  let startDay = first.getDay();
  if (startDay === 0) startDay = 7;

  for (let i = 1; i < startDay; i++) {
    const empty = document.createElement("button");
    empty.className = "day-btn muted";
    grid.appendChild(empty);
  }

  const todayKey = formatDateKey(new Date());

  for (let day = 1; day <= last.getDate(); day++) {
    const current = new Date(year, month, day);
    const key = formatDateKey(current);
    const btn = document.createElement("button");

    btn.className = "day-btn";
    btn.innerText = day;

    if (key < todayKey) btn.classList.add("muted");
    if (key === selectedDate) btn.classList.add("selected");

    btn.onclick = () => {
      selectedDate = key;
      document.getElementById("dateButton").innerText = formatDateHuman(key);
      document.getElementById("calendarSheet").classList.remove("open");
      updateBookedSlots();
    };

    grid.appendChild(btn);
  }
}

function supabaseReady() {
  return !!supabaseClient;
}

async function fetchBookings() {
  if (!supabaseReady()) {
    bookingsCache = JSON.parse(localStorage.getItem("bookings")) || [];
    return bookingsCache;
  }

  const { data, error } = await supabaseClient
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    alert("Ошибка загрузки записей");
    bookingsCache = [];
    return [];
  }

  bookingsCache = data || [];
  return bookingsCache;
}

async function insertBooking(booking) {
  if (!supabaseReady()) {
    const local = JSON.parse(localStorage.getItem("bookings")) || [];
    local.push({
      ...booking,
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      created_at: new Date().toISOString()
    });
    localStorage.setItem("bookings", JSON.stringify(local));
    return;
  }

  const { error } = await supabaseClient.from("bookings").insert([booking]);
  if (error) {
    console.error(error);
    alert("Ошибка сохранения записи");
    throw error;
  }
}

async function deleteAllBookings() {
  if (!confirm("Удалить все записи?")) return;

  if (!supabaseReady()) {
    localStorage.removeItem("bookings");
  } else {
    const { error } = await supabaseClient
      .from("bookings")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (error) {
      console.error(error);
      alert("Ошибка удаления");
      return;
    }
  }

  await fetchBookings();
  loadBookings();
  updateBookedSlots();
  updateStats();
}

function isSlotBooked(date, time) {
  return bookingsCache.some(b => b.date === date && b.time === time);
}

function updateBookedSlots() {
  slots.forEach(slot => {
    const time = slot.innerText.trim();
    slot.classList.remove("booked-slot");

    if (selectedDate && isSlotBooked(selectedDate, time)) {
      slot.classList.add("booked-slot");
      slot.classList.remove("active-slot");
    }
  });

  const hasActive = [...slots].some(slot => slot.classList.contains("active-slot"));
  if (!hasActive) {
    const available = [...slots].find(slot => !slot.classList.contains("booked-slot"));
    if (available) {
      available.classList.add("active-slot");
      selectedTime = available.innerText.trim();
    }
  }
}

slots.forEach(slot => {
  slot.onclick = () => {
    if (!selectedDate) {
      alert("Сначала выберите дату");
      return;
    }

    if (slot.classList.contains("booked-slot")) {
      alert("Это время уже занято");
      return;
    }

    slots.forEach(s => s.classList.remove("active-slot"));
    slot.classList.add("active-slot");
    selectedTime = slot.innerText.trim();
  };
});

async function sendTelegramNotification(text) {
  if (BOT_TOKEN === "PASTE_NEW_BOT_TOKEN" || !BOT_TOKEN) {
    console.warn("Telegram bot token is not set");
    return;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: ADMIN_CHAT_ID, text })
  });
}

async function sendBooking() {
  hideKeyboard();

  const name = document.getElementById("name").value.trim();

  if (!name) {
    alert("Введите имя");
    return;
  }

  if (!selectedDate) {
    alert("Выберите дату");
    return;
  }

  await fetchBookings();

  if (isSlotBooked(selectedDate, selectedTime)) {
    alert("Это время уже занято");
    updateBookedSlots();
    return;
  }

  const booking = {
    name,
    service: selectedService,
    date: selectedDate,
    time: selectedTime,
    telegram_name: user?.first_name || "Неизвестно",
    telegram_username: user?.username ? "@" + user.username : "без username"
  };

  await insertBooking(booking);

  const text =
`🌿 Новая запись

👤 Имя: ${booking.name}

🛠 Услуга: ${booking.service}

📅 Дата: ${formatDateHuman(booking.date)}

⏰ Время: ${booking.time}

📲 Telegram: ${booking.telegram_name}
🔗 Username: ${booking.telegram_username}`;

  await sendTelegramNotification(text);

  document.getElementById("success").style.display = "block";
  document.getElementById("name").value = "";

  await fetchBookings();
  updateBookedSlots();
  loadBookings();
  updateStats();
}

function loadBookings() {
  const container = document.getElementById("bookingsList");
  container.innerHTML = "";

  if (bookingsCache.length === 0) {
    container.innerHTML = `<div class="empty-state">Пока нет записей</div>`;
    return;
  }

  bookingsCache.forEach(booking => {
    const item = document.createElement("div");
    item.className = "booking-item";

    item.innerHTML =
`<p>👤 ${booking.name}</p>
<p>🛠 ${booking.service}</p>
<p>📅 ${formatDateHuman(booking.date)}</p>
<p>⏰ ${booking.time}</p>
<p>🔗 ${booking.telegram_username || ""}</p>`;

    container.appendChild(item);
  });
}

function updateStats() {
  const today = formatDateKey(new Date());
  document.getElementById("totalCount").innerText = bookingsCache.length;
  document.getElementById("todayCount").innerText = bookingsCache.filter(b => b.date === today).length;
}


async function initApp() {
  setUserProfile();
  renderCalendar();

  await fetchServices();
  await fetchBookings();

  updateBookedSlots();
  updateStats();
  loadBookings();
}

initApp();
