const tg = window.Telegram?.WebApp;

if(tg){
  tg.expand();
  tg.ready();
}

const user = tg?.initDataUnsafe?.user;

if(user){

  const avatarUrl =
    user.photo_url ||
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(user.first_name || "User");

  document.getElementById("userName").innerText =
    user.first_name || "Пользователь";

  document.getElementById("userUsername").innerText =
    user.username ? "@" + user.username : "Telegram user";

  document.getElementById("userAvatar").src = avatarUrl;

  document.getElementById("profileAvatar").src = avatarUrl;

  document.getElementById("profileName").innerText =
    user.first_name || "User";

  document.getElementById("profileUsername").innerText =
    user.username ? "@" + user.username : "@telegram";
}

let selectedService = "💇 Стрижка";
let selectedTime = "10:00";

function selectService(element, service){

  selectedService = service;

  document.querySelectorAll(".service-card")
    .forEach(card=>{
      card.classList.remove("active");
    });

  element.classList.add("active");
}

const slots =
  document.querySelectorAll(".time-slot");

slots.forEach(slot=>{

  slot.onclick = ()=>{

    slots.forEach(s=>{
      s.classList.remove("active-slot");
    });

    slot.classList.add("active-slot");

    selectedTime = slot.innerText;
  };
});

const pages = {
  home: document.getElementById("homePage"),
  booking: document.getElementById("bookingPage"),
  profile: document.getElementById("profilePage")
};

const navItems =
  document.querySelectorAll(".nav-item");

function hidePages(){

  Object.values(pages)
    .forEach(page=>{
      page.classList.remove("active-page");
    });
}

function setActiveNav(index){

  navItems.forEach(item=>{
    item.classList.remove("active-nav");
  });

  navItems[index]
    .classList.add("active-nav");
}

function openHomePage(){

  hidePages();

  pages.home.classList.add("active-page");

  setActiveNav(0);
}

function openBookingPage(){

  hidePages();

  pages.booking.classList.add("active-page");

  setActiveNav(1);
}

function openProfilePage(){

  hidePages();

  pages.profile.classList.add("active-page");

  setActiveNav(2);
}

document.addEventListener("click", function(event){

  const isInput =
    event.target.tagName === "INPUT";

  if(!isInput && document.activeElement){
    document.activeElement.blur();
  }
});

async function sendData(){

  const name =
    document.getElementById("name").value.trim();

  const date =
    document.getElementById("date").value;

  const time = selectedTime;

  if(!name){
    alert("Введите имя");
    return;
  }

  if(!date){
    alert("Выберите дату");
    return;
  }

  const botToken =
    "8708273025:AAFCkyhImnun4XRnHsMhi0vV1lDBGnobI8Q";

  const chatId =
    "6509764945";

  const text =
`🔥 Новая заявка

👤 Имя: ${name}

🛠 Услуга: ${selectedService}

📅 Дата: ${date}

⏰ Время: ${time}`;

  const url =
`https://api.telegram.org/bot${botToken}/sendMessage`;

  try{

    await fetch(url,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        chat_id:chatId,
        text:text
      })
    });

    document.getElementById("success")
      .style.display = "block";

  }catch(error){

    alert("Ошибка отправки");
  }
}
