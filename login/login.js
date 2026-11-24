// Espace atelier · connexion à l'API (POST /api/users/login)
const API = "http://localhost:5678/api"

// Déjà connecté : retour direct au site
if (localStorage.getItem("token")) {
  window.location.replace("../index.html")
}

const form = document.getElementById("loginForm")
const errorEl = document.getElementById("errorMessage")
const submitBtn = document.getElementById("loginSubmit")
const password = document.getElementById("password")
const toggle = document.getElementById("togglePassword")

// Afficher / masquer le mot de passe
toggle.addEventListener("click", () => {
  const visible = password.type === "text"
  password.type = visible ? "password" : "text"
  toggle.textContent = visible ? "Afficher" : "Masquer"
  toggle.setAttribute("aria-pressed", String(!visible))
})

form.addEventListener("submit", (event) => {
  event.preventDefault()
  errorEl.textContent = ""

  const email = document.getElementById("email").value.trim()
  const pwd = password.value

  if (!email || !pwd) {
    errorEl.textContent = "Renseignez votre e-mail et votre mot de passe."
    return
  }

  submitBtn.classList.add("is-loading")
  submitBtn.textContent = "Connexion…"

  fetch(`${API}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: pwd }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.token) {
        localStorage.setItem("token", data.token)
        window.location.href = "../index.html#projets"
      } else {
        errorEl.textContent = "E-mail ou mot de passe incorrect."
      }
    })
    .catch(error => {
      console.error("Erreur :", error)
      errorEl.textContent = "Connexion au serveur impossible. Vérifiez votre connexion et réessayez."
    })
    .finally(() => {
      submitBtn.classList.remove("is-loading")
      submitBtn.textContent = "Se connecter"
    })
})
