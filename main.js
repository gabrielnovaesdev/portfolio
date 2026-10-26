(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  if (hasGsap) gsap.registerPlugin(ScrollTrigger);
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* ---------- Hero entrance ---------- */
  const hero = document.querySelector(".hero");
  const heroImgs = [...hero.querySelectorAll(".photo img")];

  // Same stagger index in both word layers so solid and outline letters move together.
  hero.querySelectorAll(".word").forEach((word) =>
    word.querySelectorAll(".l > span").forEach((el, i) => el.style.setProperty("--i", i))
  );

  const loaded = (img) => (img.complete ? Promise.resolve() : new Promise((r) => (img.onload = img.onerror = r)));
  const fontsReady = document.fonts
    ? Promise.all([document.fonts.load('370px "League Gothic"'), document.fonts.load('16px "Inter"')])
    : Promise.resolve();
  const assetsReady = Promise.all([...heroImgs.map(loaded), fontsReady]);

  const startHero = () => {
    void hero.offsetWidth; // commit the initial state so the transitions run
    hero.classList.add("is-ready");
  };

  /* ---------- Render projects ---------- */
  const projects = window.PROJECTS || [];
  const pad = (n) => String(n).padStart(2, "0");
  const media = (slug) => `assets/projects/${slug}`;
  const tpl = document.getElementById("chapter-tpl");
  const stack = document.querySelector(".stack");
  const indexList = document.querySelector("[data-index]");
  const host = (url) => url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  const linkHtml = (href, label) =>
    `<a class="link" href="${href}" target="_blank" rel="noopener">${label} ↗</a>`;

  projects.forEach((p, i) => {
    const node = tpl.content.firstElementChild.cloneNode(true);
    node.id = `projeto-${p.slug}`;
    node.querySelector("[data-num]").textContent = `[${pad(i + 1)}]`;
    node.querySelector("[data-kind]").textContent = p.kind;
    node.querySelector("[data-count]").textContent = `${pad(i + 1)} / ${pad(projects.length)}`;
    node.querySelector("[data-name]").textContent = p.name;
    node.querySelector("[data-desc]").textContent = p.description;
    node.querySelector("[data-stack]").innerHTML = p.stack.map((s) => `<li>${s}</li>`).join("");
    node.querySelector("[data-links]").innerHTML =
      (p.live ? linkHtml(p.live, "Ver ao vivo") : "") + linkHtml(p.repo, "Código");

    const video = `<video src="${media(p.slug)}.mp4" poster="${media(p.slug)}.jpg" muted loop playsinline preload="none" aria-label="Prévia do projeto ${p.name}"></video>`;
    node.querySelector("[data-media]").innerHTML =
      p.device === "phone"
        ? `<div class="device"><div class="device__screen">${video}</div></div>`
        : `<div class="frame">
             <div class="frame__bar">
               <span class="frame__dots"><i></i><i></i><i></i></span>
               <span class="frame__url">${host(p.live || p.repo)}</span>
               <span></span>
             </div>
             <div class="frame__screen">${video}</div>
           </div>`;
    stack.append(node);

    const li = document.createElement("li");
    li.dataset.flick = "";
    li.innerHTML = `<a href="#projeto-${p.slug}" data-slug="${p.slug}"><span>${pad(i + 1)}</span>${p.name}</a>`;
    indexList.append(li);
  });

  const panels = [...stack.querySelectorAll(".panel")];
  const videos = panels.map((p) => p.querySelector("video"));
  const playOnly = (idx) =>
    videos.forEach((v, i) => {
      if (!v) return;
      if (i === idx) {
        v.preload = "auto";
        v.play().catch(() => {});
      } else v.pause();
    });

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.1, touchMultiplier: 1.4 });
    if (hasGsap) {
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      const raf = (t) => (lenis.raf(t), requestAnimationFrame(raf));
      requestAnimationFrame(raf);
    }
  }
  const scrollToY = (y) => (lenis ? lenis.scrollTo(y, { duration: 1.6 }) : scrollTo({ top: y, behavior: "smooth" }));

  /* ---------- Loader: count up, letters go transparent, then zoom through them ---------- */
  const loader = document.querySelector(".loader");

  const finishLoader = () => {
    loader?.remove();
    root.classList.remove("is-loading");
    lenis?.start();
    if (hasGsap) ScrollTrigger.refresh();
  };

  const runLoader = async () => {
    scrollTo(0, 0);
    lenis?.stop();
    if (!loader || !hasGsap || reduceMotion) {
      await assetsReady;
      startHero();
      finishLoader();
      return;
    }

    const svg = loader.querySelector(".loader__cut");
    const words = [...loader.querySelectorAll(".loader__word")];
    const fill = loader.querySelector(".loader__fill");
    const zooms = [...loader.querySelectorAll(".loader__zoom")];
    const rises = [...loader.querySelectorAll(".loader__rise")];
    const clipRect = loader.querySelector(".loader__clip-rect");
    const count = loader.querySelector(".loader__count");
    const bar = loader.querySelector(".loader__bar i");
    const ui = loader.querySelector(".loader__ui");

    await fontsReady;

    // Lay the word out to ~90% of the width, centred, and find a point inside the "I" stem.
    const W = innerWidth, H = innerHeight;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    loader.querySelectorAll(".loader__bg, .loader__mask-bg").forEach((r) => {
      r.setAttribute("width", W);
      r.setAttribute("height", H);
    });
    words.forEach((t) => t.setAttribute("font-size", 100));
    const fs = (100 * W * 0.9) / words[0].getComputedTextLength();
    const cap = fs * 0.734; // League Gothic cap height
    const baseline = H / 2 + cap / 2;
    words.forEach((t) => {
      t.setAttribute("font-size", fs);
      t.setAttribute("x", W / 2);
      t.setAttribute("y", baseline);
      t.setAttribute("text-anchor", "middle");
    });
    clipRect.setAttribute("x", 0);
    clipRect.setAttribute("y", baseline - cap - fs * 0.08);
    clipRect.setAttribute("width", W);
    clipRect.setAttribute("height", cap + fs * 0.16);
    const stem = words[0].getExtentOfChar(4); // G A B R [I]
    const ox = stem.x + stem.width / 2;
    const oy = baseline - cap / 2;
    const zoomTo = (s) => zooms.forEach((z) => z.setAttribute("transform", `translate(${ox} ${oy}) scale(${s}) translate(${-ox} ${-oy})`));

    const rise = { y: cap + fs * 0.1 };
    const setRise = () => rises.forEach((r) => r.setAttribute("transform", `translate(0 ${rise.y})`));
    setRise();
    const counter = { v: 0 };

    const intro = gsap.timeline();
    intro
      .from(ui.children, { autoAlpha: 0, duration: 0.6, stagger: 0.1, ease: "power2.out" }, 0)
      .to(rise, { y: 0, duration: 1.3, ease: "expo.out", onUpdate: setRise }, 0.15)
      .to(counter, {
        v: 100,
        duration: 1.9,
        ease: "power2.inOut",
        onUpdate: () => {
          count.textContent = String(Math.round(counter.v)).padStart(3, "0");
          bar.style.scale = `${counter.v / 100} 1`;
        },
      }, 0.1);

    await Promise.all([assetsReady, new Promise((r) => intro.eventCallback("onComplete", r))]);

    const zoom = { p: 0 };
    gsap
      .timeline({ onComplete: finishLoader })
      .to(ui, { autoAlpha: 0, duration: 0.5, ease: "power2.out" }, 0)
      // the letters turn transparent: the Hero shows through them
      .call(startHero, null, 0.15)
      .to(fill, { opacity: 0, duration: 1, ease: "power2.inOut" }, 0.15)
      // then the camera travels into the "I"; past ~40x the browser stops drawing the
      // mask, so the zoom stays below that and the cut-out dissolves into the site instead
      .to(zoom, { p: 1, duration: 1.5, ease: "power2.in", onUpdate: () => zoomTo(40 ** zoom.p) }, 0.95)
      .to(loader, { autoAlpha: 0, duration: 0.7, ease: "power1.in" }, 1.75);
  };
  runLoader();

  /* ---------- Scene: B/W footage; hovering a project swaps in its preview ---------- */
  const scene = document.querySelector(".scene");
  const sceneVideo = scene.querySelector(".scene__video");
  const fallbackSrc = `${media(projects[0]?.slug)}.mp4`;
  let sceneSrc = sceneVideo.getAttribute("src");
  // until assets/scene.mp4 exists, the first project's preview plays here
  sceneVideo.addEventListener("error", () => {
    if (sceneVideo.getAttribute("src") === fallbackSrc) return;
    sceneSrc = fallbackSrc;
    sceneVideo.src = fallbackSrc;
  });
  let swapTimer;
  const swapScene = (src) => {
    if (sceneVideo.getAttribute("src") === src) return;
    clearTimeout(swapTimer);
    sceneVideo.classList.add("is-swapping");
    swapTimer = setTimeout(() => {
      sceneVideo.src = src;
      sceneVideo.play().catch(() => {});
      sceneVideo.addEventListener("loadeddata", () => sceneVideo.classList.remove("is-swapping"), { once: true });
    }, 250);
  };
  // The reel loops on its own while the scene is on screen and pauses once it leaves
  new IntersectionObserver(([entry]) =>
    entry.isIntersecting ? sceneVideo.play().catch(() => {}) : sceneVideo.pause()
  ).observe(scene);

  if (matchMedia("(pointer: fine)").matches) {
    indexList.querySelectorAll("a").forEach((a) =>
      a.addEventListener("pointerenter", () => swapScene(`${media(a.dataset.slug)}.mp4`))
    );
    indexList.addEventListener("pointerleave", () => swapScene(sceneSrc));
  }

  /* ---------- Text reveals (reference style) ----------
     Headlines: per line, a colour block covers the text, then pulls away revealing it,
     each line starting while the previous is still moving. Small copy fades up;
     list items flick on one after another. */
  const revealed = new WeakSet();
  const parts = (el) => [
    [...el.querySelectorAll(".line > span")],
    [...el.querySelectorAll("[data-fade]")],
    [...el.querySelectorAll("[data-flick]")],
  ];
  const prepReveal = (el) => {
    const [lines, fades, flicks] = parts(el);
    lines.forEach((span) => {
      if (!span.querySelector(".wipe")) span.insertAdjacentHTML("beforeend", '<i class="wipe" aria-hidden="true"></i>');
      gsap.set(span, { visibility: "hidden" });
    });
    if (fades.length) gsap.set(fades, { autoAlpha: 0, y: 14 });
    if (flicks.length) gsap.set(flicks, { autoAlpha: 0 });
  };
  const reveal = (el, delay = 0) => {
    if (!el || revealed.has(el)) return;
    revealed.add(el);
    const [lines, fades, flicks] = parts(el);
    const tl = gsap.timeline({ delay });
    lines.forEach((span, i) => {
      const wipe = span.querySelector(".wipe");
      const at = i * 0.09;
      tl.fromTo(wipe, { scaleX: 0, transformOrigin: "left center" }, { scaleX: 1, duration: 0.42, ease: "power3.inOut" }, at)
        .set(span, { visibility: "inherit" }, at + 0.42)
        .to(wipe, { scaleX: 0, transformOrigin: "right center", duration: 0.55, ease: "expo.out" }, at + 0.42);
    });
    const after = lines.length ? 0.35 : 0;
    if (fades.length) tl.to(fades, { autoAlpha: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 }, after);
    if (flicks.length) tl.to(flicks, { autoAlpha: 1, duration: 0.28, ease: "power1.inOut", stagger: 0.035 }, after);
  };

  // anchor links (hero arrow, footer); index rows are wired per layout below
  let jumpToPanel = (i) => panels[i]?.scrollIntoView({ behavior: "smooth" });
  document.querySelector(".arrow").addEventListener("click", (e) => {
    e.preventDefault();
    scrollToY(stack.getBoundingClientRect().top + scrollY);
  });
  document.querySelector("[data-scroll-top]").addEventListener("click", (e) => {
    e.preventDefault();
    scrollToY(0);
  });
  indexList.querySelectorAll("a").forEach((a, i) =>
    a.addEventListener("click", (e) => {
      e.preventDefault();
      jumpToPanel(i + 1);
    })
  );

  if (!hasGsap || reduceMotion) {
    const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause())));
    videos.forEach((v) => v && io.observe(v));
    return;
  }

  const footer = document.querySelector(".footer");
  [...panels, scene, footer].forEach(prepReveal);
  ScrollTrigger.create({ trigger: scene, start: "top 55%", once: true, onEnter: () => reveal(scene) });
  ScrollTrigger.create({ trigger: footer, start: "top 70%", once: true, onEnter: () => reveal(footer) });

  const mm = gsap.matchMedia();

  /* ---------- Desktop: pinned stage, one timeline, varied transitions ---------- */
  mm.add("(min-width: 701px)", () => {
    // Hero darkens softly while the stage rises over it (overlay only: no repaint of the photo).
    gsap.to(".hero-wrap__shade", {
      opacity: 0.75,
      ease: "none",
      scrollTrigger: { trigger: stack, start: "top bottom", end: "top top", scrub: true },
    });
    ScrollTrigger.create({ trigger: stack, start: "top 55%", once: true, onEnter: () => reveal(panels[0]) });

    // transition used to bring in panel i+1
    const VARIANTS = ["window", "side", "wipe", "up", "window", "side", "wipe"];
    const CLIP_FULL = "inset(0% 0% 0% 0% round 0px)";
    const from = {
      window: { panel: { clipPath: "inset(50% 50% 50% 50% round 28px)" }, inner: { scale: 1.25 } },
      side: { panel: { xPercent: 100 }, inner: { xPercent: -40 } },
      wipe: { panel: { clipPath: "inset(100% 0% 0% 0% round 0px)" }, inner: { yPercent: 25 } },
      up: { panel: { yPercent: 100 }, inner: { scale: 1.08 } },
    };
    const out = {
      window: { scale: 0.9 },
      side: { xPercent: -30 },
      wipe: { yPercent: -14 },
      up: { yPercent: -18, scale: 0.96 },
    };

    const inners = panels.map((p) => p.querySelector(".panel__inner"));
    const exiting = panels.map((p) => [...p.querySelectorAll(".line, [data-fade]")]);
    const shades = panels.map((p) => p.querySelector(".panel__shade"));
    panels.forEach((p, i) => {
      if (!i) return;
      const v = from[VARIANTS[i - 1]];
      gsap.set(p, { clipPath: CLIP_FULL, xPercent: 0, yPercent: 0, ...v.panel });
      gsap.set(inners[i], v.inner);
    });

    const TRANSITION = 1;
    const HOLD = 0.45;
    const tl = gsap.timeline({ defaults: { ease: "power2.inOut", duration: TRANSITION } });
    const activeAt = [0];
    let t = 0.25; // brief hold on the intro once the stage is pinned
    for (let i = 1; i < panels.length; i++) {
      const v = VARIANTS[i - 1];
      tl.to(panels[i], { clipPath: CLIP_FULL, xPercent: 0, yPercent: 0 }, t)
        .to(inners[i], { scale: 1, xPercent: 0, yPercent: 0 }, t)
        .to(inners[i - 1], out[v], t)
        .to(shades[i - 1], { opacity: 0.65 }, t)
        .to(exiting[i - 1], { x: "-55vw", ease: "power2.in", duration: 0.7, stagger: 0.04 }, t);
      activeAt.push(t + TRANSITION * 0.55);
      t += TRANSITION + HOLD;
    }
    tl.to({}, { duration: HOLD * 0.6 }); // let the last project breathe before the index

    let active = -1;
    const setActive = (time) => {
      let idx = 0;
      while (idx + 1 < activeAt.length && activeAt[idx + 1] <= time) idx++;
      if (idx === active) return;
      active = idx;
      reveal(panels[idx], idx ? 0.05 : 0);
      playOnly(idx);
    };

    const PX_PER_UNIT = () => innerHeight * 0.8;
    const st = ScrollTrigger.create({
      trigger: stack,
      start: "top top",
      end: () => `+=${tl.duration() * PX_PER_UNIT()}`,
      pin: true,
      scrub: 0.3,
      animation: tl,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      // use the scroll position (not the smoothed timeline time) so text never lags or gets skipped
      onUpdate: (self) => setActive(self.progress * tl.duration()),
      onEnter: (self) => setActive(self.progress * tl.duration()),
      onLeave: () => playOnly(-1),
      onEnterBack: (self) => setActive(self.progress * tl.duration()),
      onLeaveBack: () => playOnly(-1),
    });

    jumpToPanel = (i) => {
      const time = i ? activeAt[i] + TRANSITION * 0.5 : 0;
      scrollToY(st.start + (time / tl.duration()) * (st.end - st.start));
    };

    return () => {
      active = -1;
      gsap.set([...panels, ...inners, ...shades], { clearProps: "all" });
      gsap.set(exiting.flat(), { clearProps: "x" });
    };
  });

  /* ---------- Mobile: plain flow, reveals as each panel enters ---------- */
  mm.add("(max-width: 700px)", () => {
    panels.forEach((p, i) =>
      ScrollTrigger.create({
        trigger: p,
        start: "top 70%",
        end: "bottom 30%",
        onEnter: () => reveal(p),
        onToggle: (self) => {
          const v = videos[i];
          if (!v) return;
          if (self.isActive) {
            v.preload = "auto";
            v.play().catch(() => {});
          } else v.pause();
        },
      })
    );
    jumpToPanel = (i) => scrollToY(panels[i].getBoundingClientRect().top + scrollY);
  });
})();
