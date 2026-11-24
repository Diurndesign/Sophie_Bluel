// ============================================================
//  Mode démo (uniquement en ligne)
// ============================================================
// Le back-end OpenClassrooms (API + base de données) n'est pas hébergé.
// En LIGNE, ce script simule l'API http://localhost:5678 pour que le site
// fonctionne (connexion, ajout, suppression) sans back-end.
// En LOCAL (localhost), il se désactive : c'est alors le vrai back-end OC
// qui répond, et le code d'origine (login.js, index.js) est utilisé tel quel.
//
// Identifiants de démonstration :  sophie.bluel@test.tld  /  S0phie
(function () {
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  if (isLocal) return; // vrai back-end en local → pas de simulation

  const API = "http://localhost:5678/api";
  const DEMO_USER = { email: "sophie.bluel@test.tld", password: "S0phie" };

  const prefix = location.pathname.includes("/login") ? "../assets/images/" : "./assets/images/";
  const img = (file) => prefix + file;

  const categories = [
    { id: 1, name: "Objets" },
    { id: 2, name: "Appartements" },
    { id: 3, name: "Hôtels & restaurants" },
  ];

  let nextId = 100;
  let works = [
    { id: 1, title: "Abajour Tahina", imageUrl: img("abajour-tahina.png"), categoryId: 1, userId: 1 },
    { id: 2, title: "Appartement Paris V", imageUrl: img("appartement-paris-v.png"), categoryId: 2, userId: 1 },
    { id: 3, title: "Restaurant Sushisen - Londres", imageUrl: img("restaurant-sushisen-londres.png"), categoryId: 3, userId: 1 },
    { id: 4, title: "La balisière", imageUrl: img("la-balisiere.png"), categoryId: 2, userId: 1 },
    { id: 5, title: "Villa Ferneze - Italie", imageUrl: img("villa-ferneze.png"), categoryId: 2, userId: 1 },
    { id: 6, title: "Structures Thermopolis", imageUrl: img("structures-thermopolis.png"), categoryId: 1, userId: 1 },
    { id: 7, title: "Le coteau cassis", imageUrl: img("le-coteau-cassis.png"), categoryId: 2, userId: 1 },
    { id: 8, title: "Hôtel First Arte - New Delhi", imageUrl: img("hotel-first-arte-new-delhi.png"), categoryId: 3, userId: 1 },
    { id: 9, title: "Bar 'Lullaby' - Paris", imageUrl: img("bar-lullaby-paris.png"), categoryId: 3, userId: 1 },
    { id: 10, title: "Appartement Paris X", imageUrl: img("appartement-paris-x.png"), categoryId: 2, userId: 1 },
    { id: 11, title: "Appartement Paris XVIII", imageUrl: img("appartement-paris-xviii.png"), categoryId: 2, userId: 1 },
  ];

  const reply = (body, status = 200) =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      })
    );

  const realFetch = window.fetch.bind(window);

  window.fetch = function (url, options = {}) {
    const u = typeof url === "string" ? url : (url && url.url) || "";
    if (!u.startsWith(API)) return realFetch(url, options);

    const method = (options.method || "GET").toUpperCase();
    const path = u.slice(API.length);

    // Connexion
    if (path === "/users/login" && method === "POST") {
      let creds = {};
      try { creds = JSON.parse(options.body); } catch (e) {}
      if (creds.email === DEMO_USER.email && creds.password === DEMO_USER.password) {
        return reply({ userId: 1, token: "demo-token" });
      }
      return reply({ message: "Identifiants incorrects" }, 401);
    }

    // Lecture
    if (path === "/works" && method === "GET") return reply(works);
    if (path === "/categories" && method === "GET") return reply(categories);

    // Ajout
    if (path === "/works" && method === "POST") {
      const fd = options.body;
      const title = fd && fd.get ? fd.get("title") : "";
      const categoryId = fd && fd.get ? Number(fd.get("category")) : 1;
      const file = fd && fd.get ? fd.get("image") : null;
      const imageUrl = file ? URL.createObjectURL(file) : img("abajour-tahina.png");
      const work = { id: nextId++, title, imageUrl, categoryId, userId: 1 };
      works.push(work);
      return reply(work, 201);
    }

    // Suppression
    const del = path.match(/^\/works\/(\d+)$/);
    if (del && method === "DELETE") {
      works = works.filter((w) => w.id !== Number(del[1]));
      return reply({}, 200);
    }

    return reply({ message: "Not found" }, 404);
  };

  // Encart "identifiants de démonstration" sur la page de connexion
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("#loginForm");
    if (!form) return;
    const hint = document.createElement("div");
    hint.className = "demo-hint";
    hint.innerHTML =
      "<span>Démo : <code>" + DEMO_USER.email + "</code> / <code>" + DEMO_USER.password + "</code></span>" +
      '<button type="button">Remplir</button>';
    hint.querySelector("button").addEventListener("click", function () {
      form.querySelector("#email").value = DEMO_USER.email;
      form.querySelector("#password").value = DEMO_USER.password;
      form.querySelector("[type=submit]").focus();
    });
    form.prepend(hint);
  });
})();
