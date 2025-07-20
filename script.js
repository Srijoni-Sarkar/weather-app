const BACKEND_BASE_URL = "https://weather-chatbot-backend-wh5c.onrender.com"; 

function displayWeather(data) {
  const desc = data.weather[0].description;
  const emoji = getEmoji(desc);
  const city = data.name;
  const { lat, lon } = data.coord;

  document.getElementById("weatherIcon").textContent = emoji;
  document.getElementById("temp").textContent = `${Math.round(data.main.temp)}°C`;
  document.getElementById("feels").textContent = `${Math.round(data.main.feels_like)}°C`;
  document.getElementById("pressure").textContent = data.main.pressure;
  document.getElementById("humidity").textContent = data.main.humidity;
  document.getElementById("wind").textContent = data.wind.speed;
  document.getElementById("locationName").textContent = city;
  document.getElementById("weatherDesc").textContent = desc;
  document.getElementById("locationTitle").textContent = city;
  document.getElementById("error").textContent = "";

  fetchLocalTime(lat, lon);
}

function fetchLocalTime(lat, lon) {
  fetch(`${BACKEND_BASE_URL}/api/time?lat=${lat}&lon=${lon}`)
    .then(res => res.json())
    .then(data => {
      document.getElementById("localTime").textContent = "🕒 " + data.formatted || "Unknown";
    })
    .catch(() => {
      document.getElementById("localTime").textContent = "Error fetching local time";
    });
}

function searchCityWeather() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) return;
  fetch(`${BACKEND_BASE_URL}/api/weather?city=${encodeURIComponent(city)}`)
    .then(res => res.json())
    .then(displayWeather)
    .catch(() => {
      document.getElementById("error").textContent = "City not found. Try again.";
    });
}


if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetch(`${BACKEND_BASE_URL}/api/weather/coords?lat=${latitude}&lon=${longitude}`)
      .then(res => res.json())
      .then(displayWeather)
      .catch(() => {
        document.getElementById("error").textContent = "Failed to fetch weather.";
      });
  }, () => {
    document.getElementById("error").textContent = "Location access denied. Please search manually.";
  });
}


function toggleChat() {
  document.getElementById("chatContainer").classList.toggle("show");
}


let chatHistory = [];


const chatBody = document.getElementById("chatBody");
const typingIndicator = document.getElementById("typingIndicator");


function showTypingIndicator() {
  if (typingIndicator && chatBody) {
    
    if (typingIndicator.parentNode !== chatBody || chatBody.lastChild !== typingIndicator) {
      chatBody.appendChild(typingIndicator);
    }
    typingIndicator.style.display = "flex";
    chatBody.scrollTop = chatBody.scrollHeight; 
  }
}


function hideTypingIndicator() {
  if (typingIndicator) {
    typingIndicator.style.display = "none"; 
  }
}


function sendMessage() {
  const input = document.getElementById("userInput");
  const text = input.value.trim();
  if (!text) return;

 
  appendMessage("user", text);
  chatHistory.push({ role: "user", parts: [{ text: text }] });
  input.value = "";

  
  showTypingIndicator();

 
  fetch(`${BACKEND_BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt: text, history: chatHistory }) 
  })
    .then(res => res.json())
    .then(data => {
    
      hideTypingIndicator();

      const botReply = data.reply || "No reply.";
      appendMessage("bot", botReply);
      chatHistory.push({ role: "model", parts: [{ text: botReply }] });
    })
    .catch(() => {
     
      hideTypingIndicator();
      appendMessage("bot", "Error getting response. Please try again later.");
    });
}

function appendMessage(sender, msg) {
  const div = document.createElement("div");
  div.classList.add("message", sender === "user" ? "user-msg" : "bot-msg");
  div.textContent = msg;

 
  if (typingIndicator && typingIndicator.style.display !== 'none' && typingIndicator.parentNode === chatBody) {
    chatBody.insertBefore(div, typingIndicator);
  } else {
    chatBody.appendChild(div);
  }

  
  chatBody.scrollTop = chatBody.scrollHeight;
}

function handleEnter(e) {
  if (e.key === "Enter") sendMessage();
}


function getEmoji(desc) {
  const d = desc.toLowerCase();
  if (d.includes("cloud")) return "☁";
  if (d.includes("rain")) return "🌧";
  if (d.includes("clear")) return "☀";
  if (d.includes("snow")) return "❄";
  if (d.includes("storm") || d.includes("thunder")) return "⛈";
  return "🌤";
}

