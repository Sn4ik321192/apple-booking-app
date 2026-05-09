const API_BASE_URL = ""; 
const BOT_TOKEN = "PASTE_NEW_BOT_TOKEN";
const ADMIN_CHAT_ID = "6509764945";

const tg = window.Telegram?.WebApp;

if(tg){
  tg.expand();
  tg.ready();
  tg.disableVerticalSwipes?.();
}

const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=111111&color=ffffff";

const user = tg?.initDataUnsafe?.user;

function setUserProfile(){
  const avatarUrl = user?.photo_url ||
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(user?.first_name || "User") +
    "&background=111111&color=ffffff";

  document.getElementById("userName").innerText =
    user?.first_name || "Пользователь";

  document.getElementById("userUsername").innerText =
    user?.username ? "@" + user.username : "Telegram user";

  document.getElementById("userAvatar").src = avatarUrl || defaultAvatar;
  document.getElementById("profileAvatar").src = avatarUrl || defaultAvatar;

  document.getElementById("profileName").innerText =
    user?.first_name || "User";

  document.getElementById("profileUsername").innerText =
    user?.username ? "@" + user.username : "@telegram";
}

setUserProfile();

let selectedService = "💇 Стрижка";
let selectedDate = "";
let selectedTime = "10:00";
let calendarDate = new Date();

const slots = document.querySelectorAll(".time-slot");
const pages = {
  home: document.getElementById("homePage"),
  booking: document.getElementById("bookingPage"),
  admin: document.getElementById("adminPage"),
  profile: document.getElementById("profilePage"),
  assistant: document.getElementById("assistantPage")
};
const navItems = document.querySelectorAll(".nav-item");

function hideKeyboard(){
  if(document.activeElement && document.activeElement.blur){
    document.activeElement.blur();
  }
}

document.addEventListener("pointerdown", function(event){
  const tag = event.target.tagName;
  const isEditable = tag === "INPUT" || tag === "TEXTAREA";
  if(!isEditable){
    hideKeyboard();
  }
});

document.querySelectorAll("input").forEach(input=>{
  input.addEventListener("focus", ()=>{
    setTimeout(()=>{
      input.scrollIntoView({behavior:"smooth", block:"center"});
    }, 250);
  });
});

function selectService(element, service){
  selectedService = service;
  document.querySelectorAll(".service-card").forEach(card=>{
    card.classList.remove("active");
  });
  element.classList.add("active");
}

function showPage(pageName, navIndex){
  hideKeyboard();

  Object.values(pages).forEach(page=>{
    page.classList.remove("active-page");
  });

  pages[pageName].classList.add("active-page");

  navItems.forEach(item=>{
    item.classList.remove("active-nav");
  });

  if(typeof navIndex === "number"){
    navItems[navIndex].classList.add("active-nav");
  }

  window.scrollTo({top:0, behavior:"smooth"});

  if(pageName === "admin"){
    loadBookings();
  }
}

function openHomePage(){ showPage("home", 0); }
function openBookingPage(){ showPage("booking", 1); }
function openAdminPage(){ showPage("admin", 2); }
function openProfilePage(){ showPage("profile", 3); }
function openAssistantPage(){ showPage("assistant"); }

function formatDateKey(date){
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateHuman(key){
  if(!key) return "Выбрать дату";
  const [y,m,d] = key.split("-");
  return `${d}.${m}.${y}`;
}

function openCalendar(){
  hideKeyboard();
  document.getElementById("calendarSheet").classList.toggle("open");
  renderCalendar();
}

function changeMonth(delta){
  calendarDate.setMonth(calendarDate.getMonth() + delta);
  renderCalendar();
}

function renderCalendar(){
  const title = document.getElementById("calendarTitle");
  const grid = document.getElementById("calendarGrid");

  const monthNames = [
    "Январь","Февраль","Март","Апрель","Май","Июнь",
    "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"
  ];

  const year = calendarDate.getFullYear();
  const month = calendarDate.getMonth();

  title.innerText = `${monthNames[month]} ${year}`;
  grid.innerHTML = "";

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  let startDay = first.getDay();
  if(startDay === 0) startDay = 7;

  for(let i = 1; i < startDay; i++){
    const empty = document.createElement("button");
    empty.className = "day-btn muted";
    empty.innerText = "";
    grid.appendChild(empty);
  }

  const todayKey = formatDateKey(new Date());

  for(let day = 1; day <= last.getDate(); day++){
    const current = new Date(year, month, day);
    const key = formatDateKey(current);

    const btn = document.createElement("button");
    btn.className = "day-btn";
    btn.innerText = day;

    if(key < todayKey){
      btn.classList.add("muted");
    }

    if(key === selectedDate){
      btn.classList.add("selected");
    }

    btn.onclick = ()=>{
      selectedDate = key;
      document.getElementById("dateButton").innerText = formatDateHuman(key);
      document.getElementById("calendarSheet").classList.remove("open");
      updateBookedSlots();
    };

    grid.appendChild(btn);
  }
}

function getLocalBookings(){
  return JSON.parse(localStorage.getItem("bookings")) || [];
}

function saveLocalBookings(bookings){
  localStorage.setItem("bookings", JSON.stringify(bookings));
}

function isSlotBooked(date, time){
  return getLocalBookings().some(b => b.date === date && b.time === time);
}

function updateBookedSlots(){
  slots.forEach(slot=>{
    const time = slot.innerText.trim();

    slot.classList.remove("booked-slot");

    if(selectedDate && isSlotBooked(selectedDate, time)){
      slot.classList.add("booked-slot");
      slot.classList.remove("active-slot");
    }
  });

  const available = [...slots].find(s => !s.classList.contains("booked-slot"));

  if(available && ![...slots].some(s => s.classList.contains("active-slot"))){
    available.classList.add("active-slot");
    selectedTime = available.innerText.trim();
  }
}

slots.forEach(slot=>{
  slot.onclick = ()=>{
    if(!selectedDate){
      alert("Сначала выберите дату");
      return;
    }

    if(slot.classList.contains("booked-slot")){
      alert("Это время уже занято");
      return;
    }

    slots.forEach(s=>s.classList.remove("active-slot"));
    slot.classList.add("active-slot");
    selectedTime = slot.innerText.trim();
  };
});

async function sendTelegramNotification(text){
  if(!BOT_TOKEN || BOT_TOKEN === "PASTE_NEW_BOT_TOKEN"){
    console.warn("Bot token is not set");
    return true;
  }

  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

  const response = await fetch(url,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      chat_id:ADMIN_CHAT_ID,
      text
    })
  });

  return response.ok;
}

async function createBookingOnBackend(booking){
  if(!API_BASE_URL){
    return null;
  }

  const response = await fetch(`${API_BASE_URL}/api/bookings`,{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(booking)
  });

  if(!response.ok){
    throw new Error("Backend booking error");
  }

  return await response.json();
}

async function sendBooking(){
  hideKeyboard();

  const name = document.getElementById("name").value.trim();

  if(!name){
    alert("Введите имя");
    return;
  }

  if(!selectedDate){
    alert("Выберите дату");
    return;
  }

  if(isSlotBooked(selectedDate, selectedTime)){
    alert("Это время уже занято");
    updateBookedSlots();
    return;
  }

  const booking = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    service: selectedService,
    date: selectedDate,
    time: selectedTime,
    telegramName: user?.first_name || "Неизвестно",
    telegramUsername: user?.username ? "@" + user.username : "без username",
    createdAt: new Date().toISOString()
  };

  try{
    await createBookingOnBackend(booking);
  }catch(error){
    console.warn("Backend unavailable, saved locally");
  }

  const bookings = getLocalBookings();

  if(bookings.some(b => b.date === booking.date && b.time === booking.time)){
    alert("Это время уже занято");
    updateBookedSlots();
    return;
  }

  bookings.push(booking);
  saveLocalBookings(bookings);

  const text =
`🔥 Новая заявка

👤 Имя: ${booking.name}

🛠 Услуга: ${booking.service}

📅 Дата: ${formatDateHuman(booking.date)}

⏰ Время: ${booking.time}

📲 Telegram: ${booking.telegramName}
🔗 Username: ${booking.telegramUsername}`;

  await sendTelegramNotification(text);

  document.getElementById("success").style.display = "block";
  document.getElementById("name").value = "";

  updateBookedSlots();
  updateStats();
  loadBookings();
}

function loadBookings(){
  const container = document.getElementById("bookingsList");
  const bookings = getLocalBookings()
    .sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));

  container.innerHTML = "";

  if(bookings.length === 0){
    container.innerHTML = `<div class="empty-state">Пока нет записей</div>`;
    return;
  }

  bookings.forEach(booking=>{
    const item = document.createElement("div");
    item.className = "booking-item";
    item.innerHTML = `
      <p>👤 ${booking.name}</p>
      <p>🛠 ${booking.service}</p>
      <p>📅 ${formatDateHuman(booking.date)}</p>
      <p>⏰ ${booking.time}</p>
      <p>🔗 ${booking.telegramUsername || ""}</p>
    `;
    container.appendChild(item);
  });
}

function clearLocalBookings(){
  if(!confirm("Удалить все локальные записи?")) return;
  localStorage.removeItem("bookings");
  loadBookings();
  updateBookedSlots();
  updateStats();
}

function updateStats(){
  const bookings = getLocalBookings();
  const today = formatDateKey(new Date());

  document.getElementById("totalCount").innerText = bookings.length;
  document.getElementById("todayCount").innerText =
    bookings.filter(b => b.date === today).length;
}

function askAssistant(){
  const input = document.getElementById("aiInput");
  const chat = document.getElementById("chatBox");
  const question = input.value.trim();

  if(!question) return;

  const userDiv = document.createElement("div");
  userDiv.className = "user-msg";
  userDiv.innerText = question;
  chat.appendChild(userDiv);

  input.value = "";

  const answer = getAssistantAnswer(question);

  const botDiv = document.createElement("div");
  botDiv.className = "bot-msg";
  botDiv.innerText = answer;
  chat.appendChild(botDiv);

  chat.scrollTop = chat.scrollHeight;
}

function getAssistantAnswer(question){
  const q = question.toLowerCase();

  if(q.includes("цена") || q.includes("стоимость")){
    return "Стоимость зависит от услуги. Для демо можно поставить: стрижка — 300 лей, маникюр — 400 лей.";
  }

  if(q.includes("время") || q.includes("свобод")){
    return "Выберите дату на странице Booking — занятые слоты автоматически станут недоступны.";
  }

  if(q.includes("услуг")){
    return "Сейчас доступны: стрижка, маникюр и другое. Позже можно добавить любые услуги.";
  }

  return "Я могу помочь выбрать услугу, дату и свободное время. Перейдите во вкладку Booking.";
}

renderCalendar();
updateStats();
loadBookings();
updateBookedSlots();
