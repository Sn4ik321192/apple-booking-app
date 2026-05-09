const tg = window.Telegram.WebApp;

tg.expand();

const user = tg.initDataUnsafe?.user;

if(user){

  document.getElementById("userName").innerText =
    user.first_name || "Пользователь";

  document.getElementById("userUsername").innerText =
    user.username
      ? "@" + user.username
      : "Telegram user";

  if(user.photo_url){

    document.getElementById("userAvatar").src =
      user.photo_url;

  }else{

    document.getElementById("userAvatar").src =
      "https://ui-avatars.com/api/?name="
      + encodeURIComponent(user.first_name || "User");
  }
}

let selectedService = "💇 Стрижка";

function selectService(element,service){

  selectedService = service;

  document
    .querySelectorAll(".service-card")
    .forEach(card=>{
      card.classList.remove("active");
    });

  element.classList.add("active");
}

async function sendData(){

  let name =
    document.getElementById("name").value;

  let service = selectedService;

  let time =
    document.getElementById("time").value;

  let botToken =
    "8708273025:AAFCkyhImnun4XRnHsMhi0vV1lDBGnobI8Q";

  let chatId =
    "6509764945";

  let text =
`🔥 Новая заявка

👤 Имя: ${name}

🛠 Услуга: ${service}

⏰ Время: ${time}`;

  let url =
`https://api.telegram.org/bot${botToken}/sendMessage`;

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
}