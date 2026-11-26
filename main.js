/* Portfólio — Gabriel Novaes
   GSAP + ScrollTrigger + SplitText cuidam das animações, Lenis da rolagem suave. */

// Chave do Web3Forms (web3forms.com): as mensagens do formulário chegam no e-mail cadastrado nela.
// A chave é pública por natureza e não expõe o e-mail. Vazia: o formulário abre o GitHub.
const WEB3FORMS_KEY = "8cb06e2a-4368-4c33-b000-097a60227387";

// Outros canais de contato (rodapé e modal). Vazio: o link some do site.
// WhatsApp só com números, com DDI e DDD (ex.: 5521999999999). Instagram sem o @.
const WHATSAPP = "5521966588725";
const INSTAGRAM = "gb__novaes";

gsap.registerPlugin(ScrollTrigger, SplitText);

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isDesktop = () => window.innerWidth > 1025;
const PROJECTS = window.PROJECTS || [];
const poster = (p) => `assets/projects/${p.slug}.jpg`;
const video = (p) => `assets/projects/${p.slug}.mp4`;
const linkOf = (p) => p.live || p.repo;

/* ---------- Rolagem suave ---------- */
if ("scrollRestoration" in history) history.scrollRestoration = "manual";
window.scrollTo(0, 0);
window.addEventListener("load", () => window.scrollTo(0, 0));

const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
lenis.on("scroll", ScrollTrigger.update);
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
lenis.stop();

/* ---------- Botão: bolinha que enche o botão e letras que rolam ---------- */
function buildButton(el) {
  const label = el.dataset.btn || "";
  el.classList.add("btn");
  el.innerHTML = `
    <span class="btn__dot" aria-hidden="true"><i></i></span>
    <span class="btn__ghost" aria-hidden="true">${label}</span>
    <span class="btn__text"><span></span></span>
    <span class="btn__end" aria-hidden="true"></span>`;
  const row = el.querySelector(".btn__text > span");
  [...label].forEach((ch, i) => {
    const s = document.createElement("span");
    s.textContent = ch;
    if (ch === " ") s.style.whiteSpace = "pre";
    s.style.transitionDelay = reduced ? "0s" : `${0.01 * i}s`;
    row.appendChild(s);
  });
  if (el._btnReady) return;
  el._btnReady = true;
  const touch = window.matchMedia("(max-width: 639px)");
  let timer;
  el.addEventListener("mouseenter", () => !touch.matches && el.classList.add("is-hover"));
  el.addEventListener("mouseleave", () => !touch.matches && el.classList.remove("is-hover"));
  el.addEventListener("pointerdown", (e) => {
    if (!touch.matches || e.pointerType === "mouse") return;
    clearTimeout(timer);
    el.classList.add("is-hover");
    timer = setTimeout(() => el.classList.remove("is-hover"), 1000);
  });
}
document.querySelectorAll("[data-btn]").forEach(buildButton);

/* ---------- Texto que sobe letra a letra (ou linha a linha) ---------- */
const directions = { bottom: { yPercent: 100, xPercent: 0, rotate: 0 } };
function runReveal(wrap) {
  if (wrap._revealed) return;
  wrap._revealed = true;
  const by = wrap.dataset.reveal || "chars";
  const stagger = wrap.dataset.stagger ? parseFloat(wrap.dataset.stagger) : by === "lines" ? 0.1 : 0.03;
  const targets = [];
  [...wrap.children].forEach((el) => {
    if (by === "lines") {
      const s = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line++", reduceWhiteSpace: false });
      targets.push(...s.lines);
    } else {
      const s = SplitText.create(el, { type: "lines,chars", mask: "chars", charsClass: "char++", reduceWhiteSpace: false });
      (s.masks || []).forEach((m) => {
        m.style.paddingInline = "0.04em";
        m.style.marginInline = "-0.04em";
        m.style.boxSizing = "content-box";
      });
      targets.push(...s.chars);
    }
  });
  if (reduced) {
    gsap.set(wrap, { opacity: 0, y: 24 });
    gsap.to(wrap, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: wrap, start: "top 85%", once: true } });
    return;
  }
  gsap.set(wrap, { opacity: 1 });
  gsap.fromTo(
    targets,
    { ...directions.bottom, willChange: "transform" },
    {
      yPercent: 0, xPercent: 0, rotate: 0, opacity: 1,
      duration: 0.5, stagger, ease: "power3.out",
      scrollTrigger: { trigger: wrap, start: "top 85%", end: "bottom 68%" },
    }
  );
}

/* ---------- Hero: vitrine atrás (pôsteres dos projetos em duas colunas que sobem sem parar) ---------- */
function buildWall() {
  const cols = document.querySelectorAll("[data-wall]");
  if (!cols.length || !PROJECTS.length) return;
  const desk = isDesktop();
  const a = PROJECTS.filter((_, i) => i % 2 === 0);
  const b = PROJECTS.filter((_, i) => i % 2 === 1);
  const lists = desk ? [a, b] : [PROJECTS, [...PROJECTS].reverse()];
  cols.forEach((col, ci) => {
    const list = lists[ci];
    const items = [...list, ...list];
    col.innerHTML = items
      .map((p) => `<div class="hero__tile"><img src="${poster(p)}" alt="" width="700" height="500" loading="lazy" /></div>`)
      .join("");
    // Volta exata: uma lista inteira + um espaço, dividido pela coluna toda
    const n = list.length;
    const tile = desk ? 27 : window.innerWidth > 767 ? 45 : 55;
    const gap = 2.5;
    const shift = ((n * tile + n * gap) / (2 * n * tile + (2 * n - 1) * gap)) * 100;
    col.style.setProperty("--wall-shift", `-${shift.toFixed(2)}%`);
    const base = ci === 0 ? 10 : 18;
    col.style.animationDuration = `${(base * n) / 2}s`;
  });
}
buildWall();

/* ---------- Hero: loop do Gabriel virando a cabeça ---------- */
// Só onde dá para mostrar o fundo transparente: Chrome, Edge e Firefox (VP9 com alfa).
// Safari, celular e quem prefere menos movimento ficam com a foto.
function heroVideo() {
  const vid = document.querySelector(".hero__video");
  const box = document.querySelector(".hero__portrait");
  if (!vid) return;
  const ua = navigator.userAgent;
  const safari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox|FxiOS|CriOS/.test(ua);
  const vp9 = vid.canPlayType('video/webm; codecs="vp9"');
  if (reduced || safari || !vp9 || window.innerWidth <= 767) { vid.remove(); return; }
  vid.src = vid.dataset.src;
  vid.preload = "auto";
  vid.addEventListener("playing", () => box.classList.add("has-video"), { once: true });
  // Loop com respiro: ao terminar, fica 2s parado no último quadro (igual ao primeiro) e recomeça
  const LOOP_DELAY = 2000;
  let active = true;
  let timer = null;
  const play = () => vid.play().catch(() => {});
  vid.addEventListener("ended", () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      vid.currentTime = 0;
      if (active) play();
    }, LOOP_DELAY);
  });
  // Pausa quando o hero sai da tela, para não gastar processamento à toa
  ScrollTrigger.create({
    trigger: "#hero", start: "top top", end: "bottom top",
    onToggle: (self) => {
      active = self.isActive;
      if (active) { if (!timer || vid.currentTime < vid.duration) play(); }
      else vid.pause();
    },
  });
  play();
}

/* ---------- Abertura ---------- */
function intro() {
  const portrait = document.querySelector(".hero__portrait");
  const header = document.getElementById("header");
  const state = { reveal: -40 };
  const tl = gsap.timeline();
  tl.to(state, {
    reveal: 125,
    duration: 3.5,
    ease: "power2.out",
    onUpdate: () => portrait.style.setProperty("--reveal", `${state.reveal}%`),
  }, 0)
    .fromTo(portrait, { opacity: 0 }, { opacity: 1, duration: 1.5, ease: "power2.out" }, 0)
    .call(() => document.querySelectorAll('[data-manual="title"]').forEach(runReveal), undefined, 1)
    .call(() => document.querySelectorAll('[data-manual="side"]').forEach(runReveal), undefined, 1.5)
    .call(() => {
      gsap.fromTo(header, { yPercent: -50, opacity: 0 }, {
        yPercent: 0, opacity: 1, duration: 0.8, ease: "power3.out",
        onComplete: () => lenis.start(),
      });
    }, undefined, 1.8);
}

/* ---------- Hero: encolhe ao rolar e segue o mouse ---------- */
function heroScroll() {
  const tl = gsap.timeline({
    scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
  });
  tl.to(".hero__stage", { scale: 0.5, ease: "power2.inOut", duration: 1 }, 0);
  gsap.set(".hero__wall", { filter: "blur(24px)", opacity: 0.35 });
  tl.to(".hero__wall", { filter: "blur(0px)", opacity: 1, ease: "power2.out", duration: 0.18 }, 0.32);

  if (window.innerWidth <= 1024 || reduced) return;
  const img = document.querySelector(".hero__portrait-inner");
  const text = document.querySelector(".hero__copy");
  const m = { tix: 0, cix: 0, ttx: 0, ctx: 0, tiy: 0, ciy: 0, tty: 0, cty: 0 };
  window.addEventListener("mousemove", (e) => {
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    m.tix = -(30 * nx); m.ttx = -(12 * nx);
    m.tiy = -(30 * ny); m.tty = -(12 * ny);
  });
  const loop = () => {
    m.cix += (m.tix - m.cix) * 0.08;
    m.ctx += (m.ttx - m.ctx) * 0.08;
    m.ciy += (m.tiy - m.ciy) * 0.08;
    m.cty += (m.tty - m.cty) * 0.08;
    gsap.set(img, { x: m.cix, y: m.ciy });
    gsap.set(text, { x: m.ctx, y: m.cty });
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}

/* ---------- Cabeçalho: esconde descendo, volta subindo, desfoca depois de 40% da tela ---------- */
function headerBehavior() {
  const header = document.getElementById("header");
  let last = window.scrollY;
  let hidden = false;
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-blur", y > 0.4 * window.innerHeight);
    if (!reduced) {
      const d = y - last;
      if (d > 0 && y > 0 && !hidden) {
        hidden = true;
        gsap.to(header, { yPercent: -100, duration: 0.5, ease: "power3.out" });
      } else if (d < 0 && hidden) {
        hidden = false;
        gsap.to(header, { yPercent: 0, duration: 0.5, ease: "power3.out" });
      }
    }
    last = y;
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ---------- Projetos selecionados ---------- */
function work() {
  const list = document.querySelector("[data-work-list]");
  const media = document.querySelector("[data-work-media]");
  const section = document.getElementById("projetos");
  if (!list || !PROJECTS.length) return;
  section.style.setProperty("--rows", PROJECTS.length);
  // A altura de cada item (--row-h) vem do CSS e cabe na largura e na altura da tela
  // +60vh no fim: é por onde a próxima seção sobe em arco por cima do painel
  if (!reduced) section.style.height = `${Math.round((160 + (PROJECTS.length - 1) * 75) / 0.9)}vh`;

  list.innerHTML = PROJECTS.map((p, i) => `
    <div class="work__item" data-i="${i}" role="button" tabindex="0" aria-label="Ver ${p.name}">
      <span class="work__dot"></span>
      <div>
        <h3>${p.name}</h3>
        <p>${p.kind.split(" · ").join("  •  ")}</p>
      </div>
    </div>`).join("");

  media.innerHTML = PROJECTS.map((p, i) => `
    <a class="work__slide${p.device === "phone" ? " work__slide--phone" : ""}" style="z-index:${i + 1}" href="${linkOf(p)}" target="_blank" rel="noopener" aria-label="Abrir ${p.name}">
      <video src="${video(p)}" poster="${poster(p)}" muted loop playsinline preload="${i === 0 ? "auto" : "metadata"}"></video>
    </a>`).join("");

  const dots = [...list.querySelectorAll(".work__dot")];
  const slides = [...media.querySelectorAll(".work__slide")];
  const videos = slides.map((s) => s.querySelector("video"));
  const steps = PROJECTS.length - 1;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: "#projetos",
      start: "10% top",
      end: () => `bottom-=${Math.round(window.innerHeight * 0.6)} bottom`,
      invalidateOnRefresh: true,
      scrub: true,
      ...(reduced ? {} : { snap: { snapTo: 1 / steps, duration: { min: 0.2, max: 0.6 }, ease: "power1.inOut" } }),
    },
  });
  const st = tl.scrollTrigger;
  gsap.set(".work__progress", { scaleY: 0 });
  gsap.set(dots[0], { backgroundColor: "#e0141e", borderColor: "#e0141e" });
  dots.slice(1).forEach((d) => gsap.set(d, { backgroundColor: "#f4f4f2", borderColor: "rgba(7,7,7,0.35)" }));
  gsap.set(slides, { filter: "brightness(1)" });
  slides.slice(1).forEach((s) => gsap.set(s, reduced ? { opacity: 0 } : { yPercent: 100 }));
  tl.to(".work__progress", { scaleY: 1, ease: "none", duration: steps }, 0);
  for (let i = 0; i < steps; i += 1) {
    if (reduced) tl.to(slides[i + 1], { opacity: 1, ease: "none", duration: 1 }, i);
    else tl.to(slides[i + 1], { yPercent: 0, ease: "power2.inOut", duration: 1 }, i);
    tl.to(slides[i], { filter: "brightness(0.3)", ease: "power2.inOut", duration: 1 }, i);
    tl.set(dots[i + 1], { backgroundColor: "#e0141e", borderColor: "#e0141e" }, i + 1);
  }

  // Só o vídeo da frente toca, e só enquanto a seção está na tela
  let current = -1;
  let inView = false;
  const sync = () => {
    const idx = Math.min(steps, Math.max(0, Math.round(st.progress * steps)));
    videos.forEach((v, i) => {
      if (inView && i === idx) { if (v.paused) v.play().catch(() => {}); }
      else if (!v.paused) v.pause();
    });
    current = idx;
  };
  ScrollTrigger.create({
    trigger: "#projetos", start: "top bottom", end: "bottom top",
    onToggle: (self) => { inView = self.isActive; sync(); },
    onUpdate: () => { const idx = Math.round(st.progress * steps); if (idx !== current) sync(); },
  });

  // Clicar num projeto da lista rola até ele
  list.querySelectorAll(".work__item").forEach((item) => {
    const go = () => {
      const i = Number(item.dataset.i);
      lenis.scrollTo(st.start + (st.end - st.start) * (i / steps), { duration: 1.2 });
    };
    item.addEventListener("click", go);
    item.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
  });

  if (reduced) return;
  // Na referência a seção tem 360vh e o arco termina em "30% bottom" = 1,08 tela de rolagem.
  // Nossa seção é mais alta (8 projetos), então a distância é fixa para o arco subir no mesmo ritmo.
  const arcEnd = () => `top+=${Math.round(window.innerHeight * 1.08)} bottom`;
  gsap.to(".circle-clip", {
    yPercent: window.innerWidth > 1024 ? -70 : -50,
    ease: "none",
    scrollTrigger: { trigger: "#projetos", start: "top bottom", end: arcEnd, scrub: true, invalidateOnRefresh: true },
  });
  gsap.set(".work__arc", { clipPath: "ellipse(150% 100% at 50% 100%)" });
  gsap.to(".work__arc", {
    clipPath: "ellipse(60% 100% at 50% 100%)",
    ease: "power2.out",
    scrollTrigger: { trigger: "#projetos", start: "top bottom", end: arcEnd, scrub: true, invalidateOnRefresh: true },
  });

  // Saída: a próxima seção sobe em arco preto (o mesmo da entrada, ao contrário)
  // enquanto o painel branco recua e escurece, como o hero faz ao encolher
  // Mesmo movimento do arco de entrada: sobe 70% da altura e fecha a curva de 150% para 60%, em 1,08 tela
  const whyArc = { trigger: "#por-que", start: "top bottom", end: () => `top+=${Math.round(window.innerHeight * 1.08)} bottom`, scrub: true, invalidateOnRefresh: true };
  gsap.to(".why__arc", { yPercent: -70, ease: "none", scrollTrigger: whyArc });
  gsap.to(".why__fill", { scaleY: 1, ease: "none", scrollTrigger: whyArc });
  gsap.fromTo(".why__arc", { clipPath: "ellipse(150% 100% at 50% 100%)" }, {
    clipPath: "ellipse(60% 100% at 50% 100%)",
    ease: "power2.out",
    scrollTrigger: whyArc,
  });
  gsap.fromTo(".work__sticky", { scale: 1, filter: "brightness(1)" }, {
    scale: 0.92,
    filter: "brightness(0.45)",
    ease: "power1.in",
    scrollTrigger: { trigger: "#por-que", start: "top bottom", end: "top 40%", scrub: true },
  });
}

/* ---------- Por que trabalhar comigo ---------- */
function why() {
  const cards = gsap.utils.toArray(".why__card");
  const lines = cards.map((c) => c.querySelector(".why__line span"));
  gsap.set(lines, { scaleX: 0, transformOrigin: "left center" });
  if (reduced) gsap.set(cards, { opacity: 1, yPercent: 0 });
  else {
    gsap.fromTo(cards, { opacity: 0, yPercent: 10 }, {
      opacity: 1, yPercent: 0, stagger: 0.05, ease: "power2.out",
      scrollTrigger: { trigger: "#por-que", start: "top top" },
    });
  }
  cards.forEach((card, i) => {
    const line = lines[i];
    card.addEventListener("mouseenter", () => {
      gsap.killTweensOf(line);
      gsap.set(line, { transformOrigin: "left center" });
      gsap.to(line, { scaleX: 1, duration: 0.55, ease: "power2.out" });
    });
    card.addEventListener("mouseleave", () => {
      gsap.killTweensOf(line);
      gsap.set(line, { transformOrigin: "right center" });
      gsap.to(line, { scaleX: 0, duration: 0.55, ease: "power2.out" });
    });
  });
}

/* ---------- Reel: o cartão se abre até a tela inteira ---------- */
function reel() {
  const section = document.getElementById("reel");
  const frame = document.querySelector("[data-reel-frame]");
  if (!section || !frame) return;
  const vid = frame.querySelector("video");
  const ui = frame.querySelector(".reel__ui");
  const words = section.querySelectorAll(".reel__word");
  const sound = section.querySelector("[data-reel-sound]");

  // Tamanho do cartão inicial: o mesmo --card-w do CSS, em 16:9, centralizado
  const cardInset = () => {
    const w = parseFloat(getComputedStyle(section.querySelector(".reel__sticky")).getPropertyValue("--card-w")) / 100 * window.innerWidth;
    const h = (w * 9) / 16;
    const x = (window.innerWidth - w) / 2;
    const y = (window.innerHeight - h) / 2;
    return `inset(${y}px ${x}px ${y}px ${x}px round 12px)`;
  };

  if (reduced) {
    gsap.set(frame, { clipPath: "inset(0px 0px 0px 0px round 0px)" });
    gsap.set(words, { opacity: 0 });
    gsap.set(ui, { opacity: 1 });
  } else {
    gsap.set(frame, { clipPath: cardInset() });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
    });
    tl.fromTo(frame, { clipPath: () => cardInset() }, { clipPath: "inset(0px 0px 0px 0px round 0px)", ease: "power2.inOut", duration: 0.7 }, 0)
      .fromTo(vid, { scale: 1.25 }, { scale: 1, ease: "power2.inOut", duration: 0.7 }, 0)
      .to(words[0], { xPercent: -60, opacity: 0, ease: "power2.in", duration: 0.55 }, 0)
      .to(words[1], { xPercent: 60, opacity: 0, ease: "power2.in", duration: 0.55 }, 0)
      .fromTo(ui, { opacity: 0, y: 30 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.2 }, 0.72)
      .to({}, { duration: 0.08 });

    // Saída: o vídeo volta a ser um cartão e escurece enquanto sobe, em vez de sair cortado
    const exitInset = () => {
      const x = Math.round(window.innerWidth * 0.06);
      const y = Math.round(window.innerHeight * 0.08);
      return `inset(${y}px ${x}px ${y}px ${x}px round 16px)`;
    };
    const exit = gsap.timeline({
      scrollTrigger: { trigger: section, start: "bottom bottom", end: "bottom 15%", scrub: true, invalidateOnRefresh: true },
    });
    exit.fromTo(frame, { clipPath: "inset(0px 0px 0px 0px round 0px)" }, { clipPath: exitInset, ease: "power1.inOut", immediateRender: false }, 0)
      .fromTo(vid, { filter: "brightness(1)" }, { filter: "brightness(0.35)", ease: "none", immediateRender: false }, 0)
      .fromTo(ui, { opacity: 1 }, { opacity: 0, ease: "power1.in", duration: 0.5, immediateRender: false }, 0);
  }

  // Toca só enquanto está na tela
  ScrollTrigger.create({
    trigger: section, start: "top 80%", end: "bottom top",
    onToggle: (self) => { if (self.isActive) vid.play().catch(() => {}); else vid.pause(); },
  });

  sound.addEventListener("click", () => {
    vid.muted = !vid.muted;
    if (!vid.muted) { vid.volume = 0.8; vid.play().catch(() => {}); }
    sound.dataset.btn = vid.muted ? "Ativar som" : "Desativar som";
    sound.setAttribute("aria-pressed", String(!vid.muted));
    buildButton(sound);
  });
}

/* ---------- Serviços ---------- */
const SERVICES = [
  { title: "Sites Sob Medida", items: ["Sites para empresas", "Páginas de venda", "Visual único para a sua marca", "Perfeito em qualquer tela"] },
  { title: "Movimento & Animação", items: ["Animações ao rolar a página", "Navegação suave", "Detalhes que reagem ao toque", "Vídeos dentro do site"] },
  { title: "Experiências em 3D", items: ["Produtos em 3D no site", "Cenas que seguem o mouse", "Objetos para girar e explorar", "Leve e rápido de abrir"] },
  { title: "Lojas & Apps", items: ["Lojas virtuais completas", "Pagamento via Pix", "Aplicativos para celular", "Painel para gerenciar o negócio"] },
  { title: "IA no seu Negócio", items: ["Atendimento automático 24h", "Menos tarefas repetitivas", "Assistentes que respondem clientes", "Ideias testadas em poucos dias"] },
];
const arrowSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';

function services() {
  const row = document.querySelector("[data-services]");
  if (!row) return;
  row.innerHTML = SERVICES.map((s, i) => `
    <a class="service${i === 0 ? " is-active" : ""}" href="#contato" data-open-contact>
      <div class="service__fill"></div>
      <div class="service__top"><div class="service__arrow"><span>${arrowSvg}</span><span>${arrowSvg}</span></div></div>
      <div class="service__body">
        <h3>${s.title}</h3>
        <ul>${s.items.map((it) => `<li><span>${it}</span></li>`).join("")}</ul>
      </div>
    </a>`).join("");

  const cards = [...row.children];
  const fills = cards.map((c) => c.querySelector(".service__fill"));
  const vals = cards.map((_, i) => ({ value: i === 0 ? 100 : -40 }));
  fills.forEach((f, i) => f.style.setProperty("--reveal", `${vals[i].value}%`));
  let active = 0;
  cards.forEach((card, i) => {
    card.addEventListener("mouseenter", () => {
      if (i === active) return;
      const d = reduced ? 0 : 0.45;
      const prev = active;
      gsap.to(vals[prev], { value: -40, duration: d, ease: "power2.out", onUpdate: () => fills[prev].style.setProperty("--reveal", `${vals[prev].value}%`) });
      gsap.to(vals[i], { value: 100, duration: d, ease: "power2.out", onUpdate: () => fills[i].style.setProperty("--reveal", `${vals[i].value}%`) });
      cards[prev].classList.remove("is-active");
      card.classList.add("is-active");
      active = i;
    });
  });

  if (reduced) return;
  const w = window.innerWidth;
  const [from, to] = w > 1025 ? [70, -33] : w > 541 ? [50, -65] : [50, -77];
  gsap.fromTo(row, { xPercent: from }, {
    xPercent: to, ease: "none",
    scrollTrigger: { trigger: "#servicos", start: "top 20%", end: "bottom bottom", scrub: true },
  });
  // Saída: os cartões sobem um pouco mais devagar que a página e somem, em vez de sair em bloco
  gsap.fromTo(".services__center", { opacity: 1, yPercent: 0 }, {
    opacity: 0, yPercent: 12, ease: "power1.in",
    scrollTrigger: { trigger: "#servicos", start: "bottom bottom", end: "bottom 35%", scrub: true },
  });
}

/* ---------- Linha que vibra como uma corda (e toca uma nota) ---------- */
let audio = null, master = null, verb = null, noteIdx = 0;
const NOTES = [146.83, 164.81, 196, 220, 261.63, 293.66, 329.63, 392];
const BANDS = [{ frequency: 100, q: 1.2, gain: 0.5 }, { frequency: 220, q: 2, gain: 0.3 }];
function getAudio() {
  if (!audio) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audio = new Ctx();
    master = audio.createGain();
    master.gain.value = 1;
    const comp = audio.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 12; comp.ratio.value = 4; comp.attack.value = 0.006; comp.release.value = 0.22;
    master.connect(comp); comp.connect(audio.destination);
    const len = Math.floor(2.2 * audio.sampleRate);
    const ir = audio.createBuffer(2, len, audio.sampleRate);
    for (let c = 0; c < 2; c += 1) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i += 1) d[i] = (2 * Math.random() - 1) * Math.pow(1 - i / len, 1.8);
    }
    const conv = audio.createConvolver();
    conv.buffer = ir;
    verb = audio.createGain(); verb.gain.value = 0.42;
    verb.connect(conv); conv.connect(master);
  }
  if (audio.state === "suspended") audio.resume();
  return audio;
}
function pluck(amount) {
  const ctx = getAudio();
  if (!ctx) return;
  const strength = Math.min(Math.abs(amount) / 60, 1);
  if (strength < 0.05) return;
  noteIdx = (noteIdx + 1 + Math.floor(2 * Math.random())) % NOTES.length;
  const freq = NOTES[noteIdx] * (1 + (2 * Math.random() - 1) * 0.004);
  const sr = ctx.sampleRate;
  const period = Math.max(2, Math.floor(sr / freq));
  const total = Math.floor(3.2 * sr);
  const buf = ctx.createBuffer(1, total, sr);
  const out = buf.getChannelData(0);
  const ring = new Float32Array(period);
  let lp = 0;
  const bright = 0.1 + 0.12 * strength;
  for (let i = 0; i < period; i += 1) {
    lp += (2 * Math.random() - 1 - lp) * bright;
    ring[i] = lp * Math.min(1, i / (0.4 * period));
  }
  const decay = 0.996 - (1 - strength) * 0.003;
  let idx = 0, prev = 0;
  for (let i = 0; i < total; i += 1) {
    const v = ring[idx];
    const next = 0.75 * ((v + ring[(idx + 1) % period]) * 0.5) + 0.25 * prev;
    prev = next; ring[idx] = next * decay; out[i] = v; idx = (idx + 1) % period;
  }
  const src = ctx.createBufferSource(); src.buffer = buf;
  const low = ctx.createBiquadFilter(); low.type = "lowpass"; low.frequency.value = 750 + 700 * strength; low.Q.value = 0.5;
  const high = ctx.createBiquadFilter(); high.type = "highpass"; high.frequency.value = 70;
  src.connect(low); low.connect(high);
  const body = ctx.createGain(); body.gain.value = 1; high.connect(body);
  BANDS.forEach(({ frequency, q, gain }) => {
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = frequency; bp.Q.value = q;
    const g = ctx.createGain(); g.gain.value = gain;
    high.connect(bp); bp.connect(g); g.connect(body);
  });
  const env = ctx.createGain();
  const peak = 0.16 + 0.34 * strength;
  const t = ctx.currentTime;
  env.gain.setValueAtTime(1e-4, t);
  env.gain.exponentialRampToValueAtTime(peak, t + 0.025);
  env.gain.exponentialRampToValueAtTime(0.45 * peak, t + 0.6);
  env.gain.exponentialRampToValueAtTime(1e-4, t + 3.2);
  body.connect(env);
  const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
  if (pan) { pan.pan.value = (2 * Math.random() - 1) * 0.35; env.connect(pan); pan.connect(master); pan.connect(verb); }
  else { env.connect(master); env.connect(verb); }
  src.start(t); src.stop(t + 3.2);
  src.onended = () => { src.disconnect(); low.disconnect(); high.disconnect(); body.disconnect(); env.disconnect(); pan && pan.disconnect(); };
}

function stringLine(host) {
  host.innerHTML = '<div class="string-line"><span class="string-box"></span><svg height="100"><path></path></svg></div>';
  const box = host.querySelector(".string-box");
  const path = host.querySelector("path");
  let amp = 0, phase = Math.PI / 2, raf = null;
  const draw = (e) => {
    const w = host.offsetWidth;
    path.setAttribute("d", `M 0 50 Q ${0.5 * w} ${50 + e} ${w} 50`);
  };
  draw(0);
  window.addEventListener("resize", () => draw(reduced ? 0 : amp));
  if (reduced) return;
  const settle = () => {
    draw(amp * Math.sin(phase));
    amp *= 0.95;
    phase += 0.5;
    if (Math.abs(amp) > 0.1) raf = requestAnimationFrame(settle);
    else { phase = Math.PI / 2; amp = 0; }
  };
  box.addEventListener("mouseenter", () => {
    if (raf != null) { cancelAnimationFrame(raf); phase = Math.PI / 2; }
  });
  box.addEventListener("mousemove", (e) => { amp += e.movementY / 2; draw(amp); });
  box.addEventListener("mouseleave", () => {
    if (raf != null) cancelAnimationFrame(raf);
    pluck(amp);
    settle();
  });
}

/* ---------- Índice com prévia flutuante ---------- */
function indexList() {
  const rowsHost = document.querySelector("[data-index]");
  const frame = document.querySelector("[data-index-frame]");
  const float = document.querySelector(".index__float");
  if (!rowsHost || !PROJECTS.length) return;

  const html = [];
  PROJECTS.forEach((p, i) => {
    if (i !== 0) html.push('<div class="index__sep"></div>');
    html.push(`
      <a class="index__row" href="${linkOf(p)}" target="_blank" rel="noopener">
        <div class="reveal" data-reveal="lines"><h3>${p.name}</h3></div>
        <div class="reveal" data-reveal="lines"><p>${p.kind}</p></div>
      </a>`);
  });
  html.push('<div class="index__sep"></div>');
  rowsHost.innerHTML = html.join("");
  rowsHost.querySelectorAll(".index__sep").forEach(stringLine);

  frame.innerHTML = PROJECTS.map((p) => `<div class="index__pic"><img src="${poster(p)}" alt="" width="600" height="400" loading="lazy" /></div>`).join("");
  const pics = [...frame.children];
  const rows = [...rowsHost.querySelectorAll(".index__row")];
  gsap.set(frame, { y: 0 });
  pics.forEach((p, i) => gsap.set(p, { zIndex: i + 1, scale: i === 0 ? 1.05 : 0 }));
  let z = pics.length;
  let hovered = null;
  let lastPointer = null;

  const seps = gsap.utils.toArray(".index__sep");
  if (reduced) gsap.set(seps, { scaleX: 1 });
  else seps.forEach((s) => gsap.to(s, { scaleX: 1, duration: 0.8, ease: "power2.inOut", scrollTrigger: { trigger: s, start: "top 85%" } }));

  const show = (i) => {
    const row = rows[i];
    const cur = gsap.getProperty(frame, "y");
    const fr = frame.getBoundingClientRect();
    const base = fr.top + fr.height / 2 - cur;
    const rr = row.getBoundingClientRect();
    const y = rr.top + rr.height / 2 - base;
    if (reduced) gsap.set(frame, { y });
    else gsap.to(frame, { y, duration: 0.65, ease: "back.out(1.6)" });
    const pic = pics[i];
    z += 1;
    gsap.set(pic, { zIndex: z });
    gsap.killTweensOf(pic);
    if (reduced) gsap.set(pic, { scale: 1.05 });
    else { gsap.set(pic, { scale: 0 }); gsap.to(pic, { scale: 1.05, duration: 0.45, ease: "power2.out" }); }
  };
  const hit = (x, y) => {
    let found = null;
    for (let i = 0; i < rows.length; i += 1) {
      const r = rows[i].getBoundingClientRect();
      if (y >= r.top && y < r.bottom && x >= r.left && x < r.right) { found = i; break; }
    }
    if (found !== null && found !== hovered) { hovered = found; show(found); }
  };
  window.addEventListener("mousemove", (e) => { lastPointer = { x: e.clientX, y: e.clientY }; hit(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener("scroll", () => lastPointer && hit(lastPointer.x, lastPointer.y), { passive: true });
  rowsHost.addEventListener("mouseenter", () => gsap.to(float, { opacity: 1, duration: reduced ? 0 : 0.4, ease: "power2.out" }));
  rowsHost.addEventListener("mouseleave", () => { hovered = null; gsap.to(float, { opacity: 0, duration: reduced ? 0 : 0.4, ease: "power2.out" }); });
}

/* ---------- Ferramentas: logos voando em profundidade ---------- */
const STACK = [
  ["threedotjs", "three.js"], ["greensock", "GSAP"], ["react", "React"], ["typescript", "TypeScript"],
  ["javascript", "JavaScript"], ["supabase", "Supabase"], ["tailwindcss", "Tailwind"], ["expo", "Expo"],
  ["blender", "Blender"], ["html5", "HTML5"], ["css3", "CSS3"], ["vercel", "Vercel"],
];
function stack() {
  const grid = document.querySelector("[data-stack]");
  if (!grid) return;
  grid.innerHTML = STACK.map(([slug, name]) => `
    <div class="stack__item"><img src="assets/stack/${slug}.svg" alt="" width="24" height="24" /><span>${name}</span></div>`).join("");
  const items = [...grid.children];
  if (reduced) return;
  // Saída sem corte: o título sobe, apaga e desfoca enquanto a seção seguinte entra por cima
  const stackExit = { trigger: "#ferramentas", start: "bottom 150%", end: "bottom 85%", scrub: true };
  gsap.fromTo(".stack__title-inner", { opacity: 1, yPercent: 0, filter: "blur(0px)" }, {
    opacity: 0, yPercent: -30, filter: "blur(8px)", ease: "power1.in", scrollTrigger: stackExit,
  });
  gsap.fromTo(".stack__fly", { opacity: 1 }, { opacity: 0, ease: "power1.in", scrollTrigger: stackExit });
  const tl = gsap.timeline({
    defaults: { ease: "none" },
    scrollTrigger: { trigger: "#ferramentas", start: "top 20%", end: "bottom center", scrub: true },
  });
  const desk = window.innerWidth > 1024;
  const inDur = desk ? 1.5 : 4;
  const outDur = desk ? 1.5 : 3.5;
  const groupGap = inDur + 0.4;
  const itemGap = desk ? 0.4 : 0.5;
  const groups = [];
  for (let i = 0; i < items.length;) {
    const size = Math.min(items.length - i, gsap.utils.random(2, 3, 1));
    groups.push(Array.from({ length: size }, (_, k) => i + k));
    i += size;
  }
  groups.forEach((g, gi) => {
    const t0 = gi * groupGap;
    g.forEach((idx, k) => {
      const el = items[idx];
      const at = t0 + k * itemGap;
      gsap.set(el, {
        transformOrigin: "0% 0%",
        opacity: 0,
        x: desk ? gsap.utils.random(-180, 180) : 0,
        y: gsap.utils.random(-180, 180),
        filter: "blur(10px)",
        z: desk ? gsap.utils.random(-2200, -1600) : gsap.utils.random(-550, -400),
      });
      tl.to(el, { z: 0, opacity: 1, filter: "blur(0px)", duration: inDur }, at)
        .to(el, { filter: "blur(10px)", opacity: 0, z: desk ? gsap.utils.random(1400, 1800) : gsap.utils.random(500, 700), duration: outDur }, at + inDur);
    });
  });
}

/* ---------- Processo (carrossel) ---------- */
const STEPS = [
  { name: "Conversa", role: "Etapa 01 · Primeiro contato", quote: "Entendo o seu negócio, o seu público e o que o site precisa resolver. Saímos dessa conversa com objetivo, prazo e o que vai ser feito bem definidos." },
  { name: "Direção", role: "Etapa 02 · Proposta visual", quote: "Reúno referências e mostro uma primeira proposta: letras, cores e o estilo de movimento que combina com a sua marca." },
  { name: "Construção", role: "Etapa 03 · Criação do site", quote: "Construo o site com animações, efeitos em 3D quando fazem sentido e versão para celular. Você acompanha cada avanço por um link." },
  { name: "Ajustes", role: "Etapa 04 · Revisão", quote: "Revisamos juntos cada parte. Ajusto textos e detalhes até o resultado ficar do jeito que você imaginou." },
  { name: "No ar", role: "Etapa 05 · Lançamento", quote: "Coloco o site no ar com o seu endereço, pronto para ser encontrado no Google e abrir rápido. Depois do lançamento, continuo por perto para o que precisar." },
];
function processCarousel() {
  const slide = document.querySelector("[data-process-slide]");
  const avatarsHost = document.querySelector("[data-process-avatars]");
  if (!slide) return;
  const n = STEPS.length;
  let cur = 0;
  let busy = false;

  avatarsHost.innerHTML = STEPS.map((s, i) => `
    <button class="avatar" type="button" aria-label="Ver etapa ${s.name}">
      <span class="avatar__face"><img src="${poster(PROJECTS[i % PROJECTS.length])}" alt="" width="120" height="120" /></span>
    </button>`).join("");
  const avatars = [...avatarsHost.children];

  const render = () => {
    const s = STEPS[cur];
    slide.innerHTML = `
      <div class="process__who"><p class="process__name">${s.name}</p><p class="process__role">${s.role}</p></div>
      <p class="process__quote">“${s.quote}”</p>`;
  };
  const layoutAvatars = (animate) => {
    const before = avatars.map((a) => a.getBoundingClientRect());
    const half = Math.floor(n / 2);
    avatars.forEach((a, i) => {
      const rel = (i - cur + n) % n;
      const h = rel <= half ? rel : rel - n;
      const on = h === 0;
      a.style.order = h;
      a.style.zIndex = on ? 10 : n - Math.abs(h);
      a.classList.toggle("is-current", on);
      a.classList.toggle("is-left", h < 0);
      a.classList.toggle("is-right", h > 0);
      a.setAttribute("aria-current", on);
      a._scale = on ? 1.6 : 1;
    });
    avatars.forEach((a, i) => {
      const prevScale = a._prevScale ?? a._scale;
      if (!animate || reduced) { a.style.transform = `scale(${a._scale})`; a._prevScale = a._scale; return; }
      a.style.transform = "none";
      const after = a.getBoundingClientRect();
      const dx = before[i].left + before[i].width / 2 - (after.left + after.width / 2);
      const dy = before[i].top + before[i].height / 2 - (after.top + after.height / 2);
      a.style.transform = `scale(${a._scale})`;
      a.animate(
        [{ transform: `translate(${dx}px, ${dy}px) scale(${prevScale})` }, { transform: `translate(0, 0) scale(${a._scale})` }],
        { duration: 600, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }
      );
      a._prevScale = a._scale;
    });
  };
  const go = (next) => {
    if (next === cur || busy) return;
    busy = true;
    cur = next;
    layoutAvatars(true);
    gsap.to(slide, {
      opacity: 0, y: 0, duration: 0.25, ease: "power1.out",
      onComplete: () => {
        render();
        gsap.fromTo(slide, { opacity: 0, y: 20, x: 0 }, { opacity: 1, y: 0, duration: 0.25, ease: "power1.out", onComplete: () => { busy = false; } });
      },
    });
  };
  render();
  layoutAvatars(false);
  avatars.forEach((a, i) => a.addEventListener("click", () => go(i)));
  document.querySelector("[data-process-next]").addEventListener("click", () => go((cur + 1) % n));
  document.querySelector("[data-process-prev]").addEventListener("click", () => go((cur - 1 + n) % n));

  // Arrastar para os lados troca a etapa
  let startX = null;
  slide.addEventListener("pointerdown", (e) => { startX = e.clientX; slide.setPointerCapture(e.pointerId); });
  slide.addEventListener("pointermove", (e) => { if (startX !== null) gsap.set(slide, { x: (e.clientX - startX) * 0.5 }); });
  const end = (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (dx > 100) go((cur - 1 + n) % n);
    else if (dx < -100) go((cur + 1) % n);
    gsap.to(slide, { x: 0, duration: 0.4, ease: "power3.out" });
  };
  slide.addEventListener("pointerup", end);
  slide.addEventListener("pointercancel", end);

  const fades = gsap.utils.toArray(".fade-up");
  gsap.set(".process__avatars", { xPercent: -50 });
  if (reduced) gsap.set(fades, { opacity: 1, y: 0 });
  else gsap.fromTo(fades, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power2.out", scrollTrigger: { trigger: "#processo", start: "top 70%", once: true } });
}

/* ---------- Perguntas frequentes ---------- */
const FAQ = [
  ["Quem é o Gabriel e que tipo de projeto você aceita?", "Sou desenvolvedor e crio sites para empresas, páginas de venda, lojas virtuais e aplicativos. Meu foco é entregar algo bonito, rápido e fácil de usar, que ajude o seu negócio a vender e a ser lembrado."],
  ["Quanto tempo leva para o meu site ficar pronto?", "Uma página de venda costuma ficar pronta em poucos dias. Sites com várias páginas, efeitos em 3D ou loja virtual levam de duas a quatro semanas, dependendo do tamanho do projeto, do material que você já tem e das rodadas de ajuste."],
  ["Você trabalha com o design ou o conteúdo que eu já tenho?", "Sim. Se você já tem logo, cores, textos, fotos ou até um visual pronto, eu aproveito tudo e dou vida a isso no site. Se ainda não tem, criamos juntos do zero. Nos dois casos, o resultado final vai ter a cara da sua marca."],
  ["O site vai abrir rápido e funcionar bem no celular?", "Sim. Cada site é pensado primeiro para o celular, com imagens e vídeos leves para abrir rápido mesmo com internet mais lenta. As animações são ajustadas para rodar suaves em qualquer aparelho."],
  ["Como funciona o orçamento?", "Começa com uma conversa rápida para eu entender o que você precisa. Depois envio uma proposta com valor, prazo e tudo o que está incluso, sem surpresas no meio do caminho."],
];
function faq() {
  const host = document.querySelector("[data-faq]");
  if (!host) return;
  host.innerHTML = FAQ.map(([q, a], i) => `
    <div class="faq__item">
      <div class="faq__q" role="button" tabindex="0" aria-expanded="false" aria-controls="faq-a-${i}" id="faq-q-${i}">
        <div class="faq__head">
          <span>${q}</span>
          <span class="faq__icon" aria-hidden="true"><i></i><i></i><b></b></span>
        </div>
        <div class="faq__a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}">
          <div class="faq__a-inner"><p>${a}</p></div>
        </div>
      </div>
    </div>`).join("");
  const items = [...host.querySelectorAll(".faq__q")];
  const heights = items.map(() => 0);
  let open = -1;
  const dur = reduced ? 0 : 0.5;
  const setOpen = (i, on) => {
    const q = items[i];
    const panel = q.querySelector(".faq__a");
    gsap.killTweensOf(panel);
    q.classList.toggle("is-open", on);
    q.setAttribute("aria-expanded", on);
    if (on) {
      gsap.set(panel, { overflow: "hidden", height: "auto" });
      heights[i] = panel.scrollHeight;
      gsap.fromTo(panel, { height: 0 }, { height: heights[i], duration: dur, ease: "power3.out", onComplete: () => gsap.set(panel, { height: "auto", overflow: "visible" }) });
    } else {
      gsap.set(panel, { overflow: "hidden" });
      gsap.fromTo(panel, { height: heights[i] || panel.offsetHeight }, { height: 0, duration: dur, ease: "power3.out" });
    }
  };
  const toggle = (i) => {
    if (open === i) { setOpen(i, false); open = -1; return; }
    if (open !== -1) setOpen(open, false);
    setOpen(i, true);
    open = i;
  };
  items.forEach((q, i) => {
    q.addEventListener("click", (e) => { if (!e.target.closest("a, button, input, textarea, select")) toggle(i); });
    q.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(i); } });
  });
  // A primeira já começa aberta
  const first = items[0].querySelector(".faq__a");
  items[0].classList.add("is-open");
  items[0].setAttribute("aria-expanded", "true");
  gsap.set(first, { height: "auto", overflow: "visible" });
  heights[0] = first.scrollHeight;
  open = 0;

  const wraps = gsap.utils.toArray(".faq__item");
  if (reduced) gsap.set(wraps, { opacity: 1, y: 0 });
  else wraps.forEach((w) => gsap.fromTo(w, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: w, start: "top 85%" } }));
}

/* ---------- Rodapé ---------- */
function footer() {
  const card = document.querySelector("[data-footer-card]");
  if (reduced) { gsap.set(card, { opacity: 1, yPercent: 0 }); return; }
  if (window.innerWidth <= 1025) return;
  gsap.fromTo(card, { yPercent: 20 }, {
    yPercent: 0, ease: "power1.out",
    scrollTrigger: { trigger: "#contato", start: "top 60%", end: "bottom bottom", scrub: true },
  });
}

/* ---------- Canais de contato ---------- */
function contactLinks() {
  const links = {
    whatsapp: WHATSAPP && `https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent("Olá, Gabriel! Vim pelo seu portfólio.")}`,
    instagram: INSTAGRAM && `https://instagram.com/${INSTAGRAM.replace(/^@/, "")}`,
  };
  document.querySelectorAll("[data-contact-link]").forEach((li) => {
    const url = links[li.dataset.contactLink];
    if (!url) { li.remove(); return; }
    const a = li.querySelector("a");
    a.href = url;
    const handle = a.matches("[data-contact-handle]") ? a : null;
    if (handle) handle.textContent = `@${INSTAGRAM.replace(/^@/, "")}`;
  });
}

/* ---------- Modal de contato ---------- */
function contactModal() {
  const modal = document.getElementById("contact-modal");
  const panel = modal.querySelector(".modal__panel");
  const overlay = modal.querySelector(".modal__overlay");
  let lastFocus = null;
  let openedAt = 0;
  const open = (e) => {
    e.preventDefault();
    openedAt = Date.now();
    lastFocus = document.activeElement;
    modal.hidden = false;
    lenis.stop();
    gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: reduced ? 0 : 0.4, ease: "power2.out" });
    gsap.fromTo(panel, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: reduced ? 0 : 0.6, ease: "power3.out" });
    setTimeout(() => modal.querySelector("input")?.focus({ preventScroll: true }), 50);
  };
  const close = () => {
    gsap.to(panel, { opacity: 0, y: 40, duration: reduced ? 0 : 0.35, ease: "power2.in" });
    gsap.to(overlay, {
      opacity: 0, duration: reduced ? 0 : 0.35, ease: "power2.in",
      onComplete: () => { modal.hidden = true; lenis.start(); lastFocus?.focus?.({ preventScroll: true }); },
    });
  };
  document.querySelectorAll("[data-open-contact]").forEach((el) => el.addEventListener("click", open));
  modal.querySelectorAll("[data-close-contact]").forEach((el) => el.addEventListener("click", close));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !modal.hidden) close(); });
  const form = modal.querySelector("[data-contact-form]");
  const submit = form.querySelector('button[type="submit"]');
  const status = form.querySelector("[data-contact-status]");
  const setButton = (label, busy) => {
    submit.dataset.btn = label;
    submit.disabled = busy;
    buildButton(submit);
  };
  const setStatus = (text, kind) => {
    status.textContent = text;
    status.dataset.kind = kind || "";
  };
  // Limite de envios neste navegador, somado ao antispam do Web3Forms:
  // no mínimo 60 s entre mensagens, no máximo 3 por hora, e nada enviado em menos de 3 s após abrir o formulário.
  const LIMIT = { gap: 60 * 1000, perHour: 3, minFill: 3000, key: "contact-sends" };
  let memSends = [];
  const readSends = () => {
    let list = memSends;
    try { list = JSON.parse(localStorage.getItem(LIMIT.key) || "[]"); } catch {}
    const hourAgo = Date.now() - 60 * 60 * 1000;
    return Array.isArray(list) ? list.filter((t) => typeof t === "number" && t > hourAgo) : [];
  };
  const saveSend = () => {
    const list = [...readSends(), Date.now()];
    memSends = list;
    try { localStorage.setItem(LIMIT.key, JSON.stringify(list)); } catch {}
  };
  const blockedReason = () => {
    const sends = readSends();
    const last = sends[sends.length - 1] || 0;
    const wait = Math.ceil((last + LIMIT.gap - Date.now()) / 1000);
    if (wait > 0) return `Aguarde ${wait} segundo${wait > 1 ? "s" : ""} para enviar outra mensagem.`;
    if (sends.length >= LIMIT.perHour) {
      const mins = Math.ceil((sends[0] + 60 * 60 * 1000 - Date.now()) / 60000);
      return `Você já enviou ${LIMIT.perHour} mensagens. Tente de novo em ${mins} minuto${mins > 1 ? "s" : ""}.`;
    }
    return "";
  };

  form.addEventListener("input", (e) => {
    if (e.target.classList.contains("is-invalid") && e.target.value.trim()) e.target.classList.remove("is-invalid");
  });
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (submit.disabled) return;
    if (!WEB3FORMS_KEY) {
      window.open("https://github.com/gabrielnovaesdev", "_blank", "noopener");
      close();
      return;
    }
    // Validação própria, no lugar do balão padrão do navegador
    const fields = [...form.querySelectorAll("input[required], textarea[required]")];
    const bad = fields.filter((el) => !el.value.trim() || !el.checkValidity());
    fields.forEach((el) => el.classList.toggle("is-invalid", bad.includes(el)));
    if (bad.length) {
      const onlyEmail = bad.length === 1 && bad[0].name === "email" && bad[0].value.trim();
      setStatus(onlyEmail ? "Confira o seu e-mail." : "Preencha todos os campos para enviar.", "error");
      bad[0].focus();
      return;
    }
    const f = new FormData(form);
    // Robôs preenchem o campo invisível ou enviam na hora: finge que deu certo e não envia nada
    if (f.get("botcheck") || Date.now() - openedAt < LIMIT.minFill) {
      form.reset();
      setStatus("Mensagem enviada! Respondo em breve.", "ok");
      return;
    }
    const blocked = blockedReason();
    if (blocked) { setStatus(blocked, "error"); return; }
    setButton("Enviando...", true);
    setStatus("");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: "Portfólio Gabriel Novaes",
          subject: `Portfólio: ${f.get("subject")}`,
          name: f.get("name"),
          email: f.get("email"),
          message: f.get("message"),
          botcheck: f.get("botcheck") ? true : "",
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.message || res.status);
      saveSend();
      form.reset();
      setStatus("Mensagem enviada! Respondo em breve.", "ok");
      setButton("Enviar", false);
      setTimeout(() => { if (!modal.hidden) close(); setStatus(""); }, 3000);
    } catch {
      setStatus("Não foi possível enviar agora. Tente de novo em instantes.", "error");
      setButton("Enviar", false);
    }
  });
}

/* ---------- Início ---------- */
work();
why();
reel();
services();
indexList();
stack();
processCarousel();
faq();
footer();
contactLinks();
contactModal();
headerBehavior();
heroScroll();
heroVideo();

const fontsReady = document.fonts ? Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 1500))]) : Promise.resolve();
fontsReady.then(() => {
  // Sempre começa do topo, mesmo se o navegador tentar restaurar a rolagem
  window.scrollTo(0, 0);
  lenis.scrollTo(0, { immediate: true, force: true });
  document.querySelectorAll(".reveal:not([data-manual])").forEach(runReveal);
  ScrollTrigger.refresh();
  if (reduced) {
    document.querySelectorAll("[data-manual]").forEach(runReveal);
    gsap.set(".hero__portrait", { opacity: 1, "--reveal": "125%" });
    gsap.set("#header", { opacity: 1 });
    lenis.start();
  } else {
    intro();
  }
});
