(() => {
  const hero = document.querySelector(".hero");
  const imgs = [...hero.querySelectorAll(".photo img")];

  // Same stagger index in both word layers so solid and outline letters move together.
  hero.querySelectorAll(".word").forEach((word) =>
    word.querySelectorAll(".l > span").forEach((el, i) => el.style.setProperty("--i", i))
  );

  // Start the entrance once the photos and the display font are ready.
  const loaded = (img) => (img.complete ? Promise.resolve() : new Promise((r) => (img.onload = img.onerror = r)));
  const fontReady = document.fonts ? document.fonts.load('370px "League Gothic"') : Promise.resolve();

  Promise.all([...imgs.map(loaded), fontReady]).then(() => {
    void hero.offsetWidth; // commit the initial state so the transitions run
    hero.classList.add("is-ready");
  });
})();
