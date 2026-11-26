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

// Vidro líquido: só Chrome/Edge (Chromium) aplicam filtro SVG dentro do backdrop-filter.
// Nos outros navegadores os botões ficam com o vidro fosco, sem a refração.
// Celular e tablet (tela de toque ou até 767 px): sem vídeo nenhum e sem o filtro de refração,
// que pesam no processador e na bateria. Ficam as fotos e os pôsteres.
const LITE = window.matchMedia("(hover: none) and (pointer: coarse), (max-width: 767px)").matches;
if (LITE) document.documentElement.classList.add("is-lite");
if (!LITE && /Chrome|Chromium|Edg\//.test(navigator.userAgent) && !/Firefox|FxiOS/.test(navigator.userAgent)) {
  document.documentElement.classList.add("lg-refract");
}

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const { t } = window.I18N;
const isDesktop = () => window.innerWidth > 1025;
const PROJECTS = window.PROJECTS || [];
const poster = (p) => `assets/projects/${p.slug}.jpg`;
const video = (p) => `assets/projects/${p.slug}.mp4`;
const linkOf = (p) => p.live || p.repo;

/* ---------- Rolagem suave ---------- */
// O ScrollTrigger guarda a posição da rolagem e devolve o navegador ao modo "auto" ao recarregar,
// e aí o F5 abria o site no meio da página. clearScrollMemory("manual") apaga essa memória e fixa o modo manual.
const toTop = () => {
  ScrollTrigger.clearScrollMemory("manual");
  window.scrollTo(0, 0);
  lenis?.scrollTo(0, { immediate: true, force: true });
};
let lenis;
toTop();
window.addEventListener("load", toTop);

lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
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
// mode: undefined = espera a rolagem; "now" = toca já (troca de idioma); "done" = aparece pronto
function runReveal(wrap, mode) {
  if (wrap._revealed) return;
  wrap._revealed = true;
  const by = wrap.dataset.reveal || "chars";
  const stagger = wrap.dataset.stagger ? parseFloat(wrap.dataset.stagger) : by === "lines" ? 0.1 : 0.03;
  const targets = [];
  wrap._splits = [];
  [...wrap.children].forEach((el) => {
    // Texto inteiro para leitores de tela (o <br> vira espaço), antes de virar letras soltas
    const tmp = document.createElement("div");
    tmp.innerHTML = el.innerHTML.replace(/<br\s*\/?>/gi, " ");
    const spoken = tmp.textContent.replace(/\s+/g, " ").trim();
    // As letras animadas ficam escondidas do leitor de tela; o elemento (título, parágrafo) continua visível
    // para ele e ganha uma cópia invisível do texto. Assim os títulos não somem da ordem h1 > h2 > h3.
    const speak = () => {
      el.removeAttribute("aria-hidden");
      el.insertAdjacentHTML("beforeend", `<span class="sr-only">${spoken}</span>`);
    };
    if (by === "lines") {
      const s = SplitText.create(el, { type: "lines", mask: "lines", linesClass: "line++", reduceWhiteSpace: false, aria: "hidden" });
      wrap._splits.push(s);
      speak();
      targets.push(...s.lines);
    } else {
      const s = SplitText.create(el, { type: "lines,chars", mask: "chars", charsClass: "char++", reduceWhiteSpace: false, aria: "hidden" });
      wrap._splits.push(s);
      speak();
      (s.masks || []).forEach((m) => {
        m.style.paddingInline = "0.04em";
        m.style.marginInline = "-0.04em";
        m.style.boxSizing = "content-box";
      });
      targets.push(...s.chars);
    }
  });
  wrap._targets = targets;
  if (reduced) {
    if (mode) { gsap.set(wrap, { opacity: 1, y: 0 }); return; }
    gsap.set(wrap, { opacity: 0, y: 24 });
    gsap.to(wrap, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out", scrollTrigger: { trigger: wrap, start: "top 85%", once: true } });
    return;
  }
  gsap.set(wrap, { opacity: 1 });
  if (mode === "done") { gsap.set(targets, { yPercent: 0, xPercent: 0, rotate: 0, opacity: 1 }); wrap._tween = null; return; }
  wrap._tween = gsap.fromTo(
    targets,
    { ...directions.bottom, willChange: "transform" },
    {
      yPercent: 0, xPercent: 0, rotate: 0, opacity: 1,
      duration: 0.5, stagger: mode === "now" ? Math.min(stagger, 0.012) : stagger, ease: "power3.out",
      ...(mode === "now" ? {} : { scrollTrigger: { trigger: wrap, start: "top 85%", end: "bottom 68%" } }),
    }
  );
}

/* ---------- Troca de idioma sem recarregar ----------
   O personagem, o vídeo, a rolagem e tudo que não é texto ficam onde estão. Só os textos trocam:
   - texto que entrou letra a letra (ou linha a linha) sai pelo alto e o novo sobe pela mesma máscara;
   - o resto esmaece rápido, troca e volta. Fora da tela a troca é direta, sem animação. */
const langHooks = [];
const inView = (el) => {
  const r = el.getBoundingClientRect();
  return r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth && r.width > 0;
};
function swapText(el, html, { asText = false } = {}) {
  const set = () => { if (asText) el.textContent = html; else el.innerHTML = html; };
  if ((asText ? el.textContent : el.innerHTML) === html) return;
  if (reduced || !inView(el)) { set(); return; }
  gsap.killTweensOf(el, "opacity,y");
  gsap.to(el, {
    opacity: 0, y: -10, duration: 0.22, ease: "power2.in",
    onComplete: () => { set(); gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out", clearProps: "transform" }); },
  });
}
// Texto dentro de um bloco .reveal: desfaz o recorte, troca e recorta de novo no idioma novo
function relang(wrap, apply) {
  if (!wrap._revealed) { apply(); return; }
  const tw = wrap._tween;
  const shown = !tw || tw.progress() > 0;
  const redo = (mode) => {
    if (tw) { tw.scrollTrigger?.kill(); tw.kill(); }
    (wrap._splits || []).forEach((sp) => sp.revert());
    wrap._splits = []; wrap._revealed = false; wrap._tween = null;
    apply();
    runReveal(wrap, mode);
  };
  if (!shown) { redo(); return; }
  if (reduced || !inView(wrap)) { redo("done"); return; }
  gsap.to(wrap._targets, {
    yPercent: -110, duration: 0.28, ease: "power2.in", stagger: 0.006, overwrite: true,
    onComplete: () => redo("now"),
  });
}
function changeLang(next) {
  if (!I18N.set(next)) return;
  moveLangPill(true);
  // Âncora: a seção no topo da tela continua no mesmo lugar depois que os textos mudarem de tamanho
  const anchor = [...document.querySelectorAll("main > section, footer")].find((sec) => sec.getBoundingClientRect().bottom > 0);
  const anchorTop = anchor?.getBoundingClientRect().top ?? 0;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const html = t(el.dataset.i18n);
    const wrap = el.parentElement?.classList.contains("reveal") ? el.parentElement : null;
    if (wrap) relang(wrap, () => { el.innerHTML = html; });
    else swapText(el, html);
  });
  document.querySelectorAll("[data-i18n-btn]").forEach((el) => {
    el.dataset.btn = t(el.dataset.i18nBtn);
    if (reduced || !inView(el)) { buildButton(el); return; }
    gsap.to(el.querySelectorAll(".btn__text > span > span"), {
      yPercent: -110, opacity: 0, duration: 0.2, stagger: 0.008, ease: "power2.in",
      onComplete: () => {
        buildButton(el);
        gsap.from(el.querySelectorAll(".btn__text > span > span"), { yPercent: 110, opacity: 0, duration: 0.45, stagger: 0.012, ease: "power3.out" });
      },
    });
  });
  langHooks.forEach((fn) => fn());
  // As alturas dos textos mudaram: recalcula as animações de rolagem quando tudo assentar
  gsap.delayedCall(0.9, () => {
    ScrollTrigger.refresh();
    if (!anchor) return;
    const diff = anchor.getBoundingClientRect().top - anchorTop;
    if (Math.abs(diff) > 1) lenis.scrollTo(window.scrollY + diff, { immediate: true, force: true });
  });
}

/* ---------- Seletor de idioma: a pílula branca escorrega até a bandeira escolhida ----------
   Na troca ela se estica cobrindo as duas opções e depois se recolhe na nova, com uma mola suave
   (o mesmo gesto dos "tabs" animados do 21st.dev); a bandeira escolhida gira de leve e assenta. */
let moveLangPill = () => {};
function langSwitch() {
  const box = document.querySelector(".lang");
  if (!box) return;
  const pill = box.querySelector(".lang__pill");
  const buttons = [...box.querySelectorAll("[data-lang]")];
  const place = (b) => ({ x: b.offsetLeft, w: b.offsetWidth });
  let cur = place(buttons.find((b) => b.dataset.lang === I18N.lang) || buttons[0]);
  gsap.set(pill, { x: cur.x, width: cur.w });
  moveLangPill = (animate) => {
    const btn = buttons.find((b) => b.dataset.lang === I18N.lang);
    const to = place(btn);
    gsap.killTweensOf(pill);
    if (!animate || reduced) { gsap.set(pill, { x: to.x, width: to.w }); cur = to; return; }
    const left = Math.min(cur.x, to.x);
    const right = Math.max(cur.x + cur.w, to.x + to.w);
    gsap.timeline()
      .to(pill, { x: left, width: right - left, duration: 0.22, ease: "power2.out" })
      .to(pill, { x: to.x, width: to.w, duration: 0.7, ease: "elastic.out(1, 0.78)" });
    // A bandeira escolhida gira de leve e assenta junto com a pílula
    gsap.fromTo(btn.querySelector(".lang__flag"), { rotate: to.x > cur.x ? -35 : 35, scale: 0.7 }, { rotate: 0, scale: 1, duration: 0.8, ease: "back.out(2.4)" });
    cur = to;
  };
  // Cabeçalho e rodapé: qualquer botão de idioma troca o site inteiro
  document.querySelectorAll("[data-lang]").forEach((b) => b.addEventListener("click", () => changeLang(b.dataset.lang)));
  window.addEventListener("resize", () => moveLangPill(false));
  document.fonts?.ready.then(() => moveLangPill(false));
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

/* ---------- Hero: halftone no hover (inspirado no Halftone Reveal do React Bits, modo reverso duotone) ----------
   Um canvas WebGL desenha o vídeo do personagem. Por onde o mouse passa, a imagem vira uma impressão
   em pontos brancos (retícula a 45°) e vermelhos (a 15°), que se desfaz em cerca de 1 s.
   Só no computador, com o vídeo ativo; quem prefere menos movimento nem chega aqui. */
function heroHalftone(vid, box, isOnScreen) {
  if (window.matchMedia("(hover: none)").matches) return;
  const cv = document.createElement("canvas");
  cv.className = "hero__fx";
  cv.setAttribute("aria-hidden", "true");
  const gl = cv.getContext("webgl", { premultipliedAlpha: false, alpha: true, antialias: false });
  if (!gl) return;
  vid.after(cv);

  const vs = "attribute vec2 p;varying vec2 uv;void main(){uv=p*.5+.5;uv.y=1.-uv.y;gl_Position=vec4(p,0,1);}";
  const fs = `precision mediump float;
varying vec2 uv; uniform sampler2D vid, mask; uniform vec2 res; uniform float cell;
vec4 S(vec2 u){ return texture2D(vid, clamp(u, 0., 1.)); }
float L(vec3 c){ return dot(c, vec3(.299,.587,.114)); }
float dots(vec2 px, float ang, out float a){
  float s = sin(ang), c = cos(ang);
  vec2 r = mat2(c,-s,s,c) * px;
  vec2 id = floor(r / cell) + .5;
  vec4 col = S((mat2(c,s,-s,c) * (id * cell)) / res);
  a = col.a;
  float l = clamp((L(col.rgb) - .04) * 1.15, 0., 1.);
  return 1. - smoothstep(-.06, .06, length(r / cell - id) - sqrt(l) * .62);
}
void main(){
  vec4 photo = S(uv);
  // O rastro esmaece em 8 bits e para em ~4%; abaixo de 6% conta como zero para a impressão sumir por inteiro
  float m = (texture2D(mask, uv).r - .06) / .94;
  if (m <= 0.) { gl_FragColor = photo; return; }
  vec2 px = uv * res; float a1, a2;
  float w = dots(px, .785, a1);
  float r = dots(px + 2., .26, a2);
  vec3 ink = mix(vec3(w), vec3(.88,.08,.12), r * (1. - w * .6));
  gl_FragColor = mix(photo, vec4(ink, max(w * a1, r * a2)), smoothstep(0., .6, m));
}`;
  const compile = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const v = compile(gl.VERTEX_SHADER, vs), f = compile(gl.FRAGMENT_SHADER, fs);
  if (!v || !f) { cv.remove(); return; }
  const pr = gl.createProgram();
  gl.attachShader(pr, v); gl.attachShader(pr, f); gl.linkProgram(pr); gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const ap = gl.getAttribLocation(pr, "p");
  gl.enableVertexAttribArray(ap); gl.vertexAttribPointer(ap, 2, gl.FLOAT, false, 0, 0);
  const U = (n) => gl.getUniformLocation(pr, n);
  const texture = (unit) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    return t;
  };
  const tVid = texture(0), tMask = texture(1);
  gl.uniform1i(U("vid"), 0); gl.uniform1i(U("mask"), 1);

  // Rastro do mouse: círculos suaves num canvas pequeno que escurece um pouco a cada quadro
  const mk = document.createElement("canvas");
  mk.width = 224; mk.height = 176;
  const mx = mk.getContext("2d");
  let pointer = null, cell = 5;
  const resize = () => {
    const r = cv.getBoundingClientRect();
    const d = Math.min(window.devicePixelRatio || 1, 1.5);
    cv.width = Math.max(1, Math.round(r.width / (gsap.getProperty(".hero__stage", "scale") || 1) * d));
    cv.height = Math.max(1, Math.round(cv.width * 880 / 1120));
    cell = 5 * d;
    gl.viewport(0, 0, cv.width, cv.height);
  };
  window.addEventListener("resize", resize);
  window.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const r = cv.getBoundingClientRect();
    pointer = { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height };
  }, { passive: true });
  document.addEventListener("pointerleave", () => { pointer = null; });

  let ready = false;
  const draw = () => {
    requestAnimationFrame(draw);
    if (!isOnScreen() || document.hidden || vid.readyState < 2 || !box.classList.contains("has-video")) return;
    if (!ready) { ready = true; resize(); box.classList.add("has-fx"); }
    // Rastro: escurece (linger) e pinta onde o mouse está, se estiver sobre o personagem
    mx.fillStyle = "rgba(0,0,0,0.045)";
    mx.fillRect(0, 0, mk.width, mk.height);
    const inside = pointer && pointer.x > -0.1 && pointer.x < 1.1 && pointer.y > -0.1 && pointer.y < 1.1;
    if (inside) {
      const x = pointer.x * mk.width, y = pointer.y * mk.height, rad = 26;
      const g = mx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, "rgba(255,255,255,.5)");
      g.addColorStop(0.55, "rgba(255,255,255,.2)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      mx.fillStyle = g; mx.beginPath(); mx.arc(x, y, rad, 0, Math.PI * 2); mx.fill();
    }
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, tMask);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mk);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tVid);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, vid);
    gl.uniform2f(U("res"), cv.width, cv.height);
    gl.uniform1f(U("cell"), cell);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };
  requestAnimationFrame(draw);
}

/* ---------- Hero: loop do Gabriel virando a cabeça ---------- */
// Só onde dá para mostrar o fundo transparente: Chrome, Edge e Firefox (VP9 com alfa).
// Safari, celular, tablet e quem prefere menos movimento ficam com a foto.
function heroVideo() {
  const vid = document.querySelector(".hero__video");
  const box = document.querySelector(".hero__portrait");
  if (!vid) return;
  const ua = navigator.userAgent;
  const safari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox|FxiOS|CriOS/.test(ua);
  const vp9 = vid.canPlayType('video/webm; codecs="vp9"');
  if (reduced || LITE || safari || !vp9) { vid.remove(); return; }
  vid.preload = "auto";
  vid.addEventListener("playing", () => box.classList.add("has-video"), { once: true });

  // Loop com respiro: ao terminar, fica 2 s parado no último quadro (igual ao primeiro) e recomeça.
  // Estado explícito para nada prender o vídeo:
  //   onScreen   o hero está visível (fora dele, pausa para poupar processamento)
  //   resting    está nos 2 s de pausa entre uma volta e outra
  const LOOP_DELAY = 2000;
  let onScreen = true;
  let resting = false;
  let timer = null;
  const shouldPlay = () => onScreen && !resting && !document.hidden;
  const play = () => { if (shouldPlay() && vid.paused) vid.play().catch(() => {}); };

  const restart = () => {
    if (resting) return;
    resting = true;
    vid.pause();
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = null;
      resting = false;
      vid.currentTime = 0;
      play();
    }, LOOP_DELAY);
  };
  vid.addEventListener("ended", restart);
  // Rede de segurança: alguns navegadores não disparam "ended" depois de muitas voltas
  vid.addEventListener("timeupdate", () => {
    if (vid.duration && vid.currentTime >= vid.duration - 0.06) restart();
  });
  // Se o navegador pausar sozinho (aba em segundo plano, economia de energia), retoma assim que puder
  vid.addEventListener("pause", () => { if (!vid.ended) setTimeout(play, 300); });
  vid.addEventListener("stalled", () => setTimeout(play, 500));
  document.addEventListener("visibilitychange", play);

  // Vigia: se o vídeo deveria estar rodando mas o tempo parou por 1,5 s, destrava
  let lastT = -1, still = 0;
  setInterval(() => {
    if (!shouldPlay() || !vid.src) { still = 0; return; }
    if (vid.currentTime === lastT) {
      still += 500;
      if (still >= 1500) { still = 0; if (vid.currentTime >= vid.duration - 0.1) restart(); else { vid.pause(); vid.play().catch(() => {}); } }
    } else still = 0;
    lastT = vid.currentTime;
  }, 500);

  // Visível = qualquer parte do hero dentro da tela (antes pausava ao voltar exatamente ao topo)
  ScrollTrigger.create({
    trigger: "#hero", start: "top bottom", end: "bottom top",
    onToggle: (self) => {
      onScreen = self.isActive;
      if (onScreen) play(); else vid.pause();
    },
  });

  heroHalftone(vid, box, () => onScreen);

  // O vídeo vai inteiro para a memória antes de tocar: voltar ao início fica instantâneo
  // em qualquer servidor (o servidor local de teste não entrega o arquivo em partes).
  fetch(vid.dataset.src)
    .then((r) => (r.ok ? r.blob() : Promise.reject()))
    .then((blob) => { vid.src = URL.createObjectURL(blob); })
    .catch(() => { vid.src = vid.dataset.src; })
    .finally(play);
}

/* ---------- Tela de entrada ----------
   1. Tela neutra: "Bem-vindo ao portfólio de" sobe palavra por palavra, depois o nome letra por letra
   2. Uma linha vermelha fina acompanha o carregamento (fontes e página)
   3. Saída: o nome encolhe e voa até o logo do cabeçalho, a cortina sobe em arco e o hero começa por baixo
   Aparece em todo carregamento; quem prefere menos movimento entra direto. */
function loader(pageReady, start) {
  const el = document.getElementById("loader");
  if (!el) { pageReady.then(() => start(false)); return; }

  const wrapChars = (node, byWord) => {
    node.querySelectorAll(":scope > span").length
      ? node.querySelectorAll(":scope > span").forEach((s) => wrapChars(s, byWord))
      : (node.innerHTML = (byWord ? node.textContent.split(" ") : [...node.textContent])
          .map((t) => `<span class="loader__w"><span>${t}</span></span>`).join(""));
  };
  const hello = el.querySelector("[data-loader-hello]");
  const name = el.querySelector("[data-loader-name]");
  const bar = el.querySelector("[data-loader-bar]");
  // Guarda o texto puro do nome: na saída ele volta a ser texto corrido, igual ao logo do cabeçalho
  const nameParts = [...name.children].map((s) => s.textContent);
  wrapChars(hello, true);
  wrapChars(name, false);

  // Cada letra num bloco perde o kerning (o "VA" de NOVAES abre). Mede onde cada letra fica no texto corrido,
  // igual ao logo, e corrige a margem de cada bloco: o nome entra e pousa com o mesmo espaçamento
  function kern() {
    const plain = name.cloneNode(false);
    plain.innerHTML = nameParts.map((txt, i) => `<span class="${name.children[i].className}">${txt}</span>`).join("");
    plain.style.cssText = "position:absolute;visibility:hidden;left:0;top:0";
    name.parentNode.appendChild(plain);
    const lefts = [];
    let end = 0;
    plain.querySelectorAll("span").forEach((sp) => {
      const node = sp.firstChild;
      const r = document.createRange();
      for (let i = 0; i < node.length; i += 1) {
        r.setStart(node, i); r.setEnd(node, i + 1);
        const b = r.getBoundingClientRect();
        lefts.push(b.left);
        end = b.right;
      }
    });
    plain.remove();
    const boxes = [...name.querySelectorAll(".loader__w")];
    boxes.forEach((b) => { b.style.marginRight = "0px"; });
    boxes.forEach((b, i) => {
      const step = (i + 1 < lefts.length ? lefts[i + 1] : end) - lefts[i];
      b.style.marginRight = `${(step - b.getBoundingClientRect().width).toFixed(3)}px`;
    });
  }

  const t0 = performance.now();
  const ready = Promise.race([
    Promise.all([
      pageReady,
      document.readyState === "complete" ? Promise.resolve() : new Promise((r) => window.addEventListener("load", r, { once: true })),
    ]),
    new Promise((r) => setTimeout(r, 4000)),
  ]);

  // Só começa quando a fonte do título carregou (no máximo 0,6 s), para as letras não trocarem de fonte no meio
  const fontIn = document.fonts ? document.fonts.load('400 1em "Host Grotesk"').catch(() => {}) : Promise.resolve();
  const enter = gsap.timeline({ paused: true });
  Promise.race([fontIn, new Promise((r) => setTimeout(r, 600))]).then(() => {
    kern();
    gsap.set(el.querySelector(".loader__inner"), { opacity: 1 });
    enter.play();
  });
  enter.from(hello.querySelectorAll(".loader__w > span"), { yPercent: 110, duration: 0.9, ease: "power4.out", stagger: 0.06 }, 0.15)
    .from(name.querySelectorAll(".loader__w > span"), { yPercent: 110, duration: 1, ease: "power4.out", stagger: 0.035 }, 0.45)
    .to(bar, { scaleX: 0.7, duration: 1.6, ease: "power2.out" }, 0.3);

  ready.then(() => {
    const wait = Math.max(0, 2100 - (performance.now() - t0));
    gsap.delayedCall(wait / 1000, leave);
  });

  function leave() {
    const header = document.getElementById("header");
    const logo = header.querySelector(".logo");
    const rest = [...header.children].filter((c) => c !== logo);
    // As letras viram texto corrido de novo: mesmo kerning do logo, sem salto na troca
    [...name.children].forEach((s, i) => { s.textContent = nameParts[i]; });
    const from = name.getBoundingClientRect();
    const to = logo.getBoundingClientRect();
    const s = to.width / from.width;
    gsap.set(header, { opacity: 1, yPercent: 0 });
    gsap.set(logo, { opacity: 0 });
    gsap.set(rest, { opacity: 0 });

    const tl = gsap.timeline({ onComplete: () => { el.remove(); lenis.start(); } });
    tl.to(bar, { scaleX: 1, duration: 0.35, ease: "power2.inOut" }, 0)
      .to([hello, bar.parentNode], { opacity: 0, y: -16, duration: 0.5, ease: "power2.in" }, 0.25)
      // O nome vira o logo: mesma fonte, só muda posição e escala. x e y com curvas diferentes desenham um arco
      .to(name, { x: to.left - from.left, duration: 1.2, ease: "power3.inOut" }, 0.35)
      .to(name, { y: to.top - from.top, scale: s, duration: 1.2, ease: "expo.inOut" }, 0.35)
      // Cortina em arco subindo e o hero começando por baixo dela
      .to(el.querySelector(".loader__bg"), { yPercent: -100, duration: 1.25, ease: "power4.inOut" }, 0.45)
      .call(() => start(true), undefined, 0.75)
      // Troca no mesmo quadro em que o nome pousa: o logo de verdade assume, sem esmaecer um sobre o outro
      .set(logo, { opacity: 1 }, 1.55)
      .set(name, { opacity: 0 }, 1.55)
      // Menu e idiomas entram depois, um de cada vez
      .to(rest, { opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.12 }, 1.4);
  }
}

/* ---------- Abertura do hero ---------- */
// fromLoader: a tela de entrada já cuida do cabeçalho e da rolagem
function intro(fromLoader) {
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
    .fromTo("[data-hero-cta]", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 1.6)
    .call(() => {
      if (fromLoader) return;
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
    <div class="work__item" data-i="${i}" role="button" tabindex="0">
      <span class="work__dot"></span>
      <div>
        <h3>${p.name}</h3>
        <p>${I18N.kind(p).split(" · ").join("  •  ")}</p>
      </div>
    </div>`).join("");

  media.innerHTML = PROJECTS.map((p, i) => `
    <a class="work__slide${p.device === "phone" ? " work__slide--phone" : ""}" style="z-index:${i + 1}" href="${linkOf(p)}" target="_blank" rel="noopener" aria-label="${t("work.open", { name: p.name })}">
      ${LITE
        ? `<img src="${poster(p)}" alt="" width="1280" height="800" loading="${i === 0 ? "eager" : "lazy"}" decoding="async" />`
        : `<video src="${video(p)}" poster="${poster(p)}" muted loop playsinline preload="${i === 0 ? "auto" : "metadata"}"></video>`}
    </a>`).join("");

  langHooks.push(() => {
    list.querySelectorAll(".work__item p").forEach((el, i) => swapText(el, I18N.kind(PROJECTS[i]).split(" · ").join("  •  "), { asText: true }));
    media.querySelectorAll(".work__slide").forEach((a, i) => a.setAttribute("aria-label", t("work.open", { name: PROJECTS[i].name })));
  });
  const dots = [...list.querySelectorAll(".work__dot")];
  const slides = [...media.querySelectorAll(".work__slide")];
  const videos = slides.map((s) => s.querySelector("video")).filter(Boolean);
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
      if (!v) return;
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
  let vid = frame.querySelector("video");
  const words = section.querySelectorAll(".reel__word");
  if (LITE) {
    const img = document.createElement("img");
    img.className = "reel__video";
    img.src = vid.getAttribute("poster");
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    vid.replaceWith(img);
    vid = img;
  } else {
    // Sem som em nenhuma hipótese
    vid.muted = true;
    vid.volume = 0;
    vid.addEventListener("volumechange", () => { if (!vid.muted || vid.volume) { vid.muted = true; vid.volume = 0; } });
  }

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
  } else {
    gsap.set(frame, { clipPath: cardInset() });
    const tl = gsap.timeline({
      scrollTrigger: { trigger: section, start: "top top", end: "bottom bottom", scrub: true, invalidateOnRefresh: true },
    });
    tl.fromTo(frame, { clipPath: () => cardInset() }, { clipPath: "inset(0px 0px 0px 0px round 0px)", ease: "power2.inOut", duration: 0.7 }, 0)
      .fromTo(vid, { scale: 1.25 }, { scale: 1, ease: "power2.inOut", duration: 0.7 }, 0)
      .to(words[0], { xPercent: -60, opacity: 0, ease: "power2.in", duration: 0.55 }, 0)
      .to(words[1], { xPercent: 60, opacity: 0, ease: "power2.in", duration: 0.55 }, 0)
      .to({}, { duration: 0.3 });

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
      .fromTo(vid, { filter: "brightness(1)" }, { filter: "brightness(0.35)", ease: "none", immediateRender: false }, 0);
  }

  if (LITE) return;
  // Toca só enquanto está na tela
  ScrollTrigger.create({
    trigger: section, start: "top 80%", end: "bottom top",
    onToggle: (self) => { if (self.isActive) vid.play().catch(() => {}); else vid.pause(); },
  });

}

/* ---------- Serviços ---------- */
const arrowSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>';

function services() {
  const row = document.querySelector("[data-services]");
  if (!row) return;
  const body = (s) => `<h3>${s.title}</h3>
        <ul>${s.items.map((it) => `<li><span>${it}</span></li>`).join("")}</ul>`;
  row.innerHTML = I18N.data.services.map((s, i) => `
    <a class="service${i === 0 ? " is-active" : ""}" href="#contato" data-open-contact>
      <div class="service__fill"></div>
      <div class="service__top"><div class="service__arrow"><span>${arrowSvg}</span><span>${arrowSvg}</span></div></div>
      <div class="service__body">
        ${body(s)}
      </div>
    </a>`).join("");

  const cards = [...row.children];
  langHooks.push(() => cards.forEach((c, i) => swapText(c.querySelector(".service__body"), body(I18N.data.services[i]))));
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
      <a class="index__row" href="${linkOf(p)}" target="_blank" rel="noopener" aria-label="${p.name}, ${I18N.kind(p)} (${t("newtab")})">
        <div class="reveal" data-reveal="lines"><h3>${p.name}</h3></div>
        <div class="reveal" data-reveal="lines"><p>${I18N.kind(p)}</p></div>
      </a>`);
  });
  html.push('<div class="index__sep"></div>');
  rowsHost.innerHTML = html.join("");
  rowsHost.querySelectorAll(".index__sep").forEach(stringLine);
  langHooks.push(() => rowsHost.querySelectorAll(".index__row").forEach((row, i) => {
    const p = PROJECTS[i];
    row.setAttribute("aria-label", `${p.name}, ${I18N.kind(p)} (${t("newtab")})`);
    const kind = row.querySelectorAll(".reveal")[1];
    relang(kind, () => { kind.querySelector("p").textContent = I18N.kind(p); });
  }));

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
        filter: LITE ? "none" : "blur(10px)",
        z: desk ? gsap.utils.random(-2200, -1600) : gsap.utils.random(-550, -400),
      });
      // No celular o desfoque animado pesa demais: os logos só aparecem e somem
      tl.to(el, { z: 0, opacity: 1, filter: LITE ? "none" : "blur(0px)", duration: inDur }, at)
        .to(el, { filter: LITE ? "none" : "blur(10px)", opacity: 0, z: desk ? gsap.utils.random(1400, 1800) : gsap.utils.random(500, 700), duration: outDur }, at + inDur);
    });
  });
}

/* ---------- Processo (carrossel) ---------- */
function processCarousel() {
  const slide = document.querySelector("[data-process-slide]");
  const avatarsHost = document.querySelector("[data-process-avatars]");
  if (!slide) return;
  const steps = () => I18N.data.steps;
  const n = steps().length;
  let cur = 0;
  let busy = false;

  avatarsHost.innerHTML = steps().map((s, i) => `
    <button class="avatar" type="button" aria-label="${t("process.see", { name: s.name })}">
      <span class="avatar__face"><img src="${poster(PROJECTS[i % PROJECTS.length])}" alt="" width="120" height="120" /></span>
    </button>`).join("");
  const avatars = [...avatarsHost.children];

  const html = () => {
    const s = steps()[cur];
    return `
      <div class="process__who"><p class="process__name">${s.name}</p><p class="process__role">${s.role}</p></div>
      <p class="process__quote">“${s.quote}”</p>`;
  };
  const render = () => { slide.innerHTML = html(); };
  langHooks.push(() => {
    swapText(slide, html());
    avatars.forEach((a, i) => a.setAttribute("aria-label", t("process.see", { name: steps()[i].name })));
  });
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
function faq() {
  const host = document.querySelector("[data-faq]");
  if (!host) return;
  // Dados estruturados (FAQPage) gerados da mesma lista exibida, para nunca divergirem do texto na tela
  const ld = document.createElement("script");
  ld.type = "application/ld+json";
  const schema = () => JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: I18N.data.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  });
  ld.textContent = schema();
  document.head.appendChild(ld);
  host.innerHTML = I18N.data.faq.map(([q, a], i) => `
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
  langHooks.push(() => {
    ld.textContent = schema();
    items.forEach((q, i) => {
      const [qq, aa] = I18N.data.faq[i];
      swapText(q.querySelector(".faq__head > span"), qq, { asText: true });
      swapText(q.querySelector(".faq__a-inner p"), aa, { asText: true });
      heights[i] = 0; // a resposta mudou de tamanho: a próxima abertura mede de novo
    });
  });
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
langHooks.push(() => contactLinks());
function contactLinks() {
  const links = {
    whatsapp: WHATSAPP && `https://wa.me/${WHATSAPP.replace(/\D/g, "")}?text=${encodeURIComponent(t("wa.text"))}`,
    instagram: INSTAGRAM && `https://instagram.com/${INSTAGRAM.replace(/^@/, "")}`,
  };
  document.querySelectorAll("[data-contact-link]").forEach((li) => {
    const url = links[li.dataset.contactLink];
    if (!url) { li.remove(); return; }
    const a = li.querySelector("a");
    if (a) a.href = url;
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
    if (wait > 0) return t("form.wait", wait);
    if (sends.length >= LIMIT.perHour) {
      const mins = Math.ceil((sends[0] + 60 * 60 * 1000 - Date.now()) / 60000);
      return t("form.limit", LIMIT.perHour, mins);
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
      setStatus(onlyEmail ? t("form.emailBad") : t("form.fill"), "error");
      bad[0].focus();
      return;
    }
    const f = new FormData(form);
    // Robôs preenchem o campo invisível ou enviam na hora: finge que deu certo e não envia nada
    if (f.get("botcheck") || Date.now() - openedAt < LIMIT.minFill) {
      form.reset();
      setStatus(t("form.ok"), "ok");
      return;
    }
    const blocked = blockedReason();
    if (blocked) { setStatus(blocked, "error"); return; }
    setButton(t("form.sending"), true);
    setStatus("");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          from_name: "Portfólio Gabriel Novaes",
          subject: `Portfólio${I18N.lang === "pt" ? "" : ` [${I18N.lang.toUpperCase()}]`}: ${f.get("subject")}`,
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
      setStatus(t("form.ok"), "ok");
      setButton(t("form.send"), false);
      setTimeout(() => { if (!modal.hidden) close(); setStatus(""); }, 3000);
    } catch {
      setStatus(t("form.err"), "error");
      setButton(t("form.send"), false);
    }
  });
}

/* ---------- Links internos (menu, logos): viagem animada até a seção, nunca um salto seco ---------- */
// Acelera no começo, desacelera na chegada; quanto mais longe o destino, mais longa a viagem (até 2,6 s)
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
function anchorLinks() {
  document.querySelectorAll('a[href^="#"]:not([data-open-contact]):not(.skip)').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const target = id === "#hero" || id === "#" ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      if (reduced) { lenis.scrollTo(target, { immediate: true, force: true }); return; }
      const y = target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY;
      const dist = Math.abs(y - window.scrollY);
      const duration = Math.min(2.6, Math.max(1, 0.9 + dist / (window.innerHeight * 8)));
      lenis.scrollTo(target, { duration, easing: easeInOutCubic, force: true });
    });
  });
  // "Pular para o conteúdo" leva o foco ao início do conteúdo sem depender da rolagem suave
  document.querySelector(".skip")?.addEventListener("click", (e) => {
    e.preventDefault();
    const main = document.getElementById("conteudo");
    main.focus({ preventScroll: true });
    lenis.scrollTo(main, { immediate: true });
  });
}

/* ---------- Início ---------- */
langSwitch();
anchorLinks();
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
  toTop();
  document.querySelectorAll(".reveal:not([data-manual])").forEach(runReveal);
  ScrollTrigger.refresh();
  if (reduced) {
    document.querySelectorAll("[data-manual]").forEach(runReveal);
    gsap.set(".hero__portrait", { opacity: 1, "--reveal": "125%" });
    gsap.set("#header", { opacity: 1 });
    gsap.set("[data-hero-cta]", { opacity: 1 });
    document.getElementById("loader")?.remove();
    lenis.start();
  }
});
// A tela de entrada começa na hora e espera as fontes em paralelo. Na revelação mede tudo de novo:
// se a janela mudou de tamanho durante o carregamento, o hero já aparece com a altura certa.
if (!reduced) loader(fontsReady, (fromLoader) => { toTop(); ScrollTrigger.refresh(); intro(fromLoader); });
