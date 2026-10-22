// Vérification de la connexion
const token = localStorage.getItem("token")

// Gestion du loader : il ne disparaît qu'une fois les données chargées (succès ou échec),
// avec un délai minimum pour éviter un flash trop brusque sur une connexion très rapide
const loader = document.querySelector(".loader")
const isFirstVisit = !sessionStorage.getItem("loaderShown")
sessionStorage.setItem("loaderShown", "true")

if (!isFirstVisit) {
  // Visite suivante → suppression immédiate, pas d'animation
  loader.remove()
}

const minLoaderDelay = new Promise(resolve => setTimeout(resolve, 500))

function hideLoader() {
  if (!isFirstVisit) return // déjà supprimé

  minLoaderDelay.then(() => {
    loader.style.transition = "opacity 1.2s ease"
    loader.style.opacity = "0"
    setTimeout(() => loader.remove(), 1200)
  })
}

// Récupération des projets et catégories en parallèle
Promise.all([
  fetch("http://localhost:5678/api/works").then(response => response.json()),
  fetch("http://localhost:5678/api/categories").then(response => response.json())
])
.then(([works, categories]) => {
  displayWorks(works)
  if (!token) {
    displayFilters(works, categories)
  }
  hideLoader()
})
.catch(error => {
  console.error('Erreur: ', error)
  // Back inaccessible (perte réseau, serveur down...) → message visible
  const galleryError = document.getElementById("galleryError")
  galleryError.textContent = "Impossible de charger les projets. Réessayez plus tard."
  galleryError.style.display = "block"
  hideLoader()
})

// Création d'une figure pour la galerie principale
function createGalleryFigure(work) {
  const figure = document.createElement("figure")
  const img = document.createElement("img")
  img.src = work.imageUrl
  img.alt = work.title
  const figcaption = document.createElement("figcaption")
  figcaption.textContent = work.title
  figure.appendChild(img)
  figure.appendChild(figcaption)
  return figure
}

// Affichage des projets dans la galerie
function displayWorks(works) {
  const gallery = document.querySelector(".gallery")
  gallery.innerHTML = ""
  works.forEach(work => gallery.appendChild(createGalleryFigure(work)))
}

// Suppression de la classe active sur les boutons
function removeActive() {
  document.querySelectorAll(".filters button")
    .forEach(btn => btn.classList.remove("active"))
}

// Génération des boutons de filtre
function displayFilters(works, categories) {
  const filters = document.querySelector(".filters")

  // Bouton "Tous" actif par défaut
  const btnAll = document.createElement("button")
  btnAll.textContent = "Tous"
  btnAll.classList.add("active")
  btnAll.addEventListener("click", () => {
    removeActive()
    btnAll.classList.add("active")
    displayWorks(works)
  })
  filters.appendChild(btnAll)

  // Un bouton par catégorie
  categories.forEach(category => {
    const btn = document.createElement("button")
    btn.textContent = category.name
    btn.addEventListener("click", () => {
      removeActive()
      btn.classList.add("active")
      const filteredWorks = works.filter(work => work.categoryId === category.id)
      displayWorks(filteredWorks)
    })
    filters.appendChild(btn)
  })
}

// Gestion du mode édition
const editBanner = document.getElementById("editBanner")
const editButton = document.getElementById("editButton")
const filtersDiv = document.getElementById("filters")
const loginNav = document.getElementById("loginNav")

if (token) {
  // Sophie est connectée → affichage du mode édition
  document.getElementById("portfolio").classList.add("no-filters")
  editBanner.style.display = "block"
  editButton.style.display = "inline-block"
  document.body.style.marginTop = "40px"
  filtersDiv.style.display = "none"
  loginNav.innerHTML = "<a href='#'>logout</a>"

  // Déconnexion au clic sur logout
  loginNav.addEventListener("click", () => {
    localStorage.removeItem("token")
    window.location.reload()
  })

} else {
  // Visiteur → masquage des éléments d'édition
  editBanner.style.display = "none"
  editButton.style.display = "none"
  document.body.style.marginTop = "0"
}

// Gestion de la modale
const modal = document.getElementById("modal")
const modalClose = document.getElementById("modalClose")
const modalGallery = document.getElementById("modalGallery")
const modalForm = document.getElementById("modalForm")
const modalAddBtn = document.getElementById("modalAddBtn")
const modalBack = document.getElementById("modalBack")
const modalOverlay = document.querySelector(".modal__overlay")
const editBtn = document.getElementById("editButton")
const modalUpload = document.getElementById("modalUpload")
const uploadPreview = modalUpload.querySelector("img")
const formError = document.getElementById("formError")
const modalSuccess = document.getElementById("modalSuccess")
const formSuccess = document.getElementById("formSuccess")
const modalError = document.getElementById("modalError")

// Affichage d'un message d'erreur persistant dans la galerie de la modale
function showModalError(message) {
  modalError.textContent = message
  modalError.style.display = "block"
}
const modalConfirm = document.getElementById("modalConfirm")
const confirmImage = document.getElementById("confirmImage")
const confirmTitle = document.getElementById("confirmTitle")
const confirmCancel = document.getElementById("confirmCancel")
const confirmDelete = document.getElementById("confirmDelete")
let workToDelete = null

// Affichage de la confirmation de suppression pour un projet donné
function askDeleteConfirmation(work) {
  workToDelete = work
  confirmImage.src = work.imageUrl
  confirmImage.alt = work.title
  confirmTitle.textContent = work.title
  modalConfirm.classList.add("active")
}

confirmCancel.addEventListener("click", () => {
  workToDelete = null
  modalConfirm.classList.remove("active")
})

// Suppression effective du projet après confirmation
confirmDelete.addEventListener("click", () => {
  if (!workToDelete) return

  fetch(`http://localhost:5678/api/works/${workToDelete.id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("La suppression a échoué.")
    }

    modalConfirm.classList.remove("active")
    workToDelete = null

    // Rechargement de la grille et de la galerie principale
    loadModalWorks()
    showSuccess(modalSuccess, "Photo supprimée avec succès")
    fetch("http://localhost:5678/api/works")
      .then(r => r.json())
      .then(works => displayWorks(works))
  })
  .catch(error => {
    console.error("Erreur: ", error)
    modalConfirm.classList.remove("active")
    showModalError(
      error.message === "La suppression a échoué."
        ? error.message
        : "Connexion au serveur impossible. Réessayez plus tard"
    )
  })
})

// Ouverture de la modale
editBtn.addEventListener("click", () => {
  modal.classList.add("active")
  showGallery()
  loadModalWorks()
  modalSuccess.style.display = "none"
  modalConfirm.classList.remove("active")
  workToDelete = null
})

// Fermeture de la modale
modalClose.addEventListener("click", () => modal.classList.remove("active"))
modalOverlay.addEventListener("click", () => {
  // Un clic en dehors ferme d'abord la confirmation si elle est ouverte
  if (modalConfirm.classList.contains("active")) {
    modalConfirm.classList.remove("active")
    workToDelete = null
  } else {
    modal.classList.remove("active")
  }
})

// Passage vers le formulaire d'ajout
modalAddBtn.addEventListener("click", () => {
  modalGallery.style.display = "none"
  modalForm.style.display = "block"
  loadCategories()
  resetAddWorkForm()
})

// Retour vers la galerie
modalBack.addEventListener("click", () => {
  modalForm.style.display = "none"
  modalGallery.style.display = "block"
})

// Affichage de la vue galerie
function showGallery() {
  modalGallery.style.display = "block"
  modalForm.style.display = "none"
}

// Affichage temporaire d'un message de confirmation
function showSuccess(element, message) {
  element.textContent = message
  element.style.display = "block"
  setTimeout(() => element.style.display = "none", 3000)
}

// Création d'une figure pour la grille de la modale (avec bouton de suppression)
function createModalFigure(work) {
  const figure = document.createElement("figure")
  const img = document.createElement("img")
  img.src = work.imageUrl
  img.alt = work.title

  const deleteBtn = document.createElement("button")
  deleteBtn.classList.add("delete-btn")
  deleteBtn.innerHTML = `<img src="./assets/icons/recycle.svg" alt="supprimer">`

  // Demande de confirmation au clic sur la corbeille
  deleteBtn.addEventListener("click", () => askDeleteConfirmation(work))

  figure.appendChild(img)
  figure.appendChild(deleteBtn)
  return figure
}

// Chargement des projets dans la grille de la modale
function loadModalWorks() {
  const modalGrid = document.getElementById("modalGrid")
  modalGrid.innerHTML = ""
  modalError.style.display = "none"

  fetch("http://localhost:5678/api/works")
    .then(response => response.json())
    .then(works => {
      works.forEach(work => modalGrid.appendChild(createModalFigure(work)))
    })
    .catch(error => {
      console.error("Erreur: ", error)
      showModalError("Impossible de charger les projets. Réessayez plus tard.")
    })
}

// Chargement des catégories dans le select
function loadCategories() {
  const select = document.getElementById("workCategory")

  // Évite de charger les catégories plusieurs fois
  if (select.children.length > 1) return

  fetch("http://localhost:5678/api/categories")
    .then(response => response.json())
    .then(categories => {
      categories.forEach(category => {
        const option = document.createElement("option")
        option.value = category.id
        option.textContent = category.name
        select.appendChild(option)
      })
    })
    .catch(error => {
      console.error("Erreur: ", error)
      formError.textContent = "Impossible de charger les catégories. Réessayez plus tard."
      formError.style.display = "block"
    })
}

// Envoi du formulaire d'ajout de projet
document.getElementById("addWorkForm").addEventListener("submit", (event) => {
  event.preventDefault()

  const title = document.getElementById("workTitle").value
  const category = document.getElementById("workCategory").value
  const file = document.getElementById("fileInput").files[0]

  // Vérification que tous les champs sont remplis
  if (!title || !category || !file) {
    formError.textContent = "Veuillez remplir tous les champs et sélectionner une image."
    formError.style.display = "block"
    return
  }

  // Construction du FormData pour l'envoi de l'image
  const formData = new FormData()
  formData.append("title", title)
  formData.append("category", category)
  formData.append("image", file)

  fetch("http://localhost:5678/api/works", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`
    },
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      throw new Error("L'ajout du projet a échoué.")
    }
    return response.json()
  })
  .then(newWork => {
    // Ajout du nouveau projet dans la grille de la modale et dans la galerie principale, sans recharger la page
    document.getElementById("modalGrid").appendChild(createModalFigure(newWork))
    document.querySelector(".gallery").appendChild(createGalleryFigure(newWork))

    // Réinitialisation du formulaire et de la preview : on reste sur la vue formulaire
    // pour permettre d'ajouter une nouvelle photo directement, sans re-cliquer sur "Ajouter une photo"
    resetAddWorkForm()

    // Confirmation visuelle de l'ajout
    showSuccess(formSuccess, "Photo ajoutée avec succès")
  })
  .catch(error => {
    console.error("Erreur: ", error)
    formError.textContent = error.message === "L'ajout du projet a échoué."
      ? error.message
      : "Connexion au serveur impossible. Réessayez plus tard."
    formError.style.display = "block"
  })
})

// Activation du bouton valider quand le formulaire est complet
const submitBtn = document.getElementById("submitBtn")
const workTitle = document.getElementById("workTitle")
const workCategory = document.getElementById("workCategory")
const fileInput = document.getElementById("fileInput")

function checkForm() {
  if (workTitle.value && workCategory.value && fileInput.files[0]) {
    // Formulaire complet → bouton actif
    submitBtn.classList.add("active")
    submitBtn.style.pointerEvents = "all"
  } else {
    // Formulaire incomplet → bouton grisé
    submitBtn.classList.remove("active")
    submitBtn.style.pointerEvents = "none"
  }
}

workTitle.addEventListener("input", checkForm)
workCategory.addEventListener("change", checkForm)
// Vérifie la signature binaire ("magic bytes") du fichier : plus fiable que son
// type MIME ou son extension, qui peuvent être falsifiés.
function isJpegOrPng(file) {
  return file.slice(0, 4).arrayBuffer().then(buffer => {
    const [b0, b1, b2, b3] = new Uint8Array(buffer)
    const isJpeg = b0 === 0xff && b1 === 0xd8 && b2 === 0xff
    const isPng = b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47
    return isJpeg || isPng
  })
}

// Rejet du fichier sélectionné (mauvais format ou trop lourd)
function rejectFile() {
  fileInput.value = ""
  formError.textContent = "Veuillez choisir une image au format jpg ou png de 4mo maximum."
  formError.style.display = "block"
  checkForm()
}

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0]
  formError.style.display = "none"

  if (!file) {
    checkForm()
    return
  }

  const isValidSize = file.size <= 4 * 1024 * 1024 // 4mo max
  if (!isValidSize) {
    rejectFile()
    return
  }

  isJpegOrPng(file).then(isValid => {
    if (!isValid) {
      rejectFile()
      return
    }

    // Affichage de la preview de l'image sélectionnée, avec un fondu d'apparition
    const reader = new FileReader()
    reader.onload = () => {
      uploadPreview.style.opacity = "0"
      uploadPreview.src = reader.result
      modalUpload.classList.add("has-preview")
      requestAnimationFrame(() => uploadPreview.style.opacity = "1")
    }
    reader.readAsDataURL(file)
    checkForm()
  })
})

// Réinitialisation du formulaire d'ajout (champs, preview, erreur)
function resetAddWorkForm() {
  document.getElementById("addWorkForm").reset()
  modalUpload.classList.remove("has-preview")
  uploadPreview.src = "./assets/icons/pictures.svg"
  uploadPreview.style.opacity = ""
  formError.style.display = "none"
  formSuccess.style.display = "none"
  checkForm()
}

// Formulaire de contact : pas de backend dédié, simple confirmation visuelle à l'envoi
const contactForm = document.getElementById("contactForm")
const contactSubmit = document.getElementById("contactSubmit")

contactForm.addEventListener("submit", (event) => {
  event.preventDefault()

  contactSubmit.style.backgroundColor = "#0E2F28"
  setTimeout(() => contactSubmit.style.backgroundColor = "", 1000)
})

// Bouton retour en haut de page, visible après un certain défilement
const backToTop = document.getElementById("backToTop")

window.addEventListener("scroll", () => {
  backToTop.classList.toggle("visible", window.scrollY > 400)
})

backToTop.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" })
})