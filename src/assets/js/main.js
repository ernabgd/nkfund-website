// Small progressive enhancements. Every page works without this file:
// the menu opens through #menu:target, currency tabs are radio buttons, the hero shows its poster,
// the film has native controls and gallery links open the full image.
// 1. header states  2. menu dialog  3. hero video  4. film cover  5. copy buttons  6. reveal  7. lightbox
//
// Nothing is hidden before the code that shows it again is running: the header becomes fixed (class "js-ready")
// only once its scroll handler is installed, and the reveal-on-scroll class ("motion") is added by part 6 itself.
// Each part runs on its own (an error in one never stops the others), and MediaQueryList listeners fall back to
// addListener() for Safari ≤ 13.
(() => {
  "use strict";

  const root = document.documentElement;
  const part = (fn) => { try { fn(); } catch (err) { if (window.console) console.error(err); } };
  const onMq = (mq, fn) => (mq.addEventListener ? mq.addEventListener("change", fn) : mq.addListener(fn));
  const live = document.querySelector("[data-live-region]");
  const announce = (msg) => {
    if (!live) return;
    live.textContent = "";
    window.setTimeout(() => { live.textContent = msg; }, 60);
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const saveData = !!(navigator.connection && navigator.connection.saveData);

  /* 1. Header: transparent over dark heroes at the top; solid (black, or white on light pages) once
        scrolled; hides while scrolling down and comes back on scroll up (not when the visitor asks for
        reduced motion: then it simply stays). */
  part(() => {
    const header = document.querySelector("[data-site-header]");
    if (header) {
      let lastY = window.scrollY;
      let ticking = false;
      const update = () => {
        const y = window.scrollY;
        header.classList.toggle("is-solid", y > 24);
        if (!reduceMotion.matches && y > 360 && y > lastY + 4 && !root.classList.contains("menu-locked") && !header.contains(document.activeElement)) {
          header.classList.add("is-hidden");
        } else if (reduceMotion.matches || y < lastY - 4 || y <= 360) {
          header.classList.remove("is-hidden");
        }
        lastY = y;
        ticking = false;
      };
      window.addEventListener("scroll", () => {
        if (!ticking) { window.requestAnimationFrame(update); ticking = true; }
      }, { passive: true });
      header.addEventListener("focusin", () => header.classList.remove("is-hidden"));
      update();
      root.classList.add("js-ready"); // now the header may be fixed: is-solid keeps it readable over light pages
    }
  });

  /* 2. Menu: a modal dialog with focus trap; Esc closes. The dialog role, aria-modal and aria-expanded are set
        here only: without JavaScript the menu is a plain #menu:target panel (CSS hides the page behind it). */
  part(() => {
    const menu = document.querySelector("[data-menu]");
    const openers = document.querySelectorAll("[data-menu-open]");
    if (menu && openers.length) {
      menu.setAttribute("role", "dialog");
      menu.setAttribute("aria-modal", "true");
      if (menu.dataset.label) menu.setAttribute("aria-label", menu.dataset.label);
      let lastFocus = null;
      const focusables = () => [...menu.querySelectorAll("a[href], button:not([disabled])")].filter((el) => el.offsetParent !== null);
      const setExpanded = (v) => openers.forEach((b) => b.setAttribute("aria-expanded", String(v)));
      const open = () => {
        lastFocus = document.activeElement;
        menu.classList.add("is-open");
        root.classList.add("menu-locked");
        setExpanded(true);
        const f = focusables();
        if (f.length) f[Math.min(2, f.length - 1)].focus();
      };
      const close = (restore = true) => {
        menu.classList.remove("is-open");
        root.classList.remove("menu-locked");
        setExpanded(false);
        if (location.hash === "#menu") history.replaceState(null, "", location.pathname + location.search);
        if (restore && lastFocus) lastFocus.focus();
      };
      setExpanded(false);
      openers.forEach((b) => {
        b.setAttribute("role", "button");
        b.addEventListener("click", (e) => { e.preventDefault(); open(); });
        b.addEventListener("keydown", (e) => { if (e.key === " ") { e.preventDefault(); open(); } });
      });
      // The close control is a link (#top) without JavaScript; as role=button it must also work with Space.
      menu.querySelectorAll("[data-menu-close]").forEach((b) => {
        b.setAttribute("role", "button");
        b.addEventListener("click", (e) => { e.preventDefault(); close(); });
        b.addEventListener("keydown", (e) => { if (e.key === " ") { e.preventDefault(); close(); } });
      });
      menu.querySelectorAll(".menu__list a, .menu__cta, .lang a").forEach((a) => a.addEventListener("click", () => close(false)));
      menu.addEventListener("keydown", (e) => {
        if (e.key === "Escape") { close(); return; }
        if (e.key !== "Tab") return;
        const f = focusables();
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      });
      onMq(window.matchMedia("(min-width: 1000px)"), (e) => { if (e.matches && menu.classList.contains("is-open")) close(false); });
      if (location.hash === "#menu") history.replaceState(null, "", location.pathname + location.search);
    }
  });

  /* 3. Hero background video. No autoplay attribute: it starts here unless the visitor prefers reduced
        motion or has Save-Data on; it pauses off-screen and when the tab is hidden; the button
        (visible at every width) pauses and resumes it (WCAG 2.2.2). */
  part(() => {
    const video = document.querySelector("[data-hero-video]");
    const heroToggle = document.querySelector("[data-hero-toggle]");
    if (video) {
      let wantPlay = !reduceMotion.matches && !saveData;
      let visible = true;
      const render = () => {
        if (!heroToggle) return;
        heroToggle.classList.toggle("is-paused", !wantPlay);
        heroToggle.setAttribute("aria-label", wantPlay ? heroToggle.dataset.labelPause : heroToggle.dataset.labelPlay);
      };
      const sync = () => {
        const play = wantPlay && visible && !document.hidden;
        if (play && video.paused) {
          video.preload = "auto";
          const p = video.play();
          if (p && p.catch) p.catch(() => { wantPlay = false; render(); });
        } else if (!play && !video.paused) {
          video.pause();
        }
        render();
      };
      if (heroToggle) {
        heroToggle.hidden = false;
        heroToggle.addEventListener("click", () => { wantPlay = !wantPlay; sync(); });
      }
      if ("IntersectionObserver" in window) {
        new IntersectionObserver((entries) => { visible = entries[0].isIntersecting; sync(); }, { threshold: 0.05 }).observe(video);
      }
      document.addEventListener("visibilitychange", sync);
      onMq(reduceMotion, () => { wantPlay = !reduceMotion.matches && !saveData; sync(); });
      sync();
    }
  });

  /* 4. Film: a large play button over the poster that starts the native player (preload="none"). */
  part(() => {
    const film = document.querySelector("[data-film]");
    const filmBtn = document.querySelector("[data-film-play]");
    if (film && filmBtn) {
      filmBtn.hidden = false;
      film.removeAttribute("controls");
      film.setAttribute("tabindex", "-1");
      filmBtn.addEventListener("click", () => {
        filmBtn.hidden = true;
        film.setAttribute("controls", "");
        film.removeAttribute("tabindex");
        const p = film.play();
        if (p && p.catch) p.catch(() => {});
        film.focus();
      });
    }
  });

  /* 5. Copy to clipboard (bank details). The buttons are in the page from the start (no layout shift); CSS hides
        them only while <html> still has the no-js class. */
  part(() => {
    const copyText = (text) => {
      if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
      return new Promise((resolve, reject) => {
        const t = document.createElement("textarea");
        t.value = text;
        t.setAttribute("readonly", "");
        t.style.position = "fixed";
        t.style.opacity = "0";
        document.body.appendChild(t);
        t.select();
        try { if (document.execCommand("copy")) resolve(); else reject(new Error("copy failed")); } catch (err) { reject(err); }
        document.body.removeChild(t);
      });
    };
    const i18n = (() => {
      const el = document.querySelector("[data-copy-i18n]");
      return el ? el.dataset : {};
    })();
    document.querySelectorAll("[data-copy]").forEach((btn) => {
      const label = btn.querySelector("[data-copy-text]");
      const original = label ? label.textContent : "";
      btn.addEventListener("click", () => {
        const value = btn.dataset.copy;
        const name = btn.dataset.copyLabel || "";
        copyText(value).then(() => {
          btn.classList.add("is-done");
          if (label) label.textContent = i18n.copied || "✓";
          announce((i18n.copiedLive || "{label} ✓").replace("{label}", name));
          window.clearTimeout(btn._t);
          btn._t = window.setTimeout(() => { btn.classList.remove("is-done"); if (label) label.textContent = original; }, 2200);
        }, () => {
          const source = btn.parentElement.querySelector("[data-copy-source]");
          if (source) {
            const range = document.createRange();
            range.selectNodeContents(source);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
          }
          announce(i18n.failed || "");
        });
      });
  });
  });

  /* 6. Reveal on scroll (only with motion allowed; content is visible without JS). Blocks already on screen are
        marked shown first, so nothing visible ever disappears; then "motion" lets the others fade in on scroll. */
  part(() => {
    const reveals = document.querySelectorAll(".reveal");
    if (!reduceMotion.matches && "IntersectionObserver" in window) {
      const fold = window.innerHeight || document.documentElement.clientHeight;
      reveals.forEach((el) => { if (el.getBoundingClientRect().top < fold) el.classList.add("is-in"); });
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
      reveals.forEach((el) => { if (!el.classList.contains("is-in")) io.observe(el); });
      root.classList.add("motion");
    }
  });

  /* 7. Lightbox for galleries (links open the full image without JS). Moving to another photo is announced:
        the counter + the photo's description are a polite live region that also describes the dialog. */
  part(() => {
    const groups = document.querySelectorAll("[data-gallery]");
    if (groups.length && typeof HTMLDialogElement === "function") {
      const labels = groups[0].dataset;
      const dlg = document.createElement("dialog");
      dlg.className = "lightbox";
      dlg.setAttribute("aria-label", labels.labelDialog || "");
      dlg.setAttribute("aria-describedby", "lightbox-status");
      dlg.innerHTML =
        '<img alt="">' +
        '<div class="lightbox__bar"><span class="lightbox__caption" data-count aria-live="polite" id="lightbox-status"></span><div class="lightbox__nav">' +
        '<button type="button" data-prev><svg class="icon" aria-hidden="true"><use href="#i-arrow-left"/></svg></button>' +
        '<button type="button" data-next><svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg></button>' +
        '<button type="button" data-close><svg class="icon" aria-hidden="true"><use href="#i-close"/></svg></button>' +
        "</div></div>";
      dlg.querySelector("[data-prev]").setAttribute("aria-label", labels.labelPrev || "");
      dlg.querySelector("[data-next]").setAttribute("aria-label", labels.labelNext || "");
      dlg.querySelector("[data-close]").setAttribute("aria-label", labels.labelClose || "");
      document.body.appendChild(dlg);
      const img = dlg.querySelector("img");
      const count = dlg.querySelector("[data-count]");
      let items = [];
      let idx = 0;
      const show = (i) => {
        idx = (i + items.length) % items.length;
        const a = items[idx];
        const thumb = a.querySelector("img");
        img.src = a.getAttribute("href");
        img.alt = thumb ? thumb.alt : "";
        count.textContent = `${idx + 1} / ${items.length}${img.alt ? ` — ${img.alt}` : ""}`;
      };
      groups.forEach((g) => {
        const links = [...g.querySelectorAll("[data-lightbox]")];
        links.forEach((a, i) => a.addEventListener("click", (e) => {
          e.preventDefault();
          items = links;
          show(i);
          dlg.showModal();
        }));
      });
      dlg.querySelector("[data-prev]").addEventListener("click", () => show(idx - 1));
      dlg.querySelector("[data-next]").addEventListener("click", () => show(idx + 1));
      dlg.querySelector("[data-close]").addEventListener("click", () => dlg.close());
      dlg.addEventListener("click", (e) => { if (e.target === dlg) dlg.close(); });
      dlg.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft") show(idx - 1);
        if (e.key === "ArrowRight") show(idx + 1);
      });
    }
  });
})();
