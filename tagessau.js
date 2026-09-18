const contentRoot = "";
const mediaRoot = "";

const stories = [
  {
    kicker: "EU",
    title: "EU bestraft Volkswagen für falsches Kaufverhalten seiner Kunden",
    summary: "Weil Käufer zu selten zu Elektroautos greifen, drohen Volkswagen hohe Strafzahlungen. Die EU stellt klar: Die Bürger dürfen frei wählen, solange sie sich richtig entscheiden.",
    image: "images/20260918-volkswagen-strafzahlung.jpg",
    href: "artikel/eu-bestraft-volkswagen-fuer-falsches-kaufverhalten.html",
    alt: "Volkswagen-Autohaus mit großem VW-Logo",
    label: "Symbolbild"
  },
  {
    kicker: "EU",
    title: "EU kümmert sich rührend um unsere Kinder",
    summary: "Soziale Medien sollen für Kinder begrenzt werden. Bis dahin übernehmen öffentlich-rechtliches Fernsehen, kommunale Bibliotheken und EU-geförderte Diversity-Programme die Orientierung.",
    image: "images/20260916-eu-kinderschutz-hero.jpg",
    video: "videos/20260916-eu-kinderschutz.mp4",
    href: "artikel/eu-schuetzt-kinder-vor-falscher-beeinflussung.html",
    alt: "KI-Satire: Ein EU-Beamter weist einen Jungen in einen Raum mit einer Drag-Vorlesestunde",
    label: "KI-Satire"
  },
  {
    kicker: "Deutschland",
    title: "Regierung deckelt Spritpreis bei sieben Euro",
    summary: "Preisdeckel, Pendlerpauschale, CO₂-Aussetzung und Direktzahlungen sollen das Tanken wieder bezahlbar machen. Die Voraussetzungen stehen bereits fest.",
    image: "images/20260915-spritpreise-hero.png",
    video: "videos/20260915-spritpreise.mp4",
    href: "artikel/regierung-deckelt-spritpreis-bei-sieben-euro.html",
    alt: "KI-Satire: Eine deutsche Tankstelle zeigt wechselnde Fantasiepreise von bis zu knapp zehn Euro pro Liter",
    label: "KI-Satire"
  },
  {
    kicker: "Deutschland",
    title: "Falsch wählen gerade noch vereitelt",
    summary: "In Wilhelmshaven wird nach der Wahl geprüft, ob ein Kandidat zu Recht gar nicht erst antreten durfte.",
    image: "images/20260914-falsch-waehlen-gerade-noch-vereitelt.jpg",
    href: "artikel/falsch-waehlen-gerade-noch-vereitelt.html",
    alt: "Wahlhelfer sortieren Stimmzettel auf einem Tisch",
    label: "Dokumentarfoto"
  }
];

const els = {
  image: document.querySelector("[data-lead-image]"),
  video: document.querySelector("[data-lead-video]"),
  mediaLink: document.querySelector("[data-lead-link]"),
  cta: document.querySelector("[data-lead-cta]"),
  kicker: document.querySelector("[data-lead-kicker]"),
  title: document.querySelector("[data-lead-title]"),
  summary: document.querySelector("[data-lead-summary]"),
  current: document.querySelector("[data-hero-current]"),
  progress: document.querySelector("[data-hero-progress]"),
  label: document.querySelector("[data-lead-label]"),
  rails: [...document.querySelectorAll("[data-slide]")]
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let active = 0;
let timer;

function startProgress() {
  clearTimeout(timer);
  els.progress.classList.remove("is-running");
  void els.progress.offsetWidth;
  if (!reduceMotion) {
    els.progress.classList.add("is-running");
    timer = window.setTimeout(() => showStory((active + 1) % stories.length), 10000);
  }
}

function showVideo(story) {
  els.video.pause();
  els.video.classList.remove("is-ready");
  els.video.oncanplay = null;
  els.video.onerror = null;
  els.video.onended = null;
  els.video.removeAttribute("src");
  els.video.load();
  if (!story.video || reduceMotion) return;

  els.video.oncanplay = () => {
    els.video.classList.add("is-ready");
    els.video.play().catch(() => els.video.classList.remove("is-ready"));
  };
  els.video.onerror = () => els.video.classList.remove("is-ready");
  els.video.onended = () => {
    els.video.currentTime = Math.max(0, els.video.duration - 0.04);
  };
  els.video.poster = mediaRoot + story.image;
  els.video.src = mediaRoot + story.video;
  els.video.load();
}

function showStory(index) {
  active = (index + stories.length) % stories.length;
  const story = stories[active];
  els.image.src = mediaRoot + story.image;
  els.image.alt = story.alt;
  els.mediaLink.href = contentRoot + story.href;
  els.cta.href = contentRoot + story.href;
  els.kicker.textContent = story.kicker;
  els.title.textContent = story.title;
  els.summary.textContent = story.summary;
  els.label.textContent = story.label;
  els.current.textContent = String(active + 1).padStart(2, "0");
  els.rails.forEach((rail, indexValue) => rail.classList.toggle("is-active", indexValue === active));
  showVideo(story);
  startProgress();
}

document.querySelector("[data-hero-prev]").addEventListener("click", () => showStory(active - 1));
document.querySelector("[data-hero-next]").addEventListener("click", () => showStory(active + 1));
els.rails.forEach((rail) => rail.addEventListener("click", () => showStory(Number(rail.dataset.slide))));

const navToggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".main-nav");
navToggle.addEventListener("click", () => {
  const open = nav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", String(open));
});
nav.addEventListener("click", () => {
  nav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
});

showStory(0);
