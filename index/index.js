// ==========================================================
//  Atelier Chaux · page d'accueil
//  Galerie filtrable, fiche projet, administration (ajout / retrait)
//  API REST : http://localhost:5678/api (simulée en ligne par demo/demo-api.js)
// ==========================================================
const API = "http://localhost:5678/api"
const token = localStorage.getItem("token")
const isAdmin = Boolean(token)

const state = {
  works: [],
  categories: [],
  activeCategory: null, // null = tous
}

const $ = (selector) => document.querySelector(selector)

// ---------- Utilitaires ----------

// Sépare "Restaurant Sushisen - Londres" en titre + lieu
function splitTitle(title) {
  const parts = String(title).split(/\s+-\s+/)
  return parts.length > 1
    ? { name: parts.slice(0, -1).join(" - "), place: parts.at(-1) }
    : { name: title, place: "" }
}

function categoryName(id) {
  const category = state.categories.find(c => c.id === Number(id))
  return category ? category.name : ""
}

function visibleWorks() {
  return state.activeCategory === null
    ? state.works
    : state.works.filter(w => w.categoryId === state.activeCategory)
}

let toastTimer
function toast(message) {
  const el = $("#toast")
  el.textContent = message
  el.classList.add("is-visible")
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => el.classList.remove("is-visible"), 3000)
}

function authHeaders() {
  return { Authorization: `Bearer ${token}` }
}

// ---------- Chargement des données ----------

function loadData() {
  return Promise.all([
    fetch(`${API}/works`).then(r => r.json()),
    fetch(`${API}/categories`).then(r => r.json()),
  ]).then(([works, categories]) => {
    state.works = works
    state.categories = categories
  })
}

// ---------- Galerie publique ----------

function createCard(work, index) {
  const { name, place } = splitTitle(work.title)
  const li = document.createElement("li")
  li.className = "card"
  li.style.animationDelay = `${Math.min(index, 8) * 60}ms`

  const button = document.createElement("button")
  button.type = "button"
  button.className = "card__btn"
  button.setAttribute("aria-label", `Voir le projet ${work.title}`)
  button.addEventListener("click", () => openViewer(work.id))

  const media = document.createElement("div")
  media.className = "card__media"
  const img = document.createElement("img")
  img.src = work.imageUrl
  img.alt = work.title
  img.loading = "lazy"
  img.width = 610
  img.height = 814
  media.appendChild(img)

  const meta = document.createElement("div")
  meta.className = "card__meta"
  const title = document.createElement("h3")
  title.className = "card__title"
  title.textContent = name
  const num = document.createElement("span")
  num.className = "card__num"
  num.textContent = String(index + 1).padStart(2, "0")
  meta.append(title, num)

  const sub = document.createElement("p")
  sub.className = "card__sub"
  sub.textContent = [categoryName(work.categoryId), place].filter(Boolean).join(" · ")

  button.append(media, meta, sub)
  li.appendChild(button)
  return li
}

function renderGallery() {
  const gallery = $("#gallery")
  gallery.innerHTML = ""
  visibleWorks().forEach((work, i) => gallery.appendChild(createCard(work, i)))
  gallery.setAttribute("aria-busy", "false")
  $("#factProjects").textContent = state.works.length
}

function renderFilters() {
  const filters = $("#filters")
  filters.innerHTML = ""

  const entries = [{ id: null, name: "Tous", count: state.works.length }].concat(
    state.categories.map(c => ({
      id: c.id,
      name: c.name,
      count: state.works.filter(w => w.categoryId === c.id).length,
    }))
  )

  entries.forEach(entry => {
    const btn = document.createElement("button")
    btn.type = "button"
    btn.innerHTML = `<span></span><sup></sup>`
    btn.querySelector("span").textContent = entry.name
    btn.querySelector("sup").textContent = entry.count
    btn.setAttribute("aria-pressed", String(entry.id === state.activeCategory))
    btn.addEventListener("click", () => {
      state.activeCategory = entry.id
      filters.querySelectorAll("button").forEach(b => b.setAttribute("aria-pressed", "false"))
      btn.setAttribute("aria-pressed", "true")
      renderGallery()
    })
    filters.appendChild(btn)
  })
}

// ---------- Fiche projet (dialog) ----------

const viewer = $("#viewer")
let viewerIndex = 0

function openViewer(workId) {
  viewerIndex = visibleWorks().findIndex(w => w.id === workId)
  fillViewer()
  if (!viewer.open) viewer.showModal()
}

function fillViewer() {
  const list = visibleWorks()
  const work = list[viewerIndex]
  if (!work) return
  const { name, place } = splitTitle(work.title)
  $("#viewerImg").src = work.imageUrl
  $("#viewerImg").alt = work.title
  $("#viewerCat").textContent = categoryName(work.categoryId)
  $("#viewerTitle").textContent = name
  $("#viewerPlace").textContent = place ? `Lieu : ${place}` : ""
  $("#viewerCount").textContent = `${String(viewerIndex + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`
}

function stepViewer(delta) {
  const length = visibleWorks().length
  viewerIndex = (viewerIndex + delta + length) % length
  fillViewer()
}

$("#viewerPrev").addEventListener("click", () => stepViewer(-1))
$("#viewerNext").addEventListener("click", () => stepViewer(1))
viewer.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft") stepViewer(-1)
  if (e.key === "ArrowRight") stepViewer(1)
})

// Fermeture des dialogues : bouton ✕ ou clic sur le fond
document.querySelectorAll("dialog").forEach(dialog => {
  dialog.querySelectorAll("[data-close]").forEach(btn => btn.addEventListener("click", () => dialog.close()))
  dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close() })
})

// ---------- Démarrage ----------

loadData()
  .then(() => {
    renderFilters()
    renderGallery()
  })
  .catch(error => {
    console.error("Erreur :", error)
    $("#gallery").innerHTML = ""
    $("#gallery").setAttribute("aria-busy", "false")
    $("#galleryStatus").textContent = "Impossible de charger les projets pour le moment. Réessayez dans quelques instants."
  })

// ---------- En-tête : ombre au défilement + lien actif ----------

const header = $(".site-header")
window.addEventListener("scroll", () => {
  header.classList.toggle("is-scrolled", window.scrollY > 10)
}, { passive: true })

const navLinks = document.querySelectorAll(".site-nav a[href^='#']")
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return
    navLinks.forEach(a => a.setAttribute("aria-current", String(a.getAttribute("href") === `#${entry.target.id}`)))
  })
}, { rootMargin: "-45% 0px -50% 0px" })
document.querySelectorAll("main section[id]").forEach(s => observer.observe(s))

// ---------- Formulaire de contact (pas de back-end : validation + confirmation) ----------

$("#contactForm").addEventListener("submit", (e) => {
  e.preventDefault()
  const form = e.currentTarget
  const msg = $("#contactMsg")
  let firstInvalid = null

  form.querySelectorAll("[required]").forEach(field => {
    const valid = field.checkValidity() && field.value.trim() !== ""
    field.setAttribute("aria-invalid", String(!valid))
    if (!valid && !firstInvalid) firstInvalid = field
  })

  if (firstInvalid) {
    msg.classList.remove("is-ok")
    msg.textContent = "Merci de renseigner votre nom, un e-mail valide et un message."
    firstInvalid.focus()
    return
  }

  msg.classList.add("is-ok")
  msg.textContent = "Merci, votre demande est bien partie. Réponse sous 48 heures ouvrées."
  form.reset()
})

// ==========================================================
//  Administration (uniquement si connecté)
// ==========================================================
if (isAdmin) {
  document.body.classList.add("is-admin")
  $("#adminBar").hidden = false
  $("#loginNav").hidden = true
  initAdmin()
}

function initAdmin() {
  const manager = $("#manager")
  const views = {
    list: $("#managerList"),
    add: $("#addWorkForm"),
    confirm: $("#managerConfirm"),
  }
  const titles = { list: "Projets publiés", add: "Nouveau projet", confirm: "Retirer un projet" }
  const back = $("#managerBack")
  const form = $("#addWorkForm")
  const fileInput = $("#fileInput")
  const preview = $("#dropzonePreview")
  const empty = $("#dropzoneEmpty")
  const dropzone = $("#dropzone")
  const formMsg = $("#formMsg")
  const submitBtn = $("#submitBtn")
  let workToDelete = null

  function show(name) {
    Object.entries(views).forEach(([key, el]) => { el.hidden = key !== name })
    $("#managerTitle").textContent = titles[name]
    back.hidden = name === "list"
  }

  // Ouverture / déconnexion
  $("#openManager").addEventListener("click", () => {
    show("list")
    renderManagerGrid()
    $("#managerMsg").textContent = ""
    manager.showModal()
  })
  $("#logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("token")
    window.location.reload()
  })
  back.addEventListener("click", () => show("list"))
  $("#managerAdd").addEventListener("click", () => {
    resetForm()
    fillCategories()
    show("add")
    $("#workTitle").focus()
  })

  // Liste des projets avec bouton de retrait
  function renderManagerGrid() {
    const grid = $("#managerGrid")
    grid.innerHTML = ""
    state.works.forEach(work => {
      const li = document.createElement("li")
      const figure = document.createElement("figure")
      figure.style.margin = "0"
      const img = document.createElement("img")
      img.src = work.imageUrl
      img.alt = ""
      const caption = document.createElement("figcaption")
      caption.textContent = work.title
      figure.append(img, caption)

      const del = document.createElement("button")
      del.type = "button"
      del.className = "manager__del"
      del.setAttribute("aria-label", `Retirer ${work.title}`)
      del.innerHTML = `<svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true"><path fill="currentColor" d="M6 1h4l.5 1H14v1.5H2V2h3.5L6 1Zm-3 3.5h10l-.7 9.6A1.5 1.5 0 0 1 10.8 15H5.2a1.5 1.5 0 0 1-1.5-1.4L3 4.5Z"/></svg>`
      del.addEventListener("click", () => askDelete(work))

      li.append(figure, del)
      grid.appendChild(li)
    })
  }

  // Confirmation puis retrait
  function askDelete(work) {
    workToDelete = work
    $("#confirmImage").src = work.imageUrl
    $("#confirmTitle").textContent = work.title
    show("confirm")
    $("#confirmCancel").focus()
  }
  $("#confirmCancel").addEventListener("click", () => { workToDelete = null; show("list") })
  $("#confirmDelete").addEventListener("click", () => {
    if (!workToDelete) return
    const work = workToDelete
    fetch(`${API}/works/${work.id}`, { method: "DELETE", headers: authHeaders() })
      .then(response => {
        if (!response.ok) throw new Error("refused")
        state.works = state.works.filter(w => w.id !== work.id)
        workToDelete = null
        renderManagerGrid()
        renderGallery()
        show("list")
        toast(`« ${work.title} » a été retiré du site`)
      })
      .catch(error => {
        console.error("Erreur :", error)
        show("list")
        $("#managerMsg").textContent = error.message === "refused"
          ? "Le retrait a été refusé. Reconnectez-vous puis réessayez."
          : "Connexion au serveur impossible. Réessayez plus tard."
      })
  })

  // Catégories du formulaire
  function fillCategories() {
    const select = $("#workCategory")
    if (select.options.length > 1) return
    state.categories.forEach(c => select.add(new Option(c.name, c.id)))
  }

  // Validation d'image par signature binaire (plus fiable que l'extension)
  function isJpegOrPng(file) {
    return file.slice(0, 4).arrayBuffer().then(buffer => {
      const [b0, b1, b2, b3] = new Uint8Array(buffer)
      const isJpeg = b0 === 0xff && b1 === 0xd8 && b2 === 0xff
      const isPng = b0 === 0x89 && b1 === 0x50 && b2 === 0x4e && b3 === 0x47
      return isJpeg || isPng
    })
  }

  function checkForm() {
    submitBtn.disabled = !($("#workTitle").value.trim() && $("#workCategory").value && fileInput.files[0])
  }

  function showPreview(file) {
    const reader = new FileReader()
    reader.onload = () => {
      preview.src = reader.result
      preview.hidden = false
      empty.hidden = true
    }
    reader.readAsDataURL(file)
  }

  function rejectFile() {
    fileInput.value = ""
    preview.hidden = true
    empty.hidden = false
    formMsg.classList.remove("is-ok")
    formMsg.textContent = "Choisissez une image JPG ou PNG de 4 Mo maximum."
    checkForm()
  }

  function handleFile(file) {
    formMsg.textContent = ""
    if (!file) return checkForm()
    if (file.size > 4 * 1024 * 1024) return rejectFile()
    isJpegOrPng(file).then(valid => {
      if (!valid) return rejectFile()
      showPreview(file)
      checkForm()
    })
  }

  fileInput.addEventListener("change", () => handleFile(fileInput.files[0]))

  // Glisser-déposer
  ;["dragenter", "dragover"].forEach(type => dropzone.addEventListener(type, (e) => {
    e.preventDefault()
    dropzone.classList.add("is-over")
  }))
  ;["dragleave", "drop"].forEach(type => dropzone.addEventListener(type, () => dropzone.classList.remove("is-over")))
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file) return
    const transfer = new DataTransfer()
    transfer.items.add(file)
    fileInput.files = transfer.files
    handleFile(file)
  })

  $("#workTitle").addEventListener("input", checkForm)
  $("#workCategory").addEventListener("change", checkForm)

  function resetForm() {
    form.reset()
    preview.hidden = true
    preview.removeAttribute("src")
    empty.hidden = false
    formMsg.textContent = ""
    checkForm()
  }

  // Publication
  form.addEventListener("submit", (e) => {
    e.preventDefault()
    if (submitBtn.disabled) return

    const formData = new FormData()
    formData.append("title", $("#workTitle").value.trim())
    formData.append("category", $("#workCategory").value)
    formData.append("image", fileInput.files[0])

    submitBtn.disabled = true
    submitBtn.textContent = "Publication…"

    fetch(`${API}/works`, { method: "POST", headers: authHeaders(), body: formData })
      .then(response => {
        if (!response.ok) throw new Error("refused")
        return response.json()
      })
      .then(newWork => {
        newWork.categoryId = Number(newWork.categoryId)
        state.works.push(newWork)
        renderGallery()
        renderManagerGrid()
        resetForm()
        show("list")
        toast(`« ${newWork.title} » est en ligne`)
      })
      .catch(error => {
        console.error("Erreur :", error)
        formMsg.classList.remove("is-ok")
        formMsg.textContent = error.message === "refused"
          ? "La publication a été refusée. Vérifiez les champs puis réessayez."
          : "Connexion au serveur impossible. Réessayez plus tard."
        checkForm()
      })
      .finally(() => { submitBtn.textContent = "Publier le projet" })
  })
}
