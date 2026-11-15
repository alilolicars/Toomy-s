document.addEventListener("DOMContentLoaded", () => {
    /* =========================================
     0. INTRO SPLASH CURTAIN SEQUENCE
     ========================================= */
  const introCurtain = document.getElementById("introCurtain");

  if (introCurtain) {
    // 1. Wait 1.05s while the logo pops onto the red screen, then slide red left
    setTimeout(() => {
      introCurtain.classList.add("is-sliding");
    }, 1050);

    // 2. Midway through the slide (1.45s), reveal slogan, button, header & carousel
    setTimeout(() => {
      document.body.classList.remove("is-intro-active");
    }, 1450);

    // 3. Remove curtain from DOM after slide finishes so it never blocks clicks
    introCurtain.addEventListener(
      "transitionend",
      () => {
        introCurtain.remove();
      },
      { once: true }
    );
  }
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
     2. CATEGORY CAROUSEL: SEAMLESS LOOP & DRAG
     ========================================= */
  const track = document.getElementById("categoryTrack");

  if (track) {
    // Clone cards once so the strip loops endlessly even on wide screens
    const originalCards = Array.from(track.children);
    originalCards.forEach((card) => {
      const clone = card.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    });

    let isDown = false;
    let hasDragged = false;
    let isPaused = false;
    let startX = 0;
    let scrollLeft = 0;
    let exactScroll = 0;
    const speed = 1; // Whole pixel step prevents sub-pixel rounding freeze on Windows

    function animateMarquee() {
      if (!isPaused && !isDown) {
        exactScroll += speed;
        if (exactScroll >= track.scrollWidth / 2) {
          exactScroll = 0;
        }
        track.scrollLeft = exactScroll;
      } else {
        exactScroll = track.scrollLeft;
      }
      requestAnimationFrame(animateMarquee);
    }

    requestAnimationFrame(animateMarquee);

    // Desktop click-and-drag scrolling
    track.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isDown = true;
      hasDragged = false;
      track.classList.add("is-dragging");
      startX = e.pageX - track.offsetLeft;
      scrollLeft = track.scrollLeft;
    });

    window.addEventListener("mouseup", () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove("is-dragging");
    });

    track.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX) * 1.4;
      if (Math.abs(walk) > 6) {
        hasDragged = true;
      }
      track.scrollLeft = scrollLeft - walk;
    });

    // Prevent link click if user was dragging
    track.querySelectorAll(".category-card").forEach((card) => {
      card.addEventListener("dragstart", (e) => e.preventDefault());
      card.addEventListener("click", (e) => {
        if (hasDragged) {
          e.preventDefault();
          return;
        }
        const chosenCategory = card.dataset.category || "all";
        sessionStorage.setItem("toomys_selected_category", chosenCategory);
      });
    });

    // Vertical mouse wheel -> horizontal glide
    track.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          track.scrollLeft += e.deltaY;
        }
      },
      { passive: false }
    );

    // Pause on hover or touch
    track.addEventListener("mouseenter", () => (isPaused = true));
    track.addEventListener("mouseleave", () => (isPaused = false));
    track.addEventListener("touchstart", () => (isPaused = true), { passive: true });
    track.addEventListener("touchend", () => (isPaused = false));
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

  window.addEventListener("scroll", updateHeaderContrast, { passive: true });
  updateHeaderContrast();
});