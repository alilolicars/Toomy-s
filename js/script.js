document.addEventListener("DOMContentLoaded", () => {
    
  /* =========================================
     1. FULL-SCREEN MENU DRAWER + DIRECTION-AWARE ROWS
     ========================================= */
  const menuToggle = document.getElementById("menuToggle");
  const menuToggleText = menuToggle?.querySelector(".menu-toggle-text");
  const navOverlay = document.getElementById("navOverlay");
  const navCloseLinks = document.querySelectorAll(".nav-row-link, .nav-center-logo");
  const brandMini = document.querySelector(".brand-mini");
  let closeTimer = null;

  function setMenuState(isOpen) {
    if (!menuToggle || !navOverlay) return;

    clearTimeout(closeTimer);

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    navOverlay.setAttribute("aria-hidden", String(!isOpen));
    document.body.classList.toggle("is-menu-open", isOpen);

    if (isOpen) {
      navOverlay.classList.remove("is-closing");
      navOverlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
    } else {
      // Keep items sharp (.is-closing) while the entire overlay slides upward
      navOverlay.classList.add("is-closing");
      navOverlay.classList.remove("is-open");
      document.body.style.overflow = "";

      // Once upward curtain slide finishes (650ms), reset .is-closing so next open blurs & cascades
      closeTimer = setTimeout(() => {
        navOverlay.classList.remove("is-closing");
      }, 650);
    }

    if (menuToggleText) {
      menuToggleText.textContent = isOpen ? "CLOSE" : "MENU";
    }
  }

  menuToggle?.addEventListener("click", () => {
    const currentlyOpen = menuToggle.getAttribute("aria-expanded") === "true";
    setMenuState(!currentlyOpen);
  });

  navCloseLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  brandMini?.addEventListener("click", (e) => {
    setMenuState(false);
    const homeEl = document.getElementById("home");
    if (homeEl) {
      e.preventDefault();
      homeEl.scrollIntoView({ behavior: "smooth" });
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navOverlay?.classList.contains("is-open")) {
      setMenuState(false);
    }
  });

  // --- Direction-Aware Row Hover Curtain ---
  const navRows = document.querySelectorAll(".nav-row");

  navRows.forEach((row) => {
    const curtain = row.querySelector(".nav-row-curtain");
    if (!curtain) return;

    row.addEventListener("mouseenter", (e) => {
      const rect = row.getBoundingClientRect();
      const enteredFromTop = e.clientY - rect.top < rect.height / 2;
      curtain.style.transformOrigin = enteredFromTop ? "top center" : "bottom center";
      row.classList.add("is-hovered");
    });

    row.addEventListener("mouseleave", (e) => {
      const rect = row.getBoundingClientRect();
      const exitedTowardTop = e.clientY - rect.top < rect.height / 2;
      curtain.style.transformOrigin = exitedTowardTop ? "top center" : "bottom center";
      row.classList.remove("is-hovered");
    });
  });

  // --- Language Switcher (AR | EN) Active State ---
  const langBtns = document.querySelectorAll(".lang-btn");
  langBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      langBtns.forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
    });
  });

    /* =========================================
     2. HERO INFINITE CATEGORY MARQUEE (GPU-SMOOTH)
     ========================================= */
  const categoryTrack = document.getElementById("categoryTrack");

  if (categoryTrack) {
    const originalItems = Array.from(categoryTrack.children);
    const originalCount = originalItems.length;

    if (originalCount > 0) {
      const belt = document.createElement("div");
      belt.className = "category-belt";

      // Clone 3 seamless sets so the belt never runs out of runway on wide viewports
      for (let copy = 0; copy < 3; copy++) {
        originalItems.forEach((item) => {
          const node = copy === 0 ? item : item.cloneNode(true);
          if (copy > 0) {
            node.setAttribute("aria-hidden", "true");
          }
          belt.appendChild(node);
        });
      }

      categoryTrack.innerHTML = "";
      categoryTrack.appendChild(belt);

      let setWidth = 0;
      let offset = 0;
      let isDragging = false;
      let dragStartX = 0;
      let dragStartOffset = 0;
      let lastTime = performance.now();
      const speedPxPerSec = 58;

      function measureSetWidth() {
        const firstSetStart = belt.children[0];
        const secondSetStart = belt.children[originalCount];
        if (firstSetStart && secondSetStart) {
          const measured = secondSetStart.offsetLeft - firstSetStart.offsetLeft;
          if (measured > 0) {
            setWidth = measured;
            offset = ((offset % setWidth) + setWidth) % setWidth;
          }
        }
      }

      measureSetWidth();
      window.addEventListener("load", measureSetWidth);
      window.addEventListener("resize", measureSetWidth, { passive: true });

      if ("ResizeObserver" in window) {
        const ro = new ResizeObserver(measureSetWidth);
        ro.observe(belt);
      }

      // Mouse grab-to-drag
      categoryTrack.addEventListener("mousedown", (e) => {
        isDragging = true;
        categoryTrack.classList.add("is-dragging");
        dragStartX = e.clientX;
        dragStartOffset = offset;
      });

      window.addEventListener("mousemove", (e) => {
        if (!isDragging || !setWidth) return;
        const deltaX = e.clientX - dragStartX;
        offset = (((dragStartOffset - deltaX) % setWidth) + setWidth) % setWidth;
      });

      window.addEventListener("mouseup", () => {
        if (!isDragging) return;
        isDragging = false;
        categoryTrack.classList.remove("is-dragging");
        lastTime = performance.now();
      });

      // Mouse wheel horizontal scrubbing
      categoryTrack.addEventListener(
        "wheel",
        (e) => {
          if (!setWidth) return;
          const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
          if (delta !== 0) {
            e.preventDefault();
            offset = (((offset + delta * 0.6) % setWidth) + setWidth) % setWidth;
          }
        },
        { passive: false }
      );

      function animateMarquee(now) {
        const dt = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;

        if (!isDragging && setWidth > 0) {
          offset += speedPxPerSec * dt;
          if (offset >= setWidth) {
            offset -= setWidth;
          }
        }

        belt.style.transform = `translate3d(${-offset}px, 0, 0)`;
        requestAnimationFrame(animateMarquee);
      }

      requestAnimationFrame(animateMarquee);
    }
  }
  /* =========================================
     3. MENU STARS: GRAB-AND-DRAG CARD SLIDER
     ========================================= */
  const starsTrack = document.getElementById("menuStarsTrack");

  if (starsTrack) {
    let isDraggingStars = false;
    let startXStars = 0;
    let startScrollLeftStars = 0;
    let movedDistance = 0;

    starsTrack.addEventListener("mousedown", (e) => {
      // Allow normal clicking on the "+ Add" button without starting a drag
      if (e.target.closest(".star-add-btn")) return;

      isDraggingStars = true;
      movedDistance = 0;
      starsTrack.classList.add("is-dragging");
      startXStars = e.pageX - starsTrack.offsetLeft;
      startScrollLeftStars = starsTrack.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      if (!isDraggingStars) return;
      isDraggingStars = false;
      starsTrack.classList.remove("is-dragging");
    });

    starsTrack.addEventListener("mousemove", (e) => {
      if (!isDraggingStars) return;
      e.preventDefault();
      const x = e.pageX - starsTrack.offsetLeft;
      const walk = (x - startXStars) * 1.35;
      movedDistance = Math.abs(walk);
      starsTrack.scrollLeft = startScrollLeftStars - walk;
    });

    // Optional quick feedback when clicking "+ Add"
    starsTrack.querySelectorAll(".star-add-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        if (movedDistance > 6) return;
        const originalText = btn.textContent;
        btn.textContent = "Added ✓";
        setTimeout(() => {
          btn.textContent = originalText;
        }, 900);
      });
    });
  }

  /* =========================================
     4. HEADER CONTRAST ON LIGHT SECTIONS
     ========================================= */
  const menuStarsSection = document.getElementById("menu");

  function updateHeaderContrast() {
    if (!menuStarsSection) return;
    const rect = menuStarsSection.getBoundingClientRect();
    // Flip header button to dark when the cream section reaches the top navbar (~60px)
    const isOverLight = rect.top <= 60 && rect.bottom >= 60;
    document.body.classList.toggle("is-scrolled-light", isOverLight);
  }

  const footerSection = document.getElementById("contact");

  function updateHeaderContrast() {
    if (menuStarsSection) {
      const rect = menuStarsSection.getBoundingClientRect();
      const isOverLight = rect.top <= 60 && rect.bottom >= 60;
      document.body.classList.toggle("is-scrolled-light", isOverLight);
    }
    if (footerSection) {
      const footerRect = footerSection.getBoundingClientRect();
      document.body.classList.toggle("is-over-footer", footerRect.top <= 80);
    }
  }

  window.addEventListener("scroll", updateHeaderContrast, { passive: true });
  updateHeaderContrast();

  /* =========================================
     5. FOOTER: DYNAMIC YEAR, BURGER REVEAL & MENU ROUTING
     ========================================= */
  // 1. Dynamic Year
  const footerYear = document.getElementById("footerYear");
  if (footerYear) {
    footerYear.textContent = String(new Date().getFullYear());
  }

  // 2. Scroll-Reveal / Parallax on the Bottom Burger Graphic
  const footerBurger = document.getElementById("footerBurger");
  if (footerBurger && "IntersectionObserver" in window) {
    const burgerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          footerBurger.classList.toggle("is-revealed", entry.isIntersecting);
        });
      },
      { threshold: 0.15 }
    );
    burgerObserver.observe(footerBurger);
  } else if (footerBurger) {
    footerBurger.classList.add("is-revealed");
  }

  // 3. Smooth Scroll & Card Center/Highlight when clicking Footer "OUR MENU" Links
  const footerCategoryLinks = document.querySelectorAll("[data-filter-category]");
  const categoryKeywordMap = {
    burger: "burger",
    pizza: "pizza",
    tenders: "tenders",
    sides: "roll", // Scrolls to Hot Dog Crispy Roll / Basmati side items
  };

  footerCategoryLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      const cat = link.getAttribute("data-filter-category");
      const menuSection = document.getElementById("menu");
      const trackEl = document.getElementById("menuStarsTrack");
      if (!menuSection || !trackEl || !cat) return;

      e.preventDefault();
      menuSection.scrollIntoView({ behavior: "smooth" });

      const keyword = categoryKeywordMap[cat] || cat;
      const cards = Array.from(trackEl.querySelectorAll(".star-card"));
      const targetCard = cards.find((card) =>
        card.querySelector(".star-title")?.textContent.toLowerCase().includes(keyword)
      );

      if (targetCard) {
        setTimeout(() => {
          const scrollTarget =
            targetCard.offsetLeft -
            trackEl.offsetLeft -
            (trackEl.clientWidth - targetCard.clientWidth) / 2;

          trackEl.scrollTo({
            left: Math.max(0, scrollTarget),
            behavior: "smooth",
          });

          cards.forEach((c) => c.classList.remove("is-highlighted"));
          targetCard.classList.add("is-highlighted");
          setTimeout(() => targetCard.classList.remove("is-highlighted"), 1400);
        }, 450);
      }
    });
  });
});