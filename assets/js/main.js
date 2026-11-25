/* ==========================================================================
   Jiatian Cao — Academic Homepage Interactions
   ========================================================================== */

(function () {
  "use strict";

  const root = document.documentElement;
  const themeBtn = document.getElementById("theme-toggle");
  const toastEl = document.getElementById("copy-toast");
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add("visible");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove("visible");
    }, 2200);
  }

  /* 1. Color Theme Toggle (persists user preference) */
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const isDark = root.getAttribute("data-theme") === "dark";
      const nextTheme = isDark ? "light" : "dark";
      if (nextTheme === "dark") {
        root.setAttribute("data-theme", "dark");
      } else {
        root.removeAttribute("data-theme");
      }
      try {
        localStorage.setItem("jc-theme", nextTheme);
      } catch (_) {}
    });
  }

  /* 2. Publication Category Filtering */
  const filterButtons = document.querySelectorAll("[data-filter]");
  const pubItems = document.querySelectorAll(".pub-item");

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.getAttribute("data-filter");
      filterButtons.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("active", active);
        b.setAttribute("aria-pressed", String(active));
      });

      pubItems.forEach((item) => {
        const tags = (item.getAttribute("data-tags") || "").split(/\s+/);
        const match = filter === "all" || tags.includes(filter);
        item.hidden = !match;
      });
    });
  });

  /* 3. Publication Drawers (Highlights / Abstract / BibTeX) */
  document.querySelectorAll("[data-drawer-target]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-drawer-target");
      const targetDrawer = document.getElementById(targetId);
      if (!targetDrawer) return;

      const parentItem = btn.closest(".pub-item");
      const isCurrentlyOpen = !targetDrawer.hidden;

      if (parentItem) {
        parentItem.querySelectorAll(".pub-drawer").forEach((d) => {
          d.hidden = true;
        });
        parentItem.querySelectorAll("[data-drawer-target]").forEach((b) => {
          b.setAttribute("aria-expanded", "false");
        });
      }

      if (!isCurrentlyOpen) {
        targetDrawer.hidden = false;
        btn.setAttribute("aria-expanded", "true");
      }
    });
  });

  /* 4. Clipboard Helpers (Email & BibTeX) */
  function copyText(text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(
        () => showToast(successMsg),
        () => fallbackCopy(text, successMsg)
      );
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast(successMsg);
    } catch (_) {}
    document.body.removeChild(ta);
  }

  document.querySelectorAll("[data-copy-email]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const email = btn.getAttribute("data-copy-email");
      if (email) copyText(email, "Email copied: " + email);
    });
  });

  document.querySelectorAll("[data-copy-bib]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preId = btn.getAttribute("data-copy-bib");
      const pre = document.getElementById(preId);
      if (pre) copyText(pre.textContent.trim(), "BibTeX copied to clipboard");
    });
  });

  /* 5. Active Navigation Highlight on Scroll */
  const sections = document.querySelectorAll("main section[id]");
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  if ("IntersectionObserver" in window && sections.length && navAnchors.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navAnchors.forEach((a) => {
              a.classList.toggle("active", a.getAttribute("href") === "#" + id);
            });
          }
        });
      },
      { rootMargin: "-20% 0px -68% 0px", threshold: 0 }
    );
    sections.forEach((sec) => observer.observe(sec));
  }
})();
