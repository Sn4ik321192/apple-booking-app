const tg = window.Telegram?.WebApp;

if(tg){
  tg.expand();
  tg.ready();
}

const user = tg?.initDataUnsafe?.user;

const defaultAvatar =
  "https://ui-avatars.com/api/?name=User&background=111111&color=ffffff";

if(user){
  const avatarUrl = user.photo_url ||
    "https://ui-avatars.com/api/?name=" +
    encodeURIComponent(user.first_name || "User") +
    "&background=111111&color=ffffff";

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
}else{
  document.getElementById("userAvatar").src = defaultAvatar;
  document.getElementById("profileAvatar").src = defaultAvatar;
}

let selectedService = "💇 Стрижка";

function selectService(element, service){
  selectedService = service;

  document.querySelectorAll(".service-card").forEach(card=>{
    card.classList.remove("active");
  });

  element.classList.add("active");
}

const pages = {
  home: document.getElementById("homePage"),
  booking: document.getElementById("bookingPage"),
  profile: document.getElementById("profilePage")
};

const navItems = document.querySelectorAll(".nav-item");

function hideKeyboard(){
  if(document.activeElement){
    document.activeElement.blur();
  }
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

  navItems[navIndex].classList.add("active-nav");

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });
}

function openHomePage(){
  showPage("home", 0);
}

function openBookingPage(){
  showPage("booking", 1);
}

function openProfilePage(){
  showPage("profile", 2);
}

document.addEventListener("click", function(event){
  const isInput =
    event.target.tagName === "INPUT" ||
    event.target.tagName === "SELECT" ||
    event.target.tagName === "TEXTAREA";

  if(!isInput){
    hideKeyboard();
  }
});

document.querySelectorAll("input, select").forEach(element=>{
  element.addEventListener("focus", ()=>{
    setTimeout(()=>{
      element.scrollIntoView({
        behavior:"smooth",
        block:"center"
      });
    }, 250);
  });
});

async function sendData(){
  hideKeyboard();

  const name = document.getElementById("name").value.trim();
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

  if(!name){
    alert("Введите имя");
    return;
  }

  if(!date){
    alert("Выберите дату");
    return;
  }

  const botToken = "8708273025:AAFCkyhImnun4XRnHsMhi0vV1lDBGnobI8Q";
  const chatId = "6509764945";

  const telegramName = user?.first_name || "Неизвестно";
  const telegramUsername = user?.username
    ? "@" + user.username
    : "без username";

  const text =
`🔥 Новая заявка

👤 Имя: ${name}

🛠 Услуга: ${selectedService}

📅 Дата: ${date}

⏰ Время: ${time}

📲 Telegram: ${telegramName}
🔗 Username: ${telegramUsername}`;

  const url =
    `https://api.telegram.org/bot${botToken}/sendMessage`;

  try{
    const response = await fetch(url,{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        chat_id:chatId,
        text:text
      })
    });

    if(!response.ok){
      alert("Ошибка отправки заявки");
      return;
    }

    document.getElementById("success").style.display = "block";

    document.getElementById("name").value = "";
    document.getElementById("date").value = "";

  }catch(error){
    alert("Нет соединения. Попробуйте ещё раз.");
  }
}
