// Redirection automatique si déjà connecté
const token = localStorage.getItem("token")
if (token) {
  window.location.href = "../index.html"
}

// Formulaire de connexion
const form = document.querySelector("form")

form.addEventListener("submit", (event) => {
  event.preventDefault()

  // Email et mot de passe
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const errorEl = document.getElementById("errorMessage")

  // Appel à l'API
  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.token) {
      // Connexion OK → sauvegarde du token et redirection
      localStorage.setItem("token", data.token)
      window.location.href = "../index.html"
    } else {
      // Connexion KO → message d'erreur
      errorEl.textContent = "Erreur dans l'identifiant ou le mot de passe"
      errorEl.style.display = "block"
    }
  })
  .catch(error => {
    console.error("Error: ", error)
    // Échec réseau (back inaccessible) → message d'erreur dédié
    errorEl.textContent = "Connexion au serveur impossible. Vérifiez votre connexion et réessayez."
    errorEl.style.display = "block"
  })
})