/* Idiomas do site: português (padrão), inglês e espanhol.
   O idioma vem de ?lang= na URL, da última escolha (localStorage) ou do idioma do navegador.
   A troca acontece sem recarregar: I18N.set() muda o idioma e o main.js anima os textos.
   Textos fixos do HTML usam data-i18n (conteúdo), data-i18n-attr ("atributo:chave; ...") e data-i18n-btn (botões).
   Textos montados pelo main.js (serviços, etapas, dúvidas, projetos, mensagens do formulário) vêm de I18N.data e I18N.t.
   A política de privacidade continua só em português. */
window.I18N = (() => {
  const LANGS = ["pt", "en", "es"];
  const HTML_LANG = { pt: "pt-BR", en: "en", es: "es" };
  const OG_LOCALE = { pt: "pt_BR", en: "en_US", es: "es_ES" };

  const dict = {
    pt: {
      "meta.desc": "Portfólio de Gabriel Novaes: sites, lojas virtuais e aplicativos com movimento, da primeira conversa ao site no ar.",
      "skip": "Pular para o conteúdo",
      "lang.label": "Idioma",
      "nav.label": "Seções",
      "nav.projects": "Projetos",
      "nav.services": "Serviços",
      "nav.process": "Processo",
      "nav.faq": "Dúvidas",
      "logo.home": "Gabriel Novaes, início",
      "logo.top": "Gabriel Novaes, voltar ao início",
      "loader.hello": "Bem-vindo ao portfólio de",
      "hero.title": "Transformo ideias<br /> em experiências<br /> inesquecíveis",
      "hero.cta": "Pedir orçamento",
      "hero.side1": "Design, código<br />e movimento",
      "work.title": "Projetos selecionados",
      "work.open": "Abrir {name}",
      "why.title": "Por que trabalhar comigo?",
      "why.sub": "Da primeira conversa ao site no ar, sem enrolação",
      "why.1t": "Entrega rápida",
      "why.1p": "Sites e páginas de venda no ar em poucos dias, com um link para você acompanhar cada etapa desde o primeiro rascunho.",
      "why.2t": "Detalhe e movimento",
      "why.2p": "Animações suaves e efeitos que deixam o site vivo e marcante, sem deixá-lo lento para abrir no computador ou no celular.",
      "why.3t": "Tecnologia a seu favor",
      "why.3p": "Uso inteligência artificial para trabalhar mais rápido e com menos erros, e posso colocar atendimento automático no seu site quando isso trouxer resultado.",
      "reel.aria": "Reel de Gabriel Novaes",
      "reel.h": "Do código à entrega",
      "reel.l": "Do código",
      "reel.r": "à entrega",
      "services.title": "Sites que falam<br />com seu público",
      "services.text": "Meu trabalho é transformar a sua ideia em um site que traz resultado. Seja o site da sua empresa, uma loja virtual, uma experiência em 3D ou um aplicativo, cuido de tudo para que cada detalhe faça sentido para quem visita.",
      "index.title": "Tudo no ar,<br />pronto para ver",
      "newtab": "abre em nova aba",
      "stack.title": "Ferramentas que uso para tirar ideias do papel.",
      "process.title": "Do primeiro papo ao site no ar, passo a passo",
      "process.prev": "Etapa anterior",
      "process.next": "Próxima etapa",
      "process.see": "Ver etapa {name}",
      "faq.title": "Perguntas frequentes",
      "footer.cta": "Pronto para tirar sua ideia do papel?",
      "contact": "Fale comigo",
      "privacy": "Política de privacidade",
      "modal.close": "Fechar",
      "modal.sub": "Conte sua ideia em poucas linhas. Respondo em até um dia útil.",
      "modal.channels": "Prefere falar direto?",
      "form.name": "Seu nome*",
      "form.email": "E-mail*",
      "form.subject": "Assunto*",
      "form.message": "Mensagem*",
      "form.send": "Enviar",
      "form.sending": "Enviando...",
      "form.note": "Seus dados servem só para responder à sua mensagem.",
      "form.ok": "Mensagem enviada! Respondo em breve.",
      "form.fill": "Preencha todos os campos para enviar.",
      "form.emailBad": "Confira o seu e-mail.",
      "form.err": "Não foi possível enviar agora. Tente de novo em instantes.",
      "form.wait": (n) => `Aguarde ${n} segundo${n > 1 ? "s" : ""} para enviar outra mensagem.`,
      "form.limit": (n, m) => `Você já enviou ${n} mensagens. Tente de novo em ${m} minuto${m > 1 ? "s" : ""}.`,
      "wa.text": "Olá, Gabriel! Vim pelo seu portfólio.",
    },
    en: {
      "meta.desc": "Gabriel Novaes's portfolio: websites, online stores and apps with motion, from the first chat to launch.",
      "skip": "Skip to content",
      "lang.label": "Language",
      "nav.label": "Sections",
      "nav.projects": "Work",
      "nav.services": "Services",
      "nav.process": "Process",
      "nav.faq": "FAQ",
      "logo.home": "Gabriel Novaes, home",
      "logo.top": "Gabriel Novaes, back to top",
      "loader.hello": "Welcome to the portfolio of",
      "hero.title": "I turn ideas into<br /> unforgettable<br /> experiences",
      "hero.cta": "Get a quote",
      "hero.side1": "Design, code<br />and motion",
      "work.title": "Selected work",
      "work.open": "Open {name}",
      "why.title": "Why work with me?",
      "why.sub": "From the first chat to launch, no fluff",
      "why.1t": "Fast delivery",
      "why.1p": "Websites and sales pages live in just a few days, with a link so you can follow every step from the very first draft.",
      "why.2t": "Detail and motion",
      "why.2p": "Smooth animations and effects that make the site feel alive and memorable, without making it slow to open on a computer or phone.",
      "why.3t": "Technology on your side",
      "why.3p": "I use artificial intelligence to work faster and with fewer mistakes, and I can add automated customer service to your site when it brings results.",
      "reel.aria": "Gabriel Novaes reel",
      "reel.h": "From code to delivery",
      "reel.l": "From code",
      "reel.r": "to delivery",
      "services.title": "Websites that speak<br />to your audience",
      "services.text": "My job is to turn your idea into a website that delivers results. Whether it's your company site, an online store, a 3D experience or an app, I take care of everything so every detail makes sense to your visitors.",
      "index.title": "All live,<br />ready to explore",
      "newtab": "opens in a new tab",
      "stack.title": "Tools I use to bring ideas to life.",
      "process.title": "From the first chat to launch, step by step",
      "process.prev": "Previous step",
      "process.next": "Next step",
      "process.see": "See step {name}",
      "faq.title": "Frequently asked questions",
      "footer.cta": "Ready to bring your idea to life?",
      "contact": "Let's talk",
      "privacy": "Privacy policy (in Portuguese)",
      "modal.close": "Close",
      "modal.sub": "Tell me about your idea in a few lines. I reply within one business day.",
      "modal.channels": "Prefer to talk directly?",
      "form.name": "Your name*",
      "form.email": "Email*",
      "form.subject": "Subject*",
      "form.message": "Message*",
      "form.send": "Send",
      "form.sending": "Sending...",
      "form.note": "Your details are only used to reply to your message.",
      "form.ok": "Message sent! I'll get back to you soon.",
      "form.fill": "Please fill in every field to send.",
      "form.emailBad": "Please check your email.",
      "form.err": "Couldn't send right now. Please try again in a moment.",
      "form.wait": (n) => `Please wait ${n} second${n > 1 ? "s" : ""} before sending another message.`,
      "form.limit": (n, m) => `You've already sent ${n} messages. Try again in ${m} minute${m > 1 ? "s" : ""}.`,
      "wa.text": "Hi Gabriel! I found you through your portfolio.",
    },
    es: {
      "meta.desc": "Portafolio de Gabriel Novaes: sitios web, tiendas online y aplicaciones con movimiento, de la primera conversación al sitio publicado.",
      "skip": "Saltar al contenido",
      "lang.label": "Idioma",
      "nav.label": "Secciones",
      "nav.projects": "Proyectos",
      "nav.services": "Servicios",
      "nav.process": "Proceso",
      "nav.faq": "Preguntas",
      "logo.home": "Gabriel Novaes, inicio",
      "logo.top": "Gabriel Novaes, volver al inicio",
      "loader.hello": "Bienvenido al portafolio de",
      "hero.title": "Transformo ideas<br /> en experiencias<br /> inolvidables",
      "hero.cta": "Pedir presupuesto",
      "hero.side1": "Diseño, código<br />y movimiento",
      "work.title": "Proyectos seleccionados",
      "work.open": "Abrir {name}",
      "why.title": "¿Por qué trabajar conmigo?",
      "why.sub": "De la primera conversación al sitio publicado, sin rodeos",
      "why.1t": "Entrega rápida",
      "why.1p": "Sitios y páginas de venta publicados en pocos días, con un enlace para que sigas cada etapa desde el primer borrador.",
      "why.2t": "Detalle y movimiento",
      "why.2p": "Animaciones suaves y efectos que hacen el sitio vivo y memorable, sin volverlo lento en la computadora ni en el celular.",
      "why.3t": "Tecnología a tu favor",
      "why.3p": "Uso inteligencia artificial para trabajar más rápido y con menos errores, y puedo añadir atención automática a tu sitio cuando eso traiga resultados.",
      "reel.aria": "Reel de Gabriel Novaes",
      "reel.h": "Del código a la entrega",
      "reel.l": "Del código",
      "reel.r": "a la entrega",
      "services.title": "Sitios que hablan<br />con tu público",
      "services.text": "Mi trabajo es convertir tu idea en un sitio que da resultados. Ya sea el sitio de tu empresa, una tienda online, una experiencia en 3D o una aplicación, me encargo de todo para que cada detalle tenga sentido para quien lo visita.",
      "index.title": "Todo publicado,<br />listo para ver",
      "newtab": "se abre en una pestaña nueva",
      "stack.title": "Herramientas que uso para hacer realidad las ideas.",
      "process.title": "De la primera charla al sitio publicado, paso a paso",
      "process.prev": "Etapa anterior",
      "process.next": "Siguiente etapa",
      "process.see": "Ver etapa {name}",
      "faq.title": "Preguntas frecuentes",
      "footer.cta": "¿Listo para hacer realidad tu idea?",
      "contact": "Hablemos",
      "privacy": "Política de privacidad (en portugués)",
      "modal.close": "Cerrar",
      "modal.sub": "Cuéntame tu idea en pocas líneas. Respondo en un día hábil.",
      "modal.channels": "¿Prefieres hablar directo?",
      "form.name": "Tu nombre*",
      "form.email": "Correo*",
      "form.subject": "Asunto*",
      "form.message": "Mensaje*",
      "form.send": "Enviar",
      "form.sending": "Enviando...",
      "form.note": "Tus datos solo se usan para responder a tu mensaje.",
      "form.ok": "¡Mensaje enviado! Te respondo pronto.",
      "form.fill": "Completa todos los campos para enviar.",
      "form.emailBad": "Revisa tu correo.",
      "form.err": "No se pudo enviar ahora. Inténtalo de nuevo en unos instantes.",
      "form.wait": (n) => `Espera ${n} segundo${n > 1 ? "s" : ""} para enviar otro mensaje.`,
      "form.limit": (n, m) => `Ya enviaste ${n} mensajes. Inténtalo de nuevo en ${m} minuto${m > 1 ? "s" : ""}.`,
      "wa.text": "¡Hola, Gabriel! Vengo de tu portafolio.",
    },
  };

  const data = {
    pt: {
      services: [
        { title: "Sites Sob Medida", items: ["Sites para empresas", "Páginas de venda", "Visual único para a sua marca", "Perfeito em qualquer tela"] },
        { title: "Movimento & Animação", items: ["Animações ao rolar a página", "Navegação suave", "Detalhes que reagem ao toque", "Vídeos dentro do site"] },
        { title: "Experiências em 3D", items: ["Produtos em 3D no site", "Cenas que seguem o mouse", "Objetos para girar e explorar", "Leve e rápido de abrir"] },
        { title: "Lojas & Apps", items: ["Lojas virtuais completas", "Pagamento via Pix", "Aplicativos para celular", "Painel para gerenciar o negócio"] },
        { title: "IA no seu Negócio", items: ["Atendimento automático 24h", "Menos tarefas repetitivas", "Assistentes que respondem clientes", "Ideias testadas em poucos dias"] },
      ],
      steps: [
        { name: "Conversa", role: "Etapa 01 · Primeiro contato", quote: "Entendo o seu negócio, o seu público e o que o site precisa resolver. Saímos dessa conversa com objetivo, prazo e o que vai ser feito bem definidos." },
        { name: "Direção", role: "Etapa 02 · Proposta visual", quote: "Reúno referências e mostro uma primeira proposta: letras, cores e o estilo de movimento que combina com a sua marca." },
        { name: "Construção", role: "Etapa 03 · Criação do site", quote: "Construo o site com animações, efeitos em 3D quando fazem sentido e versão para celular. Você acompanha cada avanço por um link." },
        { name: "Ajustes", role: "Etapa 04 · Revisão", quote: "Revisamos juntos cada parte. Ajusto textos e detalhes até o resultado ficar do jeito que você imaginou." },
        { name: "No ar", role: "Etapa 05 · Lançamento", quote: "Coloco o site no ar com o seu endereço, pronto para ser encontrado no Google e abrir rápido. Depois do lançamento, continuo por perto para o que precisar." },
      ],
      faq: [
        ["Quem é o Gabriel e que tipo de projeto você aceita?", "Sou desenvolvedor e crio sites para empresas, páginas de venda, lojas virtuais e aplicativos. Meu foco é entregar algo bonito, rápido e fácil de usar, que ajude o seu negócio a vender e a ser lembrado."],
        ["Quanto tempo leva para o meu site ficar pronto?", "Uma página de venda costuma ficar pronta em poucos dias. Sites com várias páginas, efeitos em 3D ou loja virtual levam de duas a quatro semanas, dependendo do tamanho do projeto, do material que você já tem e das rodadas de ajuste."],
        ["Você trabalha com o design ou o conteúdo que eu já tenho?", "Sim. Se você já tem logo, cores, textos, fotos ou até um visual pronto, eu aproveito tudo e dou vida a isso no site. Se ainda não tem, criamos juntos do zero. Nos dois casos, o resultado final vai ter a cara da sua marca."],
        ["O site vai abrir rápido e funcionar bem no celular?", "Sim. Cada site é pensado primeiro para o celular, com imagens e vídeos leves para abrir rápido mesmo com internet mais lenta. As animações são ajustadas para rodar suaves em qualquer aparelho."],
        ["Como funciona o orçamento?", "Começa com uma conversa rápida para eu entender o que você precisa. Depois envio uma proposta com valor, prazo e tudo o que está incluso, sem surpresas no meio do caminho."],
      ],
      kinds: {},
    },
    en: {
      services: [
        { title: "Custom Websites", items: ["Company websites", "Sales pages", "A unique look for your brand", "Perfect on any screen"] },
        { title: "Motion & Animation", items: ["Scroll animations", "Smooth navigation", "Details that react to touch", "Videos inside the site"] },
        { title: "3D Experiences", items: ["3D products on your site", "Scenes that follow the mouse", "Objects to spin and explore", "Light and fast to load"] },
        { title: "Stores & Apps", items: ["Complete online stores", "Pix payments", "Mobile apps", "A dashboard to run your business"] },
        { title: "AI for your Business", items: ["24/7 automated support", "Fewer repetitive tasks", "Assistants that answer customers", "Ideas tested in a few days"] },
      ],
      steps: [
        { name: "Conversation", role: "Step 01 · First contact", quote: "I get to know your business, your audience and what the site needs to solve. We leave that conversation with a clear goal, deadline and scope." },
        { name: "Direction", role: "Step 02 · Visual proposal", quote: "I gather references and show you a first proposal: fonts, colors and the style of motion that fits your brand." },
        { name: "Build", role: "Step 03 · Building the site", quote: "I build the site with animations, 3D effects when they make sense and a mobile version. You follow every step through a link." },
        { name: "Refinements", role: "Step 04 · Review", quote: "We review every part together. I adjust copy and details until the result looks the way you imagined." },
        { name: "Live", role: "Step 05 · Launch", quote: "I put the site live on your domain, ready to be found on Google and to load fast. After launch, I'm still around for whatever you need." },
      ],
      faq: [
        ["Who is Gabriel and what kind of projects do you take on?", "I'm a developer who builds websites for companies, sales pages, online stores and apps. My focus is delivering something beautiful, fast and easy to use that helps your business sell and be remembered."],
        ["How long until my website is ready?", "A sales page is usually ready in a few days. Multi-page sites, 3D effects or online stores take two to four weeks, depending on the size of the project, the material you already have and the rounds of revisions."],
        ["Can you work with the design or content I already have?", "Yes. If you already have a logo, colors, copy, photos or even a finished design, I use all of it and bring it to life on the site. If you don't, we create it together from scratch. Either way, the final result will look like your brand."],
        ["Will the site load fast and work well on mobile?", "Yes. Every site is designed mobile-first, with light images and videos so it loads fast even on slower connections. Animations are tuned to run smoothly on any device."],
        ["How does the quote work?", "It starts with a quick chat so I understand what you need. Then I send a proposal with price, timeline and everything included, with no surprises along the way."],
      ],
      kinds: {
        hubclass: "Sales page · Education",
        rosazul: "Company website · Health",
        pizzaria: "Website · Restaurant",
        bmw: "Product page · Automotive",
        monolito: "Company website · Architecture",
        novaestore: "Online store · Games",
        orbita: "Product showcase · Technology",
        nebula: "Digital studio · Interactive",
      },
    },
    es: {
      services: [
        { title: "Sitios a Medida", items: ["Sitios para empresas", "Páginas de venta", "Un estilo único para tu marca", "Perfecto en cualquier pantalla"] },
        { title: "Movimiento & Animación", items: ["Animaciones al hacer scroll", "Navegación fluida", "Detalles que reaccionan al toque", "Videos dentro del sitio"] },
        { title: "Experiencias en 3D", items: ["Productos en 3D en tu sitio", "Escenas que siguen el mouse", "Objetos para girar y explorar", "Ligero y rápido de abrir"] },
        { title: "Tiendas & Apps", items: ["Tiendas online completas", "Pagos con Pix", "Aplicaciones para celular", "Panel para gestionar tu negocio"] },
        { title: "IA en tu Negocio", items: ["Atención automática 24h", "Menos tareas repetitivas", "Asistentes que responden a clientes", "Ideas probadas en pocos días"] },
      ],
      steps: [
        { name: "Conversación", role: "Etapa 01 · Primer contacto", quote: "Entiendo tu negocio, tu público y lo que el sitio necesita resolver. Salimos de esa conversación con el objetivo, el plazo y el alcance bien definidos." },
        { name: "Dirección", role: "Etapa 02 · Propuesta visual", quote: "Reúno referencias y te muestro una primera propuesta: tipografías, colores y el estilo de movimiento que combina con tu marca." },
        { name: "Construcción", role: "Etapa 03 · Creación del sitio", quote: "Construyo el sitio con animaciones, efectos en 3D cuando tienen sentido y versión para celular. Sigues cada avance por un enlace." },
        { name: "Ajustes", role: "Etapa 04 · Revisión", quote: "Revisamos juntos cada parte. Ajusto textos y detalles hasta que el resultado quede como lo imaginaste." },
        { name: "Publicado", role: "Etapa 05 · Lanzamiento", quote: "Publico el sitio con tu dominio, listo para aparecer en Google y abrir rápido. Después del lanzamiento sigo cerca para lo que necesites." },
      ],
      faq: [
        ["¿Quién es Gabriel y qué tipo de proyectos aceptas?", "Soy desarrollador y creo sitios para empresas, páginas de venta, tiendas online y aplicaciones. Mi foco es entregar algo bonito, rápido y fácil de usar, que ayude a tu negocio a vender y a ser recordado."],
        ["¿Cuánto tarda mi sitio en estar listo?", "Una página de venta suele estar lista en pocos días. Los sitios con varias páginas, efectos en 3D o tienda online llevan de dos a cuatro semanas, según el tamaño del proyecto, el material que ya tienes y las rondas de ajustes."],
        ["¿Trabajas con el diseño o el contenido que ya tengo?", "Sí. Si ya tienes logo, colores, textos, fotos o incluso un diseño listo, aprovecho todo y le doy vida en el sitio. Si aún no lo tienes, lo creamos juntos desde cero. En ambos casos, el resultado final tendrá la cara de tu marca."],
        ["¿El sitio abrirá rápido y funcionará bien en el celular?", "Sí. Cada sitio se piensa primero para el celular, con imágenes y videos livianos para abrir rápido incluso con internet más lenta. Las animaciones se ajustan para funcionar suaves en cualquier dispositivo."],
        ["¿Cómo funciona el presupuesto?", "Empieza con una charla rápida para entender lo que necesitas. Después te envío una propuesta con precio, plazo y todo lo que incluye, sin sorpresas en el camino."],
      ],
      kinds: {
        hubclass: "Página de ventas · Educación",
        rosazul: "Sitio institucional · Salud",
        pizzaria: "Sitio · Restaurante",
        bmw: "Página de producto · Automotriz",
        monolito: "Sitio institucional · Arquitectura",
        novaestore: "Tienda online · Videojuegos",
        orbita: "Vitrina de producto · Tecnología",
        nebula: "Estudio digital · Interactivo",
      },
    },
  };

  // Escolha do idioma: ?lang= > última escolha > idioma do navegador > português
  const pick = () => {
    const fromUrl = new URLSearchParams(location.search).get("lang");
    if (LANGS.includes(fromUrl)) return fromUrl;
    try {
      const saved = localStorage.getItem("gn-lang");
      if (LANGS.includes(saved)) return saved;
    } catch {}
    const nav = (navigator.languages || [navigator.language || ""]).map((l) => l.slice(0, 2).toLowerCase());
    return nav.find((l) => LANGS.includes(l)) || "pt";
  };
  let lang = pick();

  const t = (key, ...args) => {
    const v = dict[lang][key] ?? dict.pt[key] ?? key;
    if (typeof v === "function") return v(...args);
    const vars = args[0] || {};
    return v.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? "");
  };

  // Idioma da página e textos de compartilhamento
  const meta = () => {
    document.documentElement.lang = HTML_LANG[lang];
    document.querySelector('meta[name="description"]')?.setAttribute("content", t("meta.desc"));
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", t("meta.desc"));
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", t("meta.desc"));
    document.querySelector('meta[property="og:locale"]')?.setAttribute("content", OG_LOCALE[lang]);
  };
  // Atributos (aria-label, placeholder): trocam na hora, sem animação
  const applyAttrs = () => {
    document.querySelectorAll("[data-i18n-attr]").forEach((el) => {
      el.dataset.i18nAttr.split(";").forEach((pair) => {
        const [attr, key] = pair.split(":").map((x) => x.trim());
        if (attr && key) el.setAttribute(attr, t(key));
      });
    });
  };
  const markSwitch = () => {
    document.querySelectorAll("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));
  };

  // Primeira pintura: o HTML vem em português; nos outros idiomas os textos trocam antes de aparecer
  meta();
  markSwitch();
  if (lang !== "pt") {
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.innerHTML = t(el.dataset.i18n); });
    document.querySelectorAll("[data-i18n-btn]").forEach((el) => { el.dataset.btn = t(el.dataset.i18nBtn); });
    applyAttrs();
  }

  return {
    get lang() { return lang; },
    get data() { return data[lang]; },
    langs: LANGS,
    t,
    kind: (p) => data[lang].kinds[p.slug] || p.kind,
    // Troca o idioma sem recarregar; quem anima os textos é o main.js
    set(next) {
      if (!LANGS.includes(next) || next === lang) return false;
      lang = next;
      try { localStorage.setItem("gn-lang", next); } catch {}
      const url = new URL(location.href);
      if (url.searchParams.has("lang")) { url.searchParams.delete("lang"); history.replaceState(null, "", url); }
      meta();
      applyAttrs();
      markSwitch();
      return true;
    },
  };
})();
