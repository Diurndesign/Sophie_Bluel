//login.js
const form = document.querySelector("form")

form.addEventListener("submit", (event) => {
  event.preventDefault()

  // Email et mot de passe
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  // Appel a l'API
  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  })
  .then(response => response.json())
  .then(data => {
    const error = document.getElementById("errorMessage")
    if (data.token) {
      // Connexion OK → redirection index.html
      localStorage.setItem("token", data.token)
      window.location.href = "../index.html"
    } else {
      // Connexion KO → message d'erreur
      error.textContent = "Erreur dans l'identifiant ou le mot de passe"
      error.style.display = "block"
    }
  })
  .catch(error => {
    console.error("Error: ", error)
    // Echec réseau (back inaccessible) → message d'erreur dédié
    const errorEl = document.getElementById("errorMessage")
    errorEl.textContent = "Connexion au serveur impossible. Vérifiez votre connexion et réessayez."
    errorEl.style.display = "block"
  })
})