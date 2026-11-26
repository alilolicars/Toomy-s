document.addEventListener("DOMContentLoaded", () => {
  const IS_AR = Boolean(window.TOOMYS_I18N && window.TOOMYS_I18N.isAr);
  const CURRENCY_LABEL = IS_AR ? "جنيه" : "EGP";
  const formatPrice = (amount) => `${Number(amount).toLocaleString("en-US")} ${CURRENCY_LABEL}`;
  const t = (en, ar) => (IS_AR ? ar : en);

  /* =========================================
     1. FLOATING PILL NAVBAR & MOBILE TAKEOVER CONTROLLER
     ========================================= */
  const navbar = document.querySelector(".floating-navbar");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileTakeover = document.getElementById("mobileTakeover");
  const mobileNavLinks = document.querySelectorAll(".mobile-takeover-link");
  const stickyFilterWrap = document.getElementById("menuFilterWrap");

  let isMobileMenuOpen = false;
  let lastScrollY = window.scrollY;

  function setMobileMenuState(isOpen) {
    isMobileMenuOpen = isOpen;
    if (mobileMenuBtn) {
      mobileMenuBtn.setAttribute("aria-expanded", String(isOpen));
      mobileMenuBtn.classList.toggle("is-active", isOpen);
    }
    if (mobileTakeover) {
      mobileTakeover.setAttribute("aria-hidden", String(!isOpen));
      mobileTakeover.classList.toggle("is-open", isOpen);
    }
    document.body.classList.toggle("is-mobile-menu-open", isOpen);
    document.body.style.overflow = isOpen ? "hidden" : "";

    // Keep floating navbar visible while mobile takeover is active
    if (isOpen && navbar) {
      navbar.classList.remove("is-hidden");
      if (stickyFilterWrap) stickyFilterWrap.classList.remove("is-top-pinned");
    }
  }

  // Hamburger button toggle
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      setMobileMenuState(!isMobileMenuOpen);
    });
  }

  // Close takeover when a link is clicked
  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      setMobileMenuState(false);
    });
  });

  // Close takeover on Escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMobileMenuOpen) {
      setMobileMenuState(false);
    }
  });

  // Smart Scroll-Hide / Reveal Animation
  // - Scroll Down (> 60px): Smoothly slide navbar upward out of view
  // - Scroll Up: Immediately glide navbar back down into view
  function handleNavbarScroll() {
    if (!navbar || isMobileMenuOpen) return;

    const currentY = window.scrollY;
    const delta = currentY - lastScrollY;

    if (currentY <= 60) {
      // Near top of page: always reveal navbar
      navbar.classList.remove("is-hidden");
      if (stickyFilterWrap) stickyFilterWrap.classList.remove("is-top-pinned");
    } else if (delta > 5 && currentY > 60) {
      // Scrolling down past 60px: slide navbar upward
      navbar.classList.add("is-hidden");
      if (stickyFilterWrap) stickyFilterWrap.classList.add("is-top-pinned");
    } else if (delta < -5) {
      // Scrolling up: immediately glide navbar back down into view
      navbar.classList.remove("is-hidden");
      if (stickyFilterWrap) stickyFilterWrap.classList.remove("is-top-pinned");
    }

    // Toggle stuck elevation shadow on sticky category pill (menu.html)
    if (stickyFilterWrap) {
      const wrapTop = stickyFilterWrap.getBoundingClientRect().top;
      stickyFilterWrap.classList.toggle("is-stuck", wrapTop <= 94);
    }

    lastScrollY = Math.max(0, currentY);
  }

  window.addEventListener("scroll", handleNavbarScroll, { passive: true });
  handleNavbarScroll();

  // Automatic Active Page Link Highlighting across website
  const rawPath = window.location.pathname.split("/").pop().toLowerCase();
  let activePageKey = "home";

  if (rawPath.includes("menu") || rawPath.includes("product")) {
    activePageKey = "menu";
  } else if (rawPath.includes("about")) {
    activePageKey = "about";
  } else if (rawPath.includes("newsletter")) {
    activePageKey = "contact";
  } else if (rawPath.includes("checkout") || rawPath.includes("order-confirmation")) {
    activePageKey = "none";
  } else if (!rawPath || rawPath === "index.html" || rawPath === "") {
    activePageKey = "home";
  }

  document.querySelectorAll(".floating-navbar .nav-link, .mobile-takeover .mobile-takeover-link").forEach((link) => {
    const pageAttr = link.getAttribute("data-page");
    if (pageAttr && pageAttr === activePageKey) {
      link.classList.add("is-active");
      link.setAttribute("aria-current", "page");
    } else if (pageAttr) {
      link.classList.remove("is-active");
      link.removeAttribute("aria-current");
    }
  });

  // Smooth scroll to top when clicking Home link or Logo on home page
  const homeTriggers = document.querySelectorAll('.nav-brand, .floating-navbar .nav-link[data-page="home"], .mobile-takeover-link[data-page="home"]');
  homeTriggers.forEach((trigger) => {
    trigger.addEventListener("click", (e) => {
      const isHome = !rawPath || rawPath === "index.html" || rawPath === "";
      if (isHome) {
        e.preventDefault();
        setMobileMenuState(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
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
  let starsMovedDistance = 0;

  if (starsTrack) {
    let isDraggingStars = false;
    let startXStars = 0;
    let startScrollLeftStars = 0;

    starsTrack.addEventListener("mousedown", (e) => {
      // Allow normal clicking on the "+ Add" button without starting a drag
      if (e.target.closest(".star-add-btn")) {
        starsMovedDistance = 0;
        return;
      }

      isDraggingStars = true;
      starsMovedDistance = 0;
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
      starsMovedDistance = Math.max(starsMovedDistance, Math.abs(walk));
      starsTrack.scrollLeft = startScrollLeftStars - walk;
    });
  }

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

  /* =========================================
     CART DRAWER & CARD STEPPER STATE MACHINE
     ========================================= */
  if (!window.__toomysCartInitialized) {
    window.__toomysCartInitialized = true;

    const CART_STORAGE_KEY = "toomys_cart_v1";
    const DELIVERY_FEE_EGP = 25;
    const cartToggleBtn = document.getElementById("cartToggle");
    const cartCountBadge = document.getElementById("cartCountBadge");

    let cartBackdrop = document.getElementById("cartBackdrop");
    let cartDrawer = document.getElementById("cartDrawer");

    if (!cartBackdrop) {
      cartBackdrop = document.createElement("div");
      cartBackdrop.id = "cartBackdrop";
      cartBackdrop.className = "cart-backdrop";
      document.body.appendChild(cartBackdrop);
    }

    if (!cartDrawer) {
      cartDrawer = document.createElement("aside");
      cartDrawer.id = "cartDrawer";
      cartDrawer.className = "cart-drawer";
      cartDrawer.setAttribute("role", "dialog");
      cartDrawer.setAttribute("aria-modal", "true");
      cartDrawer.setAttribute("aria-labelledby", "cartDrawerTitle");
      cartDrawer.innerHTML = `
        <div class="cart-drawer-header">
          <h2 class="cart-drawer-title" id="cartDrawerTitle">${t("Your Order", "الأوردر بتاعك")}</h2>
          <button type="button" class="cart-close-btn" id="cartCloseBtn" aria-label="${t("Close Cart", "اقفل الأوردر")}">&#10005;</button>
        </div>
        <div class="cart-drawer-body" id="cartDrawerBody"></div>
        <div class="cart-drawer-footer" id="cartDrawerFooter" style="display: none;">
          <div class="cart-summary-rows">
            <div class="cart-summary-line">
              <span>${t("Subtotal", "المجموع")}</span>
              <span id="cartSubtotalValue">${formatPrice(0)}</span>
            </div>
            <div class="cart-summary-line">
              <span>${t("Asyut Delivery", "توصيل داخل أسيوط")}</span>
              <span>${formatPrice(DELIVERY_FEE_EGP)}</span>
            </div>
          </div>
          <div class="cart-total-row">
            <span class="cart-total-label">${t("Total", "الإجمالي")}</span>
            <span class="cart-total-value" id="cartTotalValue">${formatPrice(0)}</span>
          </div>
          <button type="button" class="cart-checkout-btn" id="cartCheckoutBtn">${t("Place Order", "كمّل الأوردر")}</button>
        </div>
      `;
      document.body.appendChild(cartDrawer);
    }

    const cartCloseBtn = document.getElementById("cartCloseBtn");
    const cartDrawerBody = document.getElementById("cartDrawerBody");
    const cartDrawerFooter = document.getElementById("cartDrawerFooter");
    const cartSubtotalValue = document.getElementById("cartSubtotalValue");
    const cartTotalValue = document.getElementById("cartTotalValue");
    const cartCheckoutBtn = document.getElementById("cartCheckoutBtn");

    function loadCart() {
      try {
        const saved = JSON.parse(localStorage.getItem(CART_STORAGE_KEY));
        return Array.isArray(saved) ? saved : [];
      } catch {
        return [];
      }
    }

    function saveCart(items) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Ignore storage quota errors
      }
      window.dispatchEvent(new CustomEvent("toomys:cart-sync"));
    }

    let cartItems = loadCart();

    function formatEGP(amount) {
      return formatPrice(amount);
    }

    function triggerPop(el, className = "is-popped") {
      if (!el) return;
      el.classList.remove(className);
      void el.offsetWidth;
      el.classList.add(className);
    }

    // Menu Stars "+ Add" buttons remain clean static triggers that open Quick View (#qvOverlay)
    function initMenuCardButtons() {
      // No inline stepper injection on .star-add-btn; Quick View handles option customization
    }

    function syncMenuCardButtons() {
      // Keep both Home (.star-card) and Menu (.menu-card) "+ Add" buttons open for Quick View option selection
    }

    function updateBadge(shouldBump = false) {
      const totalCount = cartItems.reduce((sum, item) => sum + item.qty, 0);
      if (!cartCountBadge) return;

      cartCountBadge.textContent = totalCount;

      if (totalCount === 0) {
        cartCountBadge.classList.remove("is-bumped", "has-items");
        if (cartToggleBtn) cartToggleBtn.classList.remove("has-items", "is-pulsing");
        return;
      }

      cartCountBadge.classList.add("has-items");
      if (cartToggleBtn) cartToggleBtn.classList.add("has-items");

      if (shouldBump) {
        cartCountBadge.classList.remove("is-bumped");
        void cartCountBadge.offsetWidth;
        cartCountBadge.classList.add("is-bumped");
        clearTimeout(cartCountBadge._bumpTimer);
        cartCountBadge._bumpTimer = setTimeout(() => {
          cartCountBadge.classList.remove("is-bumped");
        }, 320);

        triggerPop(cartToggleBtn, "is-pulsing");
      }
    }

    function updateTotals(shouldPop = false) {
      const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
      if (cartSubtotalValue) cartSubtotalValue.textContent = formatEGP(subtotal);
      if (cartTotalValue) {
        cartTotalValue.textContent = formatEGP(subtotal + DELIVERY_FEE_EGP);
        if (shouldPop) triggerPop(cartTotalValue, "is-popped");
      }
    }

    function openCartDrawer() {
      // Reload latest items from localStorage before opening (syncs PDP & Quick View additions)
      cartItems = loadCart();
      renderCart(false);

      cartDrawer.classList.remove("is-animating-items");
      void cartDrawer.offsetWidth;
      cartDrawer.classList.add("is-open", "is-animating-items");

      cartBackdrop.classList.add("is-open");
      if (cartToggleBtn) cartToggleBtn.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";

      clearTimeout(cartDrawer._animTimer);
      cartDrawer._animTimer = setTimeout(() => {
        cartDrawer.classList.remove("is-animating-items");
      }, 900);
    }

    // Keep drawer in sync when external views (product.html / Quick View) write to localStorage
    window.addEventListener("toomys:cart-sync", () => {
      const latest = loadCart();
      if (JSON.stringify(latest) !== JSON.stringify(cartItems)) {
        cartItems = latest;
        renderCart(false);
        syncMenuCardButtons();
      }
    });

    function closeCartDrawer() {
      cartDrawer.classList.remove("is-open", "is-animating-items");
      cartBackdrop.classList.remove("is-open");
      if (cartToggleBtn) cartToggleBtn.setAttribute("aria-expanded", "false");
      if (!document.body.classList.contains("is-mobile-menu-open")) {
        document.body.style.overflow = "";
      }
    }

    function goToMenu() {
      closeCartDrawer();
      const localMenu = document.getElementById("menu");
      if (localMenu) {
        localMenu.scrollIntoView({ behavior: "smooth" });
      } else {
        window.location.href = "menu.html";
      }
    }

    function renderCart(orderPlaced = false) {
      updateBadge(false);

      if (orderPlaced) {
        const orderNum = Math.floor(100 + Math.random() * 900);
        cartDrawerFooter.style.display = "none";
        cartDrawerFooter.classList.remove("is-hiding");
        cartDrawerBody.innerHTML = `
          <div class="cart-empty-state">
            <div class="cart-success-badge" aria-hidden="true">&#10003;</div>
            <h3 class="cart-empty-heading">${t("Order received!", "الأوردر وصلنا!")}</h3>
            <p class="cart-empty-subtext">${t("We're firing up the grill in Asyut. Your order will be hot and ready soon.", "بنولّع الجريل في أسيوط حالًا. أوردرك هيوصلك سخن ومقرمش قريب أوي.")}</p>
            <span class="cart-order-ref">${t("Order", "أوردر")} #TM-${orderNum}</span>
            <button type="button" class="cart-empty-cta" id="cartBackToMenuBtn">
              <span>${t("Back to Menu", "ارجع للمنيو")}</span>
              <span class="cart-cta-arrow" aria-hidden="true">&#8594;</span>
            </button>
          </div>
        `;
        const backBtn = document.getElementById("cartBackToMenuBtn");
        if (backBtn) backBtn.addEventListener("click", goToMenu);
        return;
      }

      if (cartItems.length === 0) {
        cartDrawerFooter.style.display = "none";
        cartDrawerFooter.classList.remove("is-hiding");
        cartDrawerBody.innerHTML = `
          <div class="cart-empty-state">
            <img
              src="assets/logo-main.webp"
              alt="${t("Toomy's", "توميز")}"
              class="cart-empty-logo"
              draggable="false"
            />
            <h3 class="cart-empty-heading">${t("Nothing yet, let's order", "لسه مفيش حاجة، يلا نطلب!")}</h3>
            <p class="cart-empty-subtext">${t("Your tray is empty—pick something delicious from our menu.", "الصينية فاضية — اختارلك حاجة حلوة من المنيو.")}</p>
            <button type="button" class="cart-empty-cta" id="cartBackToMenuBtn">
              <span>${t("Back to Menu", "ارجع للمنيو")}</span>
              <span class="cart-cta-arrow" aria-hidden="true">&#8594;</span>
            </button>
          </div>
        `;
        const backBtn = document.getElementById("cartBackToMenuBtn");
        if (backBtn) backBtn.addEventListener("click", goToMenu);
        return;
      }

      updateTotals(false);
      cartDrawerFooter.classList.remove("is-hiding");
      cartDrawerFooter.style.display = "block";

      cartDrawerBody.innerHTML = `
        <ul class="cart-items-list">
          ${cartItems
            .map(
              (item, index) => `
            <li class="cart-item" data-index="${index}" style="--item-index: ${index};">
              <div class="cart-item-inner">
                <div class="cart-item-thumb">
                  <img src="${item.image}" alt="${item.title}" />
                </div>
                <div class="cart-item-info">
                  <h4 class="cart-item-title">${item.title}</h4>
                  <p class="cart-item-sub">${item.sub}</p>
                  <div class="cart-item-controls">
                    <div class="cart-qty-stepper">
                      <button type="button" class="cart-qty-btn" data-action="dec" data-index="${index}" aria-label="${t("Decrease quantity", "قلّل الكمية")}">&minus;</button>
                      <span class="cart-qty-val">${item.qty}</span>
                      <button type="button" class="cart-qty-btn" data-action="inc" data-index="${index}" aria-label="${t("Increase quantity", "زوّد الكمية")}">+</button>
                    </div>
                    <button type="button" class="cart-remove-btn" data-action="remove" data-index="${index}">${t("Remove", "شيل")}</button>
                  </div>
                </div>
                <div class="cart-item-price">${formatEGP(item.price * item.qty)}</div>
              </div>
            </li>
          `
            )
            .join("")}
        </ul>
      `;
    }

    function animateAndRemoveRow(rowEl, index) {
      if (!rowEl || rowEl.classList.contains("is-removing")) return;

      const removedTitle = cartItems[index]?.title || null;
      cartItems.splice(index, 1);
      saveCart(cartItems);
      updateBadge(true);
      syncMenuCardButtons(removedTitle);

      const isLastItem = cartItems.length === 0;
      if (isLastItem) {
        cartDrawerFooter.classList.add("is-hiding");
      } else {
        updateTotals(true);
      }

      // Trigger slide-right + fade-out followed by smooth row collapse
      rowEl.classList.add("is-removing");

      setTimeout(() => {
        if (isLastItem) {
          renderCart(false);
        } else {
          rowEl.remove();
          cartDrawerBody.querySelectorAll(".cart-item").forEach((li, newIdx) => {
            li.dataset.index = newIdx;
            li.style.setProperty("--item-index", newIdx);
            li.querySelectorAll("[data-index]").forEach((btn) => {
              btn.dataset.index = newIdx;
            });
          });
        }
      }, 400);
    }

    // Drawer open/close listeners
    if (cartToggleBtn) {
      cartToggleBtn.addEventListener("click", () => {
        if (typeof setMobileMenuState === "function") {
          setMobileMenuState(false);
        }
        openCartDrawer();
      });
    }

    // Sync cart across browser tabs / windows in real time
    window.addEventListener("storage", (e) => {
      if (e.key === CART_STORAGE_KEY) {
        cartItems = loadCart();
        renderCart(false);
        syncMenuCardButtons();
      }
    });
    if (cartCloseBtn) cartCloseBtn.addEventListener("click", closeCartDrawer);
    cartBackdrop.addEventListener("click", closeCartDrawer);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && cartDrawer.classList.contains("is-open")) {
        closeCartDrawer();
      }
    });

    // Cart Drawer quantity stepper & row deletion
    cartDrawerBody.addEventListener("click", (e) => {
      const actionBtn = e.target.closest("[data-action]");
      if (!actionBtn) return;

      const rowEl = actionBtn.closest(".cart-item");
      const index = Number(actionBtn.dataset.index);
      const action = actionBtn.dataset.action;
      if (Number.isNaN(index) || !cartItems[index]) return;

      const itemTitle = cartItems[index].title;

      if (action === "inc") {
        cartItems[index].qty += 1;
        saveCart(cartItems);
        const qtyEl = rowEl.querySelector(".cart-qty-val");
        const priceEl = rowEl.querySelector(".cart-item-price");
        if (qtyEl) {
          qtyEl.textContent = cartItems[index].qty;
          triggerPop(qtyEl, "is-popped");
        }
        if (priceEl) {
          priceEl.textContent = formatEGP(cartItems[index].price * cartItems[index].qty);
        }
        updateTotals(true);
        updateBadge(true);
        syncMenuCardButtons(itemTitle);
        return;
      }

      if (action === "dec") {
        if (cartItems[index].qty > 1) {
          cartItems[index].qty -= 1;
          saveCart(cartItems);
          const qtyEl = rowEl.querySelector(".cart-qty-val");
          const priceEl = rowEl.querySelector(".cart-item-price");
          if (qtyEl) {
            qtyEl.textContent = cartItems[index].qty;
            triggerPop(qtyEl, "is-popped");
          }
          if (priceEl) {
            priceEl.textContent = formatEGP(cartItems[index].price * cartItems[index].qty);
          }
          updateTotals(true);
          updateBadge(true);
          syncMenuCardButtons(itemTitle);
        } else {
          animateAndRemoveRow(rowEl, index);
        }
        return;
      }

      if (action === "remove") {
        animateAndRemoveRow(rowEl, index);
      }
    });

    // Place Order button in Cart Drawer -> navigate to Checkout page
    if (cartCheckoutBtn) {
      cartCheckoutBtn.addEventListener("click", () => {
        if (cartItems.length === 0) return;
        closeCartDrawer();
        window.location.href = "checkout.html";
      });
    }

    const STAR_TITLE_TO_ITEM_ID = {
      "toomy burger": "toomy-burger",
      "chicken popcorn pizza": "popcorn-chicken-pizza",
      "popcorn chicken pizza": "popcorn-chicken-pizza",
      "tenders meal": "tenders-meal",
      "hot dog crispy roll": "hotdog-crispy-roll",
      "hotdog crispy roll": "hotdog-crispy-roll",
      "truck chicken": "truck-chicken",
      "basmati chicken": "basmati-chicken"
    };

    function resolveStarCardItemId(card) {
      if (!card) return null;
      const explicitId = card.dataset.itemId || card.dataset.id;
      const itemsDict = window.MENU_ITEMS || {};
      if (explicitId && itemsDict[explicitId]) return explicitId;

      const rawTitle = (card.querySelector(".star-title")?.textContent || "")
        .trim()
        .toLowerCase();
      if (rawTitle && STAR_TITLE_TO_ITEM_ID[rawTitle]) {
        return STAR_TITLE_TO_ITEM_ID[rawTitle];
      }

      const matched = Object.values(itemsDict).find(
        (entry) => (entry.title || "").trim().toLowerCase() === rawTitle
      );
      return matched ? matched.id : explicitId || null;
    }

    // Unified Card CTA Handler:
    // - Menu & Upsell cards (".menu-card-cta"): open Quick View modal to choose options first
    // - Home Menu Stars (".star-add-btn" & card click without drag): open Quick View modal (#qvOverlay)
    document.addEventListener("click", (e) => {
      const menuAddBtn = e.target.closest(".menu-card-cta");
      if (menuAddBtn) {
        e.preventDefault();
        e.stopPropagation();
        const menuCard = menuAddBtn.closest(".menu-card");
        const itemId = menuCard?.dataset.id;
        if (itemId && typeof window.openToomysQuickView === "function") {
          window.openToomysQuickView(itemId);
        }
        return;
      }

      const addBtn = e.target.closest(".star-add-btn");
      if (addBtn) {
        e.preventDefault();
        e.stopPropagation();
        const card = addBtn.closest(".star-card");
        const itemId = resolveStarCardItemId(card);
        if (itemId && typeof window.openToomysQuickView === "function") {
          window.openToomysQuickView(itemId);
        }
        return;
      }

      const starCard = e.target.closest(".star-card");
      if (starCard) {
        if (starsMovedDistance > 6) {
          starsMovedDistance = 0;
          return;
        }
        const itemId = resolveStarCardItemId(starCard);
        if (itemId && typeof window.openToomysQuickView === "function") {
          window.openToomysQuickView(itemId);
        }
      }
    });

    // Initialize card buttons, sync any saved cart quantities, and render drawer
    initMenuCardButtons();
    syncMenuCardButtons();
    renderCart(false);
  }

  /* =========================================
     14. FULL MENU PAGE (SHARED MENU_ITEMS + PRODUCT NAVIGATION)
     ========================================= */
  const SHARED_MENU_ITEMS = window.MENU_ITEMS || {};
  const SHARED_MENU_LIST = window.MENU_ITEMS_LIST || Object.values(SHARED_MENU_ITEMS);

  
  function getCardThemeClass(item) {
    const raw = (item.cardTheme || item.theme || "red").toLowerCase();
    return raw.startsWith("theme-") ? raw : `theme-${raw}`;
  }

  function buildMenuCardHTML(item, idx, overrideThemeClass = null) {
    const themeClass = overrideThemeClass || getCardThemeClass(item);
    return `
      <article
        class="menu-card ${themeClass}"
        data-id="${item.id}"
        data-category="${item.category}"
        style="--card-stagger: ${idx};"
      >
        <div class="menu-card-media">
          <span class="menu-card-badge">${item.badge}</span>

          <button
            type="button"
            class="menu-qv-btn"
            data-qv-id="${item.id}"
            aria-label="${t(`Quick View ${item.title}`, `نظرة سريعة على ${item.title}`)}"
          >
            <span class="menu-qv-icon" aria-hidden="true">&#10530;</span>
            <span class="menu-qv-label">${t("Quick View", "نظرة سريعة")}</span>
          </button>

          <img
            src="${item.image}"
            alt="${item.title}"
            class="menu-card-img"
            loading="lazy"
            draggable="false"
          />
        </div>

        <div class="menu-card-body">
          <span class="menu-card-sub">${item.subtitle}</span>
          <h2 class="menu-card-title">${item.title}</h2>
          <p class="menu-card-desc">${item.description}</p>
        </div>

        <div class="menu-card-footer">
          <span class="menu-card-price">${formatPrice(item.basePrice)}</span>

          <button type="button" class="menu-card-cta">
            <span class="star-btn-view star-btn-view-default">${t("+ Add", "+ ضيف")}</span>
            <span class="star-btn-view star-btn-view-added" aria-hidden="true">${t("Added &#10003;", "اتضاف &#10003;")}</span>
            <span class="star-btn-view star-btn-view-stepper">
              <span class="card-step-btn" data-card-step="dec" role="button" tabindex="0" aria-label="${t("Decrease quantity", "قلّل الكمية")}">&minus;</span>
              <span class="card-step-qty">1</span>
              <span class="card-step-btn" data-card-step="inc" role="button" tabindex="0" aria-label="${t("Increase quantity", "زوّد الكمية")}">+</span>
            </span>
          </button>
        </div>
      </article>
    `;
  }

  const menuProductGrid = document.getElementById("menuProductGrid");
  const menuFilterBar = document.getElementById("menuFilterBar");
  const menuFilterWrap = document.getElementById("menuFilterWrap");
  const menuFilterIndicator = document.getElementById("menuFilterIndicator");
  
  if (menuProductGrid && menuFilterBar && SHARED_MENU_LIST.length > 0) {
    const VALID_CATS = ["all", "burgers", "chicken", "tenders", "pizza", "basmati", "crispy"];

    // Update category tab counts dynamically from SHARED_MENU_LIST
    VALID_CATS.forEach((cat) => {
      const countEl = menuFilterBar.querySelector(`[data-count-for="${cat}"]`);
      if (countEl) {
        const count =
          cat === "all"
            ? SHARED_MENU_LIST.length
            : SHARED_MENU_LIST.filter((item) => item.category === cat).length;
        countEl.textContent = count;
      }
    });

    function moveFilterIndicator(activeTab) {
      if (!menuFilterIndicator || !activeTab) return;
      menuFilterIndicator.style.width = `${activeTab.offsetWidth}px`;
      menuFilterIndicator.style.transform = `translate3d(${activeTab.offsetLeft}px, 0, 0)`;
    }

    function renderMenuCards(category, animate = true) {
      const filtered =
        category === "all"
          ? SHARED_MENU_LIST
          : SHARED_MENU_LIST.filter((item) => item.category === category);

      const buildMarkup = () => {
        menuProductGrid.innerHTML = filtered
          .map((item, idx) => buildMenuCardHTML(item, idx))
          .join("");

        if (typeof syncMenuCardButtons === "function") {
          syncMenuCardButtons();
        }
      };

      if (!animate) {
        buildMarkup();
        return;
      }

      menuProductGrid.classList.add("is-filtering-out");
      clearTimeout(menuProductGrid._filterTimer);
      menuProductGrid._filterTimer = setTimeout(() => {
        buildMarkup();
        menuProductGrid.classList.remove("is-filtering-out");
      }, 150);
    }

    function setActiveCategory(cat, { updateUrl = true, animate = true } = {}) {
      const normalized = VALID_CATS.includes(cat) ? cat : "all";
      const tabs = menuFilterBar.querySelectorAll(".menu-filter-tab");
      let activeTab = null;

      tabs.forEach((tab) => {
        const isMatch = tab.dataset.cat === normalized;
        tab.classList.toggle("is-active", isMatch);
        tab.setAttribute("aria-pressed", isMatch ? "true" : "false");
        if (isMatch) activeTab = tab;
      });

      moveFilterIndicator(activeTab);
      renderMenuCards(normalized, animate);

      if (updateUrl && window.history && window.history.replaceState) {
        const url = new URL(window.location.href);
        if (normalized === "all") {
          url.searchParams.delete("cat");
        } else {
          url.searchParams.set("cat", normalized);
        }
        window.history.replaceState({ cat: normalized }, "", url.toString());
      }
    }

    menuFilterBar.addEventListener("click", (e) => {
      const tab = e.target.closest(".menu-filter-tab");
      if (!tab || tab.classList.contains("is-active")) return;
      setActiveCategory(tab.dataset.cat, { updateUrl: true, animate: true });
    });

    window.addEventListener("resize", () => {
      const activeTab = menuFilterBar.querySelector(".menu-filter-tab.is-active");
      moveFilterIndicator(activeTab);
    });

    // Clicking anywhere on a Menu Card (body, image, title, or Quick View button) -> product.html?id=<id>
    // (+ Add button uses e.stopPropagation() so it adds to cart without navigating)
    // Clicking Quick View opens the modal; clicking the rest of the card navigates to product.html?id=<id>
    menuProductGrid.addEventListener("click", (e) => {
      if (e.target.closest(".menu-card-cta, [data-card-step]")) return;

      const qvTrigger = e.target.closest("[data-qv-id]");
      if (qvTrigger) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.openToomysQuickView === "function") {
          window.openToomysQuickView(qvTrigger.dataset.qvId);
        }
        return;
      }

      const card = e.target.closest(".menu-card");
      if (!card) return;

      const itemId = card.dataset.id;
      if (itemId && SHARED_MENU_ITEMS[itemId]) {
        e.preventDefault();
        window.location.href = `product.html?id=${encodeURIComponent(itemId)}`;
      }
    });

    const initialCat =
      new URLSearchParams(window.location.search).get("cat")?.toLowerCase() || "all";
    setActiveCategory(initialCat, { updateUrl: false, animate: false });
    requestAnimationFrame(() => {
      const activeTab = menuFilterBar.querySelector(".menu-filter-tab.is-active");
      moveFilterIndicator(activeTab);
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        const activeTab = menuFilterBar.querySelector(".menu-filter-tab.is-active");
        moveFilterIndicator(activeTab);
      });
    }

    // Scroll-linked header auto-hide handled globally by handleNavbarScroll()
  }
  /* =========================================
     14B. QUICK-VIEW MODAL CONTROLLER (menu.html & upsell cards)
     ========================================= */
  /* =========================================
     14B. QUICK-VIEW MODAL CONTROLLER (menu.html & product.html)
     ========================================= */
  let qvOverlay = document.getElementById("qvOverlay");
  let qvDialog = document.getElementById("qvDialog");

  if (!qvOverlay && SHARED_MENU_LIST.length > 0) {
    qvOverlay = document.createElement("div");
    qvOverlay.className = "qv-overlay";
    qvOverlay.id = "qvOverlay";
    qvOverlay.setAttribute("aria-hidden", "true");
    qvOverlay.innerHTML = `
      <div class="qv-dialog" id="qvDialog" role="dialog" aria-modal="true" aria-labelledby="qvTitle">
        <div class="qv-showcase-pane">
          <span class="qv-badge" id="qvBadge">${t("Try It Now", "جرّبها دلوقتي")}</span>
          <img src="" alt="" class="qv-image" id="qvImage" draggable="false" />
        </div>
        <div class="qv-details-pane">
          <button type="button" class="qv-close-btn" id="qvCloseBtn" aria-label="${t("Close Quick View", "اقفل")}">&#10005;</button>
          <div class="qv-scroll-content">
            <div class="qv-eyebrow">
              <span class="qv-eyebrow-dot" aria-hidden="true"></span>
              <span id="qvCategory">${t("Menu", "المنيو")}</span>
            </div>
            <h2 class="qv-title" id="qvTitle">${t("Product", "الصنف")}</h2>
            <p class="qv-subtitle" id="qvSubtitle"></p>
            <p class="qv-desc" id="qvDesc"></p>
            <div class="qv-chips-row" id="qvChipsRow" aria-label="${t("Included Items", "المكونات")}"></div>
            <div class="qv-options-stack" id="qvOptionsStack"></div>
          </div>
          <div class="qv-purchase-row">
            <div class="qv-qty-stepper" role="group" aria-label="${t("Item Quantity", "الكمية")}">
              <button type="button" class="qv-qty-btn" id="qvQtyDec" aria-label="${t("Decrease quantity", "قلّل الكمية")}">&minus;</button>
              <span class="qv-qty-val" id="qvQtyVal">1</span>
              <button type="button" class="qv-qty-btn" id="qvQtyInc" aria-label="${t("Increase quantity", "زوّد الكمية")}">+</button>
            </div>
            <button type="button" class="qv-add-btn" id="qvAddBtn">
              <span class="qv-add-label" id="qvAddLabel">${t("Add to Cart", "ضيف للأوردر")}</span>
              <span class="qv-price-badge" id="qvPriceBadge">${formatPrice(0)}</span>
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(qvOverlay);
    qvDialog = document.getElementById("qvDialog");
  }

  if (qvOverlay && qvDialog && SHARED_MENU_LIST.length > 0) {
    const qvCloseBtn = document.getElementById("qvCloseBtn");
    const qvBadge = document.getElementById("qvBadge");
    const qvImage = document.getElementById("qvImage");
    const qvCategory = document.getElementById("qvCategory");
    const qvTitle = document.getElementById("qvTitle");
    const qvSubtitle = document.getElementById("qvSubtitle");
    const qvDesc = document.getElementById("qvDesc");
    const qvChipsRow = document.getElementById("qvChipsRow");
    const qvOptionsStack = document.getElementById("qvOptionsStack");
    const qvQtyDec = document.getElementById("qvQtyDec");
    const qvQtyInc = document.getElementById("qvQtyInc");
    const qvQtyVal = document.getElementById("qvQtyVal");
    const qvAddBtn = document.getElementById("qvAddBtn");
    const qvAddLabel = document.getElementById("qvAddLabel");
    const qvPriceBadge = document.getElementById("qvPriceBadge");

    let qvActiveItem = null;
    let qvSelectedOptions = [];
    let qvQty = 1;
    let qvCloseTimer = null;

    function computeQvUnitPrice() {
      if (!qvActiveItem) return 0;
      const deltaSum = (qvActiveItem.optionGroups || []).reduce((sum, group, gIdx) => {
        const optIdx = qvSelectedOptions[gIdx] ?? 0;
        const opt = group.options[optIdx];
        return sum + (opt ? opt.delta : 0);
      }, 0);
      return qvActiveItem.basePrice + deltaSum;
    }

    function updateQvPrice() {
      const total = computeQvUnitPrice() * qvQty;
      if (qvPriceBadge) {
        qvPriceBadge.textContent = formatPrice(total);
      }
    }

    function renderQvOptions() {
      const groups = qvActiveItem?.optionGroups || [];
      if (groups.length === 0) {
        qvOptionsStack.hidden = true;
        qvOptionsStack.innerHTML = "";
        return;
      }

      qvOptionsStack.hidden = false;
      qvOptionsStack.innerHTML = groups
        .map((group, gIdx) => {
          const activeIdx = qvSelectedOptions[gIdx] ?? 0;
          return `
            <div class="qv-option-group" data-qv-group="${gIdx}">
              <span class="qv-option-label">${group.name}</span>
              <div class="qv-option-pills" role="radiogroup" aria-label="${group.name}">
                ${group.options
                  .map((opt, oIdx) => {
                    const isSelected = oIdx === activeIdx;
                    const deltaTag =
                      opt.delta > 0
                        ? `<span class="qv-option-delta">+${opt.delta}</span>`
                        : "";
                    return `
                      <button
                        type="button"
                        class="qv-option-pill${isSelected ? " is-active" : ""}"
                        data-qv-g="${gIdx}"
                        data-qv-o="${oIdx}"
                        role="radio"
                        aria-checked="${isSelected ? "true" : "false"}"
                      >
                        <span>${opt.label}</span>
                        ${deltaTag}
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          `;
        })
        .join("");
    }

    function openQuickViewModal(itemId) {
      const item = SHARED_MENU_ITEMS[itemId];
      if (!item) return;

      clearTimeout(qvCloseTimer);
      qvActiveItem = item;
      qvSelectedOptions = (item.optionGroups || []).map(() => 0);
      qvQty = 1;

      if (qvBadge) qvBadge.textContent = item.badge;
      if (qvImage) {
        qvImage.src = item.image;
        qvImage.alt = item.title;
      }
      if (qvCategory) {
        qvCategory.textContent = item.categoryLabel || item.category;
      }
      if (qvTitle) qvTitle.textContent = item.title;
      if (qvSubtitle) qvSubtitle.textContent = item.subtitle;
      if (qvDesc) qvDesc.textContent = item.description;

      const chips = item.includedChips || [];
      if (chips.length === 0) {
        qvChipsRow.hidden = true;
        qvChipsRow.innerHTML = "";
      } else {
        qvChipsRow.hidden = false;
        qvChipsRow.innerHTML = chips
          .map((chip) => `<span class="qv-chip">${chip}</span>`)
          .join("");
      }

      if (qvQtyVal) qvQtyVal.textContent = "1";
      clearTimeout(qvAddBtn._addedTimer);
      qvAddBtn.classList.remove("is-added");
      if (qvAddLabel) qvAddLabel.textContent = t("Add to Cart", "ضيف للأوردر");

      renderQvOptions();
      updateQvPrice();

      const qvScrollContentEl = qvOverlay.querySelector(".qv-scroll-content");
      const qvDetailsPaneEl = qvOverlay.querySelector(".qv-details-pane");
      if (qvScrollContentEl) qvScrollContentEl.scrollTop = 0;
      if (qvDetailsPaneEl) qvDetailsPaneEl.scrollTop = 0;

      qvOverlay.classList.remove("is-closing");
      void qvOverlay.offsetWidth;
      qvOverlay.classList.add("is-open");
      qvOverlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("is-qv-open");
      document.body.style.overflow = "hidden";
    }

    function closeQuickViewModal() {
      if (!qvOverlay.classList.contains("is-open")) return;
      qvOverlay.classList.add("is-closing");
      qvOverlay.classList.remove("is-open");
      qvOverlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("is-qv-open");

      clearTimeout(qvCloseTimer);
      qvCloseTimer = setTimeout(() => {
        qvOverlay.classList.remove("is-closing");
        if (
          !document.body.classList.contains("is-mobile-menu-open") &&
          !document.body.classList.contains("is-menu-open") &&
          !document.getElementById("cartDrawer")?.classList.contains("is-open")
        ) {
          document.body.style.overflow = "";
        }
      }, 190);
    }

    window.openToomysQuickView = openQuickViewModal;
    window.openQuickView = openQuickViewModal;

    // Option selection & live price update
    qvOptionsStack.addEventListener("click", (e) => {
      const pill = e.target.closest(".qv-option-pill");
      if (!pill) return;

      const gIdx = Number(pill.dataset.qvG);
      const oIdx = Number(pill.dataset.qvO);
      if (Number.isNaN(gIdx) || Number.isNaN(oIdx)) return;

      if (qvSelectedOptions[gIdx] === oIdx) return;
      qvSelectedOptions[gIdx] = oIdx;

      const groupEl = qvOptionsStack.querySelector(`[data-qv-group="${gIdx}"]`);
      if (groupEl) {
        groupEl.querySelectorAll(".qv-option-pill").forEach((btn, idx) => {
          const active = idx === oIdx;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-checked", active ? "true" : "false");
        });
      }

      updateQvPrice();
    });

    // Quantity stepper
    if (qvQtyDec) {
      qvQtyDec.addEventListener("click", () => {
        if (qvQty <= 1) return;
        qvQty -= 1;
        qvQtyVal.textContent = qvQty;
        updateQvPrice();
      });
    }

    if (qvQtyInc) {
      qvQtyInc.addEventListener("click", () => {
        qvQty += 1;
        qvQtyVal.textContent = qvQty;
        updateQvPrice();
      });
    }

    // Add to Cart from Quick View
    if (qvAddBtn) {
      qvAddBtn.addEventListener("click", () => {
        if (!qvActiveItem) return;

        const chosenLabels = (qvActiveItem.optionGroups || [])
          .map((group, gIdx) => {
            const opt = group.options[qvSelectedOptions[gIdx] ?? 0];
            return opt ? opt.label : null;
          })
          .filter(Boolean);

        const variantSummary =
          chosenLabels.length > 0 ? chosenLabels.join(" · ") : t("Standard", "عادي");
        const unitPrice = computeQvUnitPrice();

        let storedCart = [];
        try {
          const parsed = JSON.parse(localStorage.getItem("toomys_cart_v1"));
          if (Array.isArray(parsed)) storedCart = parsed;
        } catch {
          storedCart = [];
        }

        const existing = storedCart.find(
          (item) => item.title === qvActiveItem.title && item.sub === variantSummary
        );
        if (existing) {
          existing.qty += qvQty;
        } else {
          storedCart.push({
            title: qvActiveItem.title,
            price: unitPrice,
            image: qvActiveItem.image,
            sub: variantSummary,
            qty: qvQty
          });
        }

        try {
          localStorage.setItem("toomys_cart_v1", JSON.stringify(storedCart));
        } catch {
          // Ignore storage quota errors
        }

        const totalCount = storedCart.reduce((sum, i) => sum + i.qty, 0);
        const badgeEl = document.getElementById("cartCountBadge");
        const toggleEl = document.getElementById("cartToggle");
        if (badgeEl) {
          badgeEl.textContent = totalCount;
          badgeEl.classList.add("has-items");
          badgeEl.classList.remove("is-bumped");
          void badgeEl.offsetWidth;
          badgeEl.classList.add("is-bumped");
          setTimeout(() => badgeEl.classList.remove("is-bumped"), 320);
        }
        if (toggleEl) {
          toggleEl.classList.add("has-items");
          toggleEl.classList.remove("is-pulsing");
          void toggleEl.offsetWidth;
          toggleEl.classList.add("is-pulsing");
        }

        window.dispatchEvent(new CustomEvent("toomys:cart-sync"));

        qvAddBtn.classList.add("is-added");
        if (qvAddLabel) qvAddLabel.textContent = t("Added \u2713", "اتضاف \u2713");
        clearTimeout(qvAddBtn._addedTimer);
        qvAddBtn._addedTimer = setTimeout(() => {
          closeQuickViewModal();
        }, 550);
      });
    }

    // Close triggers: "×" button, backdrop click outside dialog, or Escape key
    if (qvCloseBtn) {
      qvCloseBtn.addEventListener("click", closeQuickViewModal);
    }

    qvOverlay.addEventListener("click", (e) => {
      if (e.target === qvOverlay) {
        closeQuickViewModal();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && qvOverlay.classList.contains("is-open")) {
        closeQuickViewModal();
      }
    });
  }
  /* =========================================
     15. CHECKOUT & ORDER CONFIRMATION CONTROLLERS
     ========================================= */
  const LAST_ORDER_KEY = "toomys_last_order_v1";
  const ORDERS_HISTORY_KEY = "toomys_orders_history_v1";
  const SCRATCH_REWARD_KEY = "toomys_scratch_reward_v1";
  const NEWSLETTER_LEADS_KEY = "toomys_newsletter_leads_v1";
  const TOOMYS_PROMO_CODES = {
    TOOMY15: { type: "percent", value: 15, labelEn: "15% OFF", labelAr: "خصم 15%" },
    TOOMY10: { type: "percent", value: 10, labelEn: "10% OFF", labelAr: "خصم 10%" },
    TOOMY25: { type: "fixed", value: 25, labelEn: "25 EGP OFF", labelAr: "خصم 25 جنيه" },
    FREEFRIES: { type: "freebie", value: 0, labelEn: "Free Golden Fries 🍟", labelAr: "بطاطس دهبي ببلاش 🍟" }
  };

  function generateOrderCode() {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let suffix = "";
    for (let i = 0; i < 5; i++) {
      suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `T-${suffix}`;
  }

  // --- A. CHECKOUT PAGE (checkout.html) ---
  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutItemsContainer = document.getElementById("checkoutItemsContainer");
  const checkoutShell = document.getElementById("checkoutShell");
  const checkoutEmptyView = document.getElementById("checkoutEmptyView");

  if (checkoutForm && checkoutItemsContainer) {
    const fulfillmentToggle = document.getElementById("fulfillmentToggle");
    const checkoutAddressWrap = document.getElementById("checkoutAddressWrap");
    const paymentMethodDesc = document.getElementById("paymentMethodDesc");
    const checkoutSubtotalVal = document.getElementById("checkoutSubtotalVal");
    const checkoutFeeLabel = document.getElementById("checkoutFeeLabel");
    const checkoutFeeVal = document.getElementById("checkoutFeeVal");
    const checkoutGrandTotalVal = document.getElementById("checkoutGrandTotalVal");
    const checkoutSubmitTotal = document.getElementById("checkoutSubmitTotal");
    const checkoutSubmitBtn = document.getElementById("checkoutSubmitBtn");
    const checkoutFormError = document.getElementById("checkoutFormError");
    const checkoutPromoInput = document.getElementById("checkoutPromoInput");
    const checkoutPromoApplyBtn = document.getElementById("checkoutPromoApplyBtn");
    const checkoutPromoSavedPill = document.getElementById("checkoutPromoSavedPill");
    const checkoutPromoMsg = document.getElementById("checkoutPromoMsg");
    const checkoutDiscountRow = document.getElementById("checkoutDiscountRow");
    const checkoutDiscountLabel = document.getElementById("checkoutDiscountLabel");
    const checkoutDiscountVal = document.getElementById("checkoutDiscountVal");

    let fulfillmentMethod = "delivery"; // "delivery" | "pickup"
    let isEmptyViewActive = false;
    let appliedPromo = null;

    function getSavedScratchReward() {
      try {
        return JSON.parse(localStorage.getItem(SCRATCH_REWARD_KEY));
      } catch {
        return null;
      }
    }

    function computePromoDiscount(subtotal) {
      if (!appliedPromo || !TOOMYS_PROMO_CODES[appliedPromo] || subtotal <= 0) return 0;
      const promo = TOOMYS_PROMO_CODES[appliedPromo];
      if (promo.type === "percent") return Math.round((subtotal * promo.value) / 100);
      if (promo.type === "fixed") return Math.min(subtotal, promo.value);
      return 0;
    }

    function syncSavedPromoPill() {
      if (!checkoutPromoSavedPill) return;
      const reward = getSavedScratchReward();
      if (reward && reward.unlocked && reward.code && TOOMYS_PROMO_CODES[reward.code] && appliedPromo !== reward.code) {
        checkoutPromoSavedPill.hidden = false;
        checkoutPromoSavedPill.textContent = IS_AR
          ? `عندك كود كسبته: ${reward.code} — اضغط لتطبيقه`
          : `Tap to apply your prize: ${reward.code}`;
      } else {
        checkoutPromoSavedPill.hidden = true;
      }
    }

    function getCheckoutItems() {
      try {
        const saved = JSON.parse(localStorage.getItem("toomys_cart_v1"));
        return Array.isArray(saved) ? saved : [];
      } catch {
        return [];
      }
    }

    function setCheckoutItems(items) {
      try {
        localStorage.setItem("toomys_cart_v1", JSON.stringify(items));
      } catch {
        // Ignore quota errors
      }
      const badge = document.getElementById("cartCountBadge");
      const toggle = document.getElementById("cartToggle");
      const count = items.reduce((sum, i) => sum + i.qty, 0);
      if (badge) {
        badge.textContent = count;
        badge.classList.toggle("has-items", count > 0);
      }
      if (toggle) {
        toggle.classList.toggle("has-items", count > 0);
      }
    }

    let checkoutCart = getCheckoutItems();

    function swapToEmptyCheckoutView({ smoothScroll = true } = {}) {
      if (checkoutShell) checkoutShell.hidden = true;
      if (checkoutEmptyView) {
        checkoutEmptyView.hidden = false;
        // Re-trigger entrance animation cleanly
        checkoutEmptyView.style.animation = "none";
        void checkoutEmptyView.offsetWidth;
        checkoutEmptyView.style.animation = "";
      }

      if (!isEmptyViewActive) {
        isEmptyViewActive = true;
        if (smoothScroll) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }
    }

    function updateCheckoutTotals() {
      const subtotal = checkoutCart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const discount = computePromoDiscount(subtotal);
      const fee = checkoutCart.length === 0 ? 0 : fulfillmentMethod === "delivery" ? 25 : 0;
      const grandTotal = Math.max(0, subtotal - discount + fee);

      if (checkoutSubtotalVal) checkoutSubtotalVal.textContent = formatPrice(subtotal);
      if (checkoutDiscountRow) {
        if (appliedPromo && TOOMYS_PROMO_CODES[appliedPromo]) {
          checkoutDiscountRow.hidden = false;
          if (checkoutDiscountLabel) {
            checkoutDiscountLabel.textContent = `${t("Discount", "الخصم")} (${appliedPromo})`;
          }
          if (checkoutDiscountVal) {
            checkoutDiscountVal.textContent =
              discount > 0 ? `-${formatPrice(discount)}` : t("Free Fries 🍟", "بطاطس ببلاش 🍟");
          }
        } else {
          checkoutDiscountRow.hidden = true;
        }
      }
      if (checkoutFeeLabel) {
        checkoutFeeLabel.textContent =
          fulfillmentMethod === "delivery"
            ? t("Delivery", "التوصيل")
            : t("Pickup", "الاستلام من الفرع");
      }
      if (checkoutFeeVal) {
        checkoutFeeVal.textContent = fee === 0 ? t("Free", "مجانًا") : formatPrice(fee);
      }
      if (checkoutGrandTotalVal) checkoutGrandTotalVal.textContent = formatPrice(grandTotal);
      if (checkoutSubmitTotal) checkoutSubmitTotal.textContent = formatPrice(grandTotal);
    }

    function applyPromoCode(rawCode) {
      const code = (rawCode || "").trim().toUpperCase();
      if (!code) {
        appliedPromo = null;
        if (checkoutPromoApplyBtn) {
          checkoutPromoApplyBtn.classList.remove("is-applied");
          checkoutPromoApplyBtn.textContent = t("Apply", "تطبيق");
        }
        if (checkoutPromoMsg) {
          checkoutPromoMsg.textContent = "";
          checkoutPromoMsg.className = "checkout-promo-msg";
        }
        updateCheckoutTotals();
        syncSavedPromoPill();
        return;
      }

      const promo = TOOMYS_PROMO_CODES[code];
      if (!promo) {
        appliedPromo = null;
        if (checkoutPromoApplyBtn) {
          checkoutPromoApplyBtn.classList.remove("is-applied");
          checkoutPromoApplyBtn.textContent = t("Apply", "تطبيق");
        }
        if (checkoutPromoMsg) {
          checkoutPromoMsg.className = "checkout-promo-msg is-error";
          checkoutPromoMsg.textContent = t("Hmm, that promo code isn't valid.", "الكود ده مش مظبوط، جرب تاني.");
        }
        updateCheckoutTotals();
        syncSavedPromoPill();
        return;
      }

      appliedPromo = code;
      if (checkoutPromoInput) checkoutPromoInput.value = code;
      if (checkoutPromoApplyBtn) {
        checkoutPromoApplyBtn.classList.add("is-applied");
        checkoutPromoApplyBtn.textContent = t("Remove", "إلغاء");
      }
      if (checkoutPromoMsg) {
        checkoutPromoMsg.className = "checkout-promo-msg is-success";
        checkoutPromoMsg.textContent = IS_AR
          ? `تمام! اتفعّل كود ${code} (${promo.labelAr})`
          : `Applied ${code} — ${promo.labelEn}!`;
      }
      updateCheckoutTotals();
      syncSavedPromoPill();
    }

    if (checkoutPromoApplyBtn && checkoutPromoInput) {
      checkoutPromoApplyBtn.addEventListener("click", () => {
        const typed = checkoutPromoInput.value.trim().toUpperCase();
        if (appliedPromo && checkoutPromoApplyBtn.classList.contains("is-applied") && typed === appliedPromo) {
          checkoutPromoInput.value = "";
          applyPromoCode("");
          return;
        }
        applyPromoCode(typed);
      });

      checkoutPromoInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          applyPromoCode(checkoutPromoInput.value);
        }
      });

      checkoutPromoInput.addEventListener("input", () => {
        const typed = checkoutPromoInput.value.trim().toUpperCase();
        if (appliedPromo && typed !== appliedPromo) {
          checkoutPromoApplyBtn.classList.remove("is-applied");
          checkoutPromoApplyBtn.textContent = t("Apply", "تطبيق");
        }
      });
    }

    if (checkoutPromoSavedPill) {
      checkoutPromoSavedPill.addEventListener("click", () => {
        const reward = getSavedScratchReward();
        if (reward && reward.code) applyPromoCode(reward.code);
      });
    }

    function renderCheckoutSummary({ isInitial = false } = {}) {
      if (checkoutCart.length === 0) {
        swapToEmptyCheckoutView({ smoothScroll: !isInitial });
        return;
      }

      isEmptyViewActive = false;
      if (checkoutShell) checkoutShell.hidden = false;
      if (checkoutEmptyView) checkoutEmptyView.hidden = true;

      updateCheckoutTotals();

      checkoutItemsContainer.innerHTML = `
        <ul class="checkout-summary-list">
          ${checkoutCart
            .map(
              (item, idx) => `
            <li class="checkout-summary-item" data-idx="${idx}">
              <div class="checkout-summary-item-inner">
                <div class="checkout-item-thumb">
                  <img src="${item.image}" alt="${item.title}" />
                </div>

                <div class="checkout-item-meta">
                  <h3 class="checkout-item-title">${item.title}</h3>
                  <p class="checkout-item-sub">${item.sub || t("Regular", "عادي")}</p>

                  <div class="checkout-item-actions">
                    <div class="checkout-stepper-pill">
                      <button type="button" class="checkout-step-btn" data-co-action="dec" data-idx="${idx}" aria-label="${t("Decrease quantity", "قلّل الكمية")}">&minus;</button>
                      <span class="checkout-step-qty">${item.qty}</span>
                      <button type="button" class="checkout-step-btn" data-co-action="inc" data-idx="${idx}" aria-label="${t("Increase quantity", "زوّد الكمية")}">+</button>
                    </div>
                    <button type="button" class="checkout-remove-link" data-co-action="remove" data-idx="${idx}">${t("Remove", "شيل")}</button>
                  </div>
                </div>

                <div class="checkout-item-price">${formatPrice(item.price * item.qty)}</div>
              </div>
            </li>
          `
            )
            .join("")}
        </ul>
      `;
    }

    // Keep checkout view synced if items are removed from the slide-out cart drawer
    window.addEventListener("toomys:cart-sync", () => {
      checkoutCart = getCheckoutItems();
      renderCheckoutSummary({ isInitial: false });
    });

    // 1-Click Quick-Add Recovery Flow from the Empty Tray View
    const QUICK_ADD_PICKS = {
      "toomy-burger": {
        title: t("Toomy Burger", "تومي برجر"),
        sub: t("Signature Double Smash", "دبل سماش توميز السبيشيال"),
        price: 185,
        image: "assets/products/toomy-burger.webp"
      },
      "juicy-jack-burger": {
        title: t("Juicy Jack Burger", "جوسي جاك برجر"),
        sub: t("Monterey Jack & Jalapeno", "مونتيري جاك وهالابينو"),
        price: 195,
        image: "assets/products/juicy-jack.webp"
      },
      "popcorn-chicken-pizza": {
        title: t("Popcorn Chicken Pizza", "بيتزا بوب كورن تشيكن"),
        sub: t("Buffalo & Ranch Drizzle", "بافلو ورانش على الوش"),
        price: 210,
        image: "assets/products/pizza-popcorn-buffalo.webp"
      }
    };

    if (checkoutEmptyView) {
      checkoutEmptyView.addEventListener("click", (e) => {
        const quickBtn = e.target.closest("[data-quick-add]");
        if (!quickBtn) return;

        const pick = QUICK_ADD_PICKS[quickBtn.dataset.quickAdd];
        if (!pick) return;

        checkoutCart = [{ ...pick, qty: 1 }];
        setCheckoutItems(checkoutCart);

        // Animate smoothly back into the active 2-column Checkout view
        if (checkoutShell) {
          checkoutShell.classList.remove("is-recovering");
          void checkoutShell.offsetWidth;
          checkoutShell.classList.add("is-recovering");
        }
        renderCheckoutSummary({ isInitial: false });
      });
    }

    // Fulfillment Toggle (Delivery <-> Branch Pickup)
    if (fulfillmentToggle) {
      fulfillmentToggle.addEventListener("click", (e) => {
        const tab = e.target.closest(".fulfillment-tab");
        if (!tab) return;

        const nextMethod = tab.dataset.method;
        if (nextMethod === fulfillmentMethod) return;

        fulfillmentMethod = nextMethod;
        const isPickup = fulfillmentMethod === "pickup";

        fulfillmentToggle.classList.toggle("is-pickup", isPickup);
        fulfillmentToggle.querySelectorAll(".fulfillment-tab").forEach((btn) => {
          const active = btn.dataset.method === fulfillmentMethod;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-selected", active ? "true" : "false");
        });

        if (checkoutAddressWrap) {
          checkoutAddressWrap.classList.toggle("is-hidden", isPickup);
        }

        if (paymentMethodDesc) {
          paymentMethodDesc.textContent = isPickup
            ? t("Pay at the branch upon pickup", "ادفع في الفرع وإنت بتستلم")
            : t("Pay cash on delivery", "ادفع كاش لما الأوردر يوصلك");
        }

        updateCheckoutTotals();
      });
    }

    // Order Summary Quantity Steppers & Smooth Row Removal
    checkoutItemsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-co-action]");
      if (!btn) return;

      const idx = Number(btn.dataset.idx);
      const action = btn.dataset.coAction;
      const rowEl = btn.closest(".checkout-summary-item");
      if (Number.isNaN(idx) || !checkoutCart[idx]) return;

      if (action === "inc") {
        checkoutCart[idx].qty += 1;
        setCheckoutItems(checkoutCart);
        renderCheckoutSummary();
        return;
      }

      if (action === "dec" && checkoutCart[idx].qty > 1) {
        checkoutCart[idx].qty -= 1;
        setCheckoutItems(checkoutCart);
        renderCheckoutSummary();
        return;
      }

      // Remove item smoothly (and switch to empty-tray state if last item)
      if (rowEl && !rowEl.classList.contains("is-removing")) {
        checkoutCart.splice(idx, 1);
        setCheckoutItems(checkoutCart);

        if (checkoutCart.length === 0) {
          rowEl.classList.add("is-removing");
          setTimeout(() => {
            renderCheckoutSummary({ isInitial: false });
          }, 260);
        } else {
          updateCheckoutTotals();
          rowEl.classList.add("is-removing");
          setTimeout(() => renderCheckoutSummary(), 340);
        }
      }
    });

    // Confirm Order Form Submission -> Save Order & Redirect to order-confirmation.html
    checkoutForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (checkoutCart.length === 0) return;

      const nameVal = document.getElementById("checkoutName")?.value.trim() || "";
      const phoneVal = document.getElementById("checkoutPhone")?.value.trim() || "";
      const addressVal = document.getElementById("checkoutAddress")?.value.trim() || "";
      const notesVal = document.getElementById("checkoutNotes")?.value.trim() || "";

      if (!nameVal) {
        checkoutFormError.textContent = t(
          "Please enter your name so we know who to prepare the order for.",
          "اكتب اسمك عشان نعرف بنجهّز الأوردر لمين."
        );
        document.getElementById("checkoutName")?.focus();
        return;
      }

      if (!phoneVal || phoneVal.replace(/\D/g, "").length < 8) {
        checkoutFormError.textContent = t(
          "Please enter a valid phone number so we can confirm your order.",
          "اكتب رقم موبايل مظبوط عشان نقدر نكلمك نأكد الأوردر."
        );
        document.getElementById("checkoutPhone")?.focus();
        return;
      }

      if (fulfillmentMethod === "delivery" && !addressVal) {
        checkoutFormError.textContent = t(
          "Please enter your delivery address in Asyut.",
          "اكتب عنوانك في أسيوط عشان نوصّلك على طول."
        );
        document.getElementById("checkoutAddress")?.focus();
        return;
      }

      checkoutFormError.textContent = "";
      checkoutSubmitBtn.classList.add("is-submitting");

      const subtotal = checkoutCart.reduce((sum, item) => sum + item.price * item.qty, 0);
      const discount = computePromoDiscount(subtotal);
      const fee = fulfillmentMethod === "delivery" ? 25 : 0;
      const appliedInfo = appliedPromo ? TOOMYS_PROMO_CODES[appliedPromo] : null;
      const orderPayload = {
        code: generateOrderCode(),
        customerName: nameVal,
        firstName: nameVal.split(/\s+/)[0] || t("Friend", "صاحبنا"),
        phone: phoneVal,
        address:
          fulfillmentMethod === "delivery"
            ? addressVal
            : t("Asyut, Abrag El Nasr Branch", "فرع أسيوط، أبراج النصر"),
        notes: notesVal,
        fulfillmentKey: fulfillmentMethod,
        fulfillment:
          fulfillmentMethod === "delivery"
            ? t("Delivery", "توصيل")
            : t("Branch Pickup", "استلام من الفرع"),
        payment: t("Cash", "كاش"),
        items: checkoutCart.map((item) => ({ ...item })),
        subtotal,
        promoCode: appliedPromo || null,
        promoLabel: appliedInfo ? (IS_AR ? appliedInfo.labelAr : appliedInfo.labelEn) : null,
        discount,
        fee,
        total: Math.max(0, subtotal - discount + fee),
        createdAt: new Date().toLocaleString(IS_AR ? "ar-EG" : "en-US", {
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      };

      try {
        localStorage.setItem(LAST_ORDER_KEY, JSON.stringify(orderPayload));
        const history = JSON.parse(localStorage.getItem(ORDERS_HISTORY_KEY)) || [];
        history.unshift(orderPayload);
        localStorage.setItem(ORDERS_HISTORY_KEY, JSON.stringify(history.slice(0, 15)));
      } catch {
        // Ignore storage errors
      }

      // Clear active cart without triggering empty-state flash before redirect
      localStorage.setItem("toomys_cart_v1", "[]");

      setTimeout(() => {
        window.location.href = "order-confirmation.html";
      }, 360);
    });

    // Initial render on page load
    syncSavedPromoPill();
    renderCheckoutSummary({ isInitial: true });
  }

  // --- B. ORDER CONFIRMATION PAGE (order-confirmation.html) ---
  const paperReceipt = document.getElementById("paperReceipt");

  if (paperReceipt) {
    let orderData = null;
    try {
      orderData = JSON.parse(localStorage.getItem(LAST_ORDER_KEY));
    } catch {
      orderData = null;
    }

    // Graceful fallback if user opens order-confirmation.html directly
    if (!orderData || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      orderData = {
        code: "T-WE6UW",
        customerName: t("Ali Rady Ibrahim", "علي راضي إبراهيم"),
        firstName: t("Ali", "علي"),
        phone: "0110000000",
        fulfillmentKey: "pickup",
        fulfillment: t("Branch Pickup", "استلام من الفرع"),
        payment: t("Cash", "كاش"),
        items: [
          {
            title: t("Triple Smash Meal", "وجبة تربل سماش"),
            sub: t("Triple Beef & Fries", "تربل بيف وبطاطس"),
            qty: 2,
            price: 160
          },
          {
            title: t("Toomy Burger", "تومي برجر"),
            sub: t("Single", "سنجل"),
            qty: 1,
            price: 185
          }
        ],
        subtotal: 505,
        fee: 0,
        total: 505
      };
    }

    const isDeliveryOrder = (entry) =>
      entry.fulfillmentKey === "delivery" ||
      entry.fulfillment === "Delivery" ||
      entry.fulfillment === "توصيل";
    const localizeFulfillment = (entry) =>
      isDeliveryOrder(entry)
        ? t("Delivery", "توصيل")
        : t("Branch Pickup", "استلام من الفرع");
    const localizePayment = (val) =>
      val === "Cash" || val === "كاش" ? t("Cash", "كاش") : val;

    const firstNameEl = document.getElementById("confirmFirstName");
    const inlineCodeEl = document.getElementById("confirmInlineCode");
    const inlinePhoneEl = document.getElementById("confirmInlinePhone");
    const receiptCodeEl = document.getElementById("receiptOrderCode");
    const receiptMetaEl = document.getElementById("receiptMetaTag");
    const receiptItemsList = document.getElementById("receiptItemsList");
    const receiptSubtotalEl = document.getElementById("receiptSubtotal");
    const receiptDiscountRowEl = document.getElementById("receiptDiscountRow");
    const receiptDiscountLabelEl = document.getElementById("receiptDiscountLabel");
    const receiptDiscountValEl = document.getElementById("receiptDiscountVal");
    const receiptFeeLabelEl = document.getElementById("receiptFeeLabel");
    const receiptFeeValEl = document.getElementById("receiptFeeVal");
    const receiptGrandTotalEl = document.getElementById("receiptGrandTotal");

    if (firstNameEl) firstNameEl.textContent = orderData.firstName || t("Ali", "علي");
    if (inlineCodeEl) inlineCodeEl.textContent = `#${orderData.code}`;
    if (inlinePhoneEl) inlinePhoneEl.textContent = orderData.phone;
    if (receiptCodeEl) receiptCodeEl.textContent = orderData.code;
    if (receiptMetaEl) {
      receiptMetaEl.textContent = `${localizeFulfillment(orderData)} · ${localizePayment(orderData.payment)}`;
    }

    if (receiptItemsList) {
      receiptItemsList.innerHTML = orderData.items
        .map(
          (item) => `
        <li class="receipt-item-row">
          <div class="receipt-item-left">
            <span class="receipt-item-name">${item.qty}&times; ${item.title}</span>
            ${item.sub ? `<span class="receipt-item-variant">${item.sub}</span>` : ""}
          </div>
          <span class="receipt-item-price">${formatPrice(item.price * item.qty)}</span>
        </li>
      `
        )
        .join("");
    }

    if (receiptSubtotalEl) {
      receiptSubtotalEl.textContent = formatPrice(orderData.subtotal);
    }
    if (receiptDiscountRowEl) {
      if (orderData.promoCode) {
        receiptDiscountRowEl.hidden = false;
        const promoDef = TOOMYS_PROMO_CODES[orderData.promoCode];
        if (receiptDiscountLabelEl) {
          receiptDiscountLabelEl.textContent = `${t("Promo", "كود الخصم")} (${orderData.promoCode})`;
        }
        if (receiptDiscountValEl) {
          const fallbackLabel = promoDef
            ? (IS_AR ? promoDef.labelAr : promoDef.labelEn)
            : t("Free", "مجانًا");
          receiptDiscountValEl.textContent =
            orderData.discount > 0 ? `-${formatPrice(orderData.discount)}` : (orderData.promoLabel || fallbackLabel);
        }
      } else {
        receiptDiscountRowEl.hidden = true;
      }
    }
    if (receiptFeeLabelEl) {
      receiptFeeLabelEl.textContent = isDeliveryOrder(orderData)
        ? t("Delivery", "التوصيل")
        : t("Pickup", "الاستلام من الفرع");
    }
    if (receiptFeeValEl) {
      receiptFeeValEl.textContent =
        orderData.fee === 0 ? t("Free", "مجانًا") : formatPrice(orderData.fee);
    }
    if (receiptGrandTotalEl) {
      receiptGrandTotalEl.textContent = formatPrice(orderData.total);
    }

    // "My Orders" Secondary Pill Modal Controller
    const myOrdersBtn = document.getElementById("myOrdersBtn");
    const ordersModal = document.getElementById("ordersModal");
    const ordersModalBackdrop = document.getElementById("ordersModalBackdrop");
    const ordersModalClose = document.getElementById("ordersModalClose");
    const ordersModalBody = document.getElementById("ordersModalBody");

    function openOrdersModal() {
      if (!ordersModal || !ordersModalBody) return;
      let history = [];
      try {
        history = JSON.parse(localStorage.getItem(ORDERS_HISTORY_KEY)) || [];
      } catch {
        history = [];
      }
      if (history.length === 0) history = [orderData];

      ordersModalBody.innerHTML = history
        .map(
          (entry) => `
        <div class="past-order-card">
          <div class="past-order-top">
            <span class="past-order-id">#${entry.code}</span>
            <span class="past-order-total">${formatPrice(entry.total)}</span>
          </div>
          <p class="past-order-items">
            ${entry.items.map((i) => `${i.qty}× ${i.title}`).join(IS_AR ? "، " : ", ")}
          </p>
          <p class="past-order-meta">
            ${localizeFulfillment(entry)} &middot; ${localizePayment(entry.payment)}${entry.createdAt ? ` &middot; ${entry.createdAt}` : ""}
          </p>
        </div>
      `
        )
        .join("");

      ordersModalBackdrop.classList.add("is-open");
      ordersModal.classList.add("is-open");
      ordersModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeOrdersModal() {
      if (!ordersModal) return;
      ordersModalBackdrop.classList.remove("is-open");
      ordersModal.classList.remove("is-open");
      ordersModal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    if (myOrdersBtn) myOrdersBtn.addEventListener("click", openOrdersModal);
    if (ordersModalClose) ordersModalClose.addEventListener("click", closeOrdersModal);
    if (ordersModalBackdrop) ordersModalBackdrop.addEventListener("click", closeOrdersModal);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && ordersModal?.classList.contains("is-open")) {
        closeOrdersModal();
      }
    });
  }

  /* =========================================
     16. PRODUCT DETAIL PAGE (product.html) DYNAMIC HYDRATION & MOTION
     ========================================= */
  const pdpHeroGrid = document.getElementById("pdpHeroGrid");

  if (pdpHeroGrid && SHARED_MENU_LIST.length > 0) {
    const pdpBadge = document.getElementById("pdpBadge");
    const pdpImage = document.getElementById("pdpImage");
    const pdpBackLink = document.getElementById("pdpBackLink");
    const pdpBackLabel = document.getElementById("pdpBackLabel");
    const pdpTitle = document.getElementById("pdpTitle");
    const pdpSubtitle = document.getElementById("pdpSubtitle");
    const pdpDesc = document.getElementById("pdpDesc");
    const pdpChipsRow = document.getElementById("pdpChipsRow");
    const pdpOptionsStack = document.getElementById("pdpOptionsStack");
    const pdpQtyDec = document.getElementById("pdpQtyDec");
    const pdpQtyInc = document.getElementById("pdpQtyInc");
    const pdpQtyVal = document.getElementById("pdpQtyVal");
    const pdpAddToCartBtn = document.getElementById("pdpAddToCartBtn");
    const pdpAddLabel = document.getElementById("pdpAddLabel");
    const pdpLivePriceBadge = document.getElementById("pdpLivePriceBadge");
    const pdpUpsellSection = document.getElementById("pdpUpsellSection");
    const pdpUpsellGrid = document.getElementById("pdpUpsellGrid");

    let activeProduct = null;
    let selectedOptionIndices = [];
    let currentQty = 1;

    // Replay staggered above-the-fold hero entrance (Showcase 0ms -> Copy 60ms -> Controls 140ms)
    function playHeroEntrance() {
      pdpHeroGrid.classList.remove("is-entered");
      void pdpHeroGrid.offsetWidth;
      requestAnimationFrame(() => {
        pdpHeroGrid.classList.add("is-entered");
      });
    }

    // Scroll-triggered stagger for "Goes Well With" (threshold: 0.15, once: true)
    if (pdpUpsellSection) {
      if ("IntersectionObserver" in window) {
        const upsellObserver = new IntersectionObserver(
          (entries, observer) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-in-view");
                observer.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.15 }
        );
        upsellObserver.observe(pdpUpsellSection);
      } else {
        pdpUpsellSection.classList.add("is-in-view");
      }
    }

    function computeUnitPrice() {
      if (!activeProduct) return 0;
      const modifiersTotal = (activeProduct.optionGroups || []).reduce((sum, group, gIdx) => {
        const chosenIdx = selectedOptionIndices[gIdx] ?? 0;
        const chosenOption = group.options[chosenIdx];
        return sum + (chosenOption ? chosenOption.delta : 0);
      }, 0);
      return activeProduct.basePrice + modifiersTotal;
    }

    function updateLivePriceDisplay(shouldPulse = false) {
      const total = computeUnitPrice() * currentQty;
      if (pdpLivePriceBadge) {
        pdpLivePriceBadge.textContent = formatPrice(total);
        if (shouldPulse) {
          pdpLivePriceBadge.classList.remove("is-popped");
          void pdpLivePriceBadge.offsetWidth;
          pdpLivePriceBadge.classList.add("is-popped");
        }
      }
    }

    function renderOptionGroups() {
      const groups = activeProduct.optionGroups || [];

      if (groups.length === 0) {
        pdpOptionsStack.hidden = true;
        pdpOptionsStack.innerHTML = "";
        return;
      }

      pdpOptionsStack.hidden = false;
      pdpOptionsStack.innerHTML = groups
        .map((group, gIdx) => {
          const activeOptIdx = selectedOptionIndices[gIdx] ?? 0;
          return `
            <div class="pdp-option-group" data-group-index="${gIdx}">
              <span class="pdp-option-label">${group.name}</span>
              <div class="pdp-option-pills" role="radiogroup" aria-label="${group.name}">
                ${group.options
                  .map((opt, oIdx) => {
                    const isSelected = oIdx === activeOptIdx;
                    const deltaMarkup =
                      opt.delta > 0
                        ? `<span class="pdp-option-delta">+${opt.delta}</span>`
                        : "";
                    return `
                      <button
                        type="button"
                        class="pdp-option-pill${isSelected ? " is-active" : ""}"
                        data-group-idx="${gIdx}"
                        data-opt-idx="${oIdx}"
                        role="radio"
                        aria-checked="${isSelected ? "true" : "false"}"
                      >
                        <span>${opt.label}</span>
                        ${deltaMarkup}
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            </div>
          `;
        })
        .join("");
    }

    function renderUpsellSection() {
      if (!pdpUpsellGrid || !activeProduct) return;

      const recIds = (activeProduct.recommendedIds || [])
        .filter((recId) => recId !== activeProduct.id && SHARED_MENU_ITEMS[recId])
        .slice(0, 3);

      const alternatingThemes = ["theme-red", "theme-cream", "theme-yellow"];

      pdpUpsellGrid.innerHTML = recIds
        .map((recId, idx) =>
          buildMenuCardHTML(
            SHARED_MENU_ITEMS[recId],
            idx,
            alternatingThemes[idx % alternatingThemes.length]
          )
        )
        .join("");

      if (typeof syncMenuCardButtons === "function") {
        syncMenuCardButtons();
      }
    }

    function loadProductById(productId, { updateUrl = true } = {}) {
      const target =
        SHARED_MENU_ITEMS[productId] ||
        SHARED_MENU_ITEMS["tenders-meal"] ||
        SHARED_MENU_LIST[0];

      activeProduct = target;
      selectedOptionIndices = (target.optionGroups || []).map(() => 0);
      currentQty = 1;

      document.title = IS_AR
        ? `${target.title} — توميز | أجمد برجر وبيتزا في أسيوط`
        : `${target.title} — Toomy's | Asyut's Ultimate Burger & Pizza Spot`;

      if (pdpBadge) pdpBadge.textContent = target.badge;
      if (pdpImage) {
        pdpImage.src = target.image;
        pdpImage.alt = target.title;
      }
      if (pdpBackLink) {
        pdpBackLink.href = `menu.html?cat=${encodeURIComponent(target.category)}`;
      }
      if (pdpBackLabel) {
        pdpBackLabel.textContent = IS_AR
          ? `ارجع لقسم ${target.categoryLabel || target.category}`
          : `Back to ${target.categoryLabel || target.category}`;
      }
      if (pdpTitle) pdpTitle.textContent = target.title;
      if (pdpSubtitle) pdpSubtitle.textContent = target.subtitle;
      if (pdpDesc) pdpDesc.textContent = target.description;

      const chips = target.includedChips || [];
      if (chips.length === 0) {
        pdpChipsRow.hidden = true;
        pdpChipsRow.innerHTML = "";
      } else {
        pdpChipsRow.hidden = false;
        pdpChipsRow.innerHTML = chips
          .map((chip) => `<span class="pdp-chip">${chip}</span>`)
          .join("");
      }

      if (pdpQtyVal) pdpQtyVal.textContent = "1";
      clearTimeout(pdpAddToCartBtn._addedTimer);
      pdpAddToCartBtn.classList.remove("is-added");
      if (pdpAddLabel) pdpAddLabel.textContent = t("Add to Cart", "ضيف للأوردر");

      renderOptionGroups();
      updateLivePriceDisplay(false);
      renderUpsellSection();
      playHeroEntrance();


      if (updateUrl && window.history && window.history.replaceState) {
        const url = new URL(window.location.href);
        url.searchParams.set("id", target.id);
        window.history.replaceState({ id: target.id }, "", url.toString());
      }
    }

    // Option pill selection (200ms transition + subtle price pulse)
    pdpOptionsStack.addEventListener("click", (e) => {
      const pill = e.target.closest(".pdp-option-pill");
      if (!pill) return;

      const gIdx = Number(pill.dataset.groupIdx);
      const oIdx = Number(pill.dataset.optIdx);
      if (Number.isNaN(gIdx) || Number.isNaN(oIdx)) return;

      if (selectedOptionIndices[gIdx] === oIdx) return;
      selectedOptionIndices[gIdx] = oIdx;

      const groupEl = pdpOptionsStack.querySelector(`[data-group-index="${gIdx}"]`);
      if (groupEl) {
        groupEl.querySelectorAll(".pdp-option-pill").forEach((btn, idx) => {
          const active = idx === oIdx;
          btn.classList.toggle("is-active", active);
          btn.setAttribute("aria-checked", active ? "true" : "false");
        });
      }

      updateLivePriceDisplay(true);
    });

    // Quantity stepper (- / +)
    if (pdpQtyDec) {
      pdpQtyDec.addEventListener("click", () => {
        if (currentQty <= 1) return;
        currentQty -= 1;
        pdpQtyVal.textContent = currentQty;
        pdpQtyVal.classList.remove("is-popped");
        void pdpQtyVal.offsetWidth;
        pdpQtyVal.classList.add("is-popped");
        updateLivePriceDisplay(true);
      });
    }

    if (pdpQtyInc) {
      pdpQtyInc.addEventListener("click", () => {
        currentQty += 1;
        pdpQtyVal.textContent = currentQty;
        pdpQtyVal.classList.remove("is-popped");
        void pdpQtyVal.offsetWidth;
        pdpQtyVal.classList.add("is-popped");
        updateLivePriceDisplay(true);
      });
    }

    // Add to Cart with "Added ✓" feedback & top-right CART pill scale(1.12 -> 1) pop
    if (pdpAddToCartBtn) {
      pdpAddToCartBtn.addEventListener("click", () => {
        if (!activeProduct) return;

        const chosenLabels = (activeProduct.optionGroups || [])
          .map((group, gIdx) => {
            const opt = group.options[selectedOptionIndices[gIdx] ?? 0];
            return opt ? opt.label : null;
          })
          .filter(Boolean);

        const variantSummary =
          chosenLabels.length > 0 ? chosenLabels.join(" · ") : t("Standard", "عادي");
        const unitPrice = computeUnitPrice();

        let storedCart = [];
        try {
          const parsed = JSON.parse(localStorage.getItem("toomys_cart_v1"));
          if (Array.isArray(parsed)) storedCart = parsed;
        } catch {
          storedCart = [];
        }

        const existing = storedCart.find(
          (item) => item.title === activeProduct.title && item.sub === variantSummary
        );
        if (existing) {
          existing.qty += currentQty;
        } else {
          storedCart.push({
            title: activeProduct.title,
            price: unitPrice,
            image: activeProduct.image,
            sub: variantSummary,
            qty: currentQty
          });
        }

        try {
          localStorage.setItem("toomys_cart_v1", JSON.stringify(storedCart));
        } catch {
          // Ignore storage quota errors
        }

        const totalItemsCount = storedCart.reduce((sum, i) => sum + i.qty, 0);
        const badgeEl = document.getElementById("cartCountBadge");
        const toggleEl = document.getElementById("cartToggle");
        if (badgeEl) {
          badgeEl.textContent = totalItemsCount;
          badgeEl.classList.add("has-items");
        }
        if (toggleEl) {
          toggleEl.classList.add("has-items");
          toggleEl.classList.remove("is-pdp-popping");
          void toggleEl.offsetWidth;
          toggleEl.classList.add("is-pdp-popping");
        }

        window.dispatchEvent(new CustomEvent("toomys:cart-sync"));

        pdpAddToCartBtn.classList.add("is-added");
        if (pdpAddLabel) pdpAddLabel.textContent = t("Added \u2713", "اتضاف \u2713");
        clearTimeout(pdpAddToCartBtn._addedTimer);
        pdpAddToCartBtn._addedTimer = setTimeout(() => {
          pdpAddToCartBtn.classList.remove("is-added");
          if (pdpAddLabel) pdpAddLabel.textContent = t("Add to Cart", "ضيف للأوردر");
        }, 1500);
      });
    }

    // Clicking any "Goes Well With" card loads that item & replays the staggered hero entrance
    pdpUpsellGrid.addEventListener("click", (e) => {
      if (e.target.closest(".menu-card-cta, [data-card-step]")) return;

      const qvTrigger = e.target.closest("[data-qv-id]");
      if (qvTrigger) {
        e.preventDefault();
        e.stopPropagation();
        if (typeof window.openToomysQuickView === "function") {
          window.openToomysQuickView(qvTrigger.dataset.qvId);
        }
        return;
      }

      const card = e.target.closest(".menu-card");
      if (!card) return;

      const nextId = card.dataset.id;
      if (nextId && SHARED_MENU_ITEMS[nextId]) {
        e.preventDefault();
        loadProductById(nextId, { updateUrl: true });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });

    // Initial page load hydration + staggered entrance
    const initialProductId =
      new URLSearchParams(window.location.search).get("id")?.toLowerCase() || "tenders-meal";
    loadProductById(initialProductId, { updateUrl: false });
  }

  /* =========================================
     NEWSLETTER PAGE: TICKET ENTRANCE
     ========================================= */
  const newsletterMain = document.getElementById("newsletterMain");
  if (newsletterMain) {
    newsletterMain.classList.add("is-ready");
    const enterNewsletter = () =>
      requestAnimationFrame(() => {
        requestAnimationFrame(() => newsletterMain.classList.add("is-entered"));
      });

    // The newsletter now sits below the contact section: play its entrance on scroll
    if ("IntersectionObserver" in window) {
      const newsletterObserver = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            enterNewsletter();
            newsletterObserver.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      newsletterObserver.observe(newsletterMain);
    } else {
      enterNewsletter();
    }
  }

  /* =========================================
     ABOUT US PAGE: SCROLL-TRIGGERED STAGGER
     ========================================= */
  const aboutStorySection = document.getElementById("aboutStorySection");
  if (aboutStorySection) {
    aboutStorySection.classList.add("is-ready");

    if ("IntersectionObserver" in window) {
      let aboutObserver;
      requestAnimationFrame(() => {
        aboutObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                aboutStorySection.classList.add("is-in-view");
                if (aboutObserver) aboutObserver.disconnect();
              }
            });
          },
          { threshold: 0.12 }
        );
        aboutObserver.observe(aboutStorySection);
      });
    } else {
      aboutStorySection.classList.add("is-in-view");
    }
  }
});
/* =========================================================
   CALM MOTION LAYER — soft scroll reveals + page fades
   ========================================================= */
(function () {
  "use strict";

  const reduceMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initSoftReveal() {
    // Auto-tag shared sections so every page gets the same gentle entrance
    const AUTO_TARGETS = [".menu-stars-header", ".star-card", ".footer-top-group"];
    AUTO_TARGETS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el, i) => {
        if (el.classList.contains("js-soft-reveal")) return;
        el.classList.add("js-soft-reveal");
        if (!el.style.getPropertyValue("--reveal-delay")) {
          el.style.setProperty("--reveal-delay", String(Math.min(i, 5)));
        }
      });
    });

    const targets = document.querySelectorAll(".js-soft-reveal");
    if (!targets.length || reduceMotion || !("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }

    document.documentElement.classList.add("has-soft-reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  function initPageFades() {
    if (reduceMotion) return;

    document.addEventListener("click", (e) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const link = e.target.closest("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(link.href, window.location.href);
      const samePage =
        url.pathname === window.location.pathname && url.search === window.location.search;
      if (url.origin !== window.location.origin || samePage || !/\.html?$|\/$/.test(url.pathname)) {
        return;
      }

      e.preventDefault();
      document.body.classList.add("is-leaving");
      setTimeout(() => {
        window.location.href = url.href;
      }, 200);
    });

    // Coming back via the browser's back button restores the page from cache — un-fade it
    window.addEventListener("pageshow", (e) => {
      if (e.persisted) document.body.classList.remove("is-leaving");
    });
  }

  function boot() {
    initSoftReveal();
    initPageFades();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();

/* =========================================================
   CONTACT PAGE — INTERACTIVE TABLET (iOS-style)
   Home screen ⇄ Maps ⇄ Contact card, live Cairo clock,
   and an "Open now / Closed" status from the real hours.
   ========================================================= */
(function () {
  "use strict";

  function boot() {
    const tablet = document.getElementById("contactTablet");
    if (!tablet) return;

    const screen = tablet.querySelector(".tablet-screen");
    const views = screen.querySelectorAll(".ios-view");
    const mapFrame = screen.querySelector(".ios-maps-frame");
    const isAr = Boolean(window.TOOMYS_I18N && window.TOOMYS_I18N.isAr);
    const t = (en, ar) => (isAr ? ar : en);

    /* ---------- Reviews data (edit here with real Google reviews) ---------- */
    const GOOGLE_REVIEW_URL = "https://www.google.com/maps/search/?api=1&query=27.18261,31.18335";
    const TABLET_REVIEWS = [
      {
        nameEn: "Karim Hassan",
        nameAr: "كريم حسن",
        stars: 5,
        dateEn: "2 days ago",
        dateAr: "من يومين",
        textEn: "Best smash burger in Asyut hands down. Crispy lacy edges and the Toomy sauce hits different.",
        textAr: "أجمد سماش برجر في أسيوط كلها بجد. الأطراف مقرمشة والصوص حكاية لوحدها."
      },
      {
        nameEn: "Salma El-Masry",
        nameAr: "سلمى المصري",
        stars: 5,
        dateEn: "5 days ago",
        dateAr: "من 5 أيام",
        textEn: "Popcorn chicken pizza arrived piping hot and loaded with mozzarella. Totally worth it.",
        textAr: "بيتزا البوب كورن تشيكن وصلت سخنة نار ومليانة موتزاريلا بتشد.. تستاهل كل جنيه."
      },
      {
        nameEn: "Omar Khaled",
        nameAr: "عمر خالد",
        stars: 5,
        dateEn: "1 week ago",
        dateAr: "من أسبوع",
        textEn: "Tenders meal is huge and super crunchy, even after delivery to El Gomhoureya St.",
        textAr: "وجبة التندرز كبيرة ومقرمشة جدًا حتى بعد ما وصلت دليفري، الشغل نضيف أوي."
      },
      {
        nameEn: "Nourhan Adel",
        nameAr: "نورهان عادل",
        stars: 5,
        dateEn: "2 weeks ago",
        dateAr: "من أسبوعين",
        textEn: "Cheesy Burger Boom is literally flooded with warm cheddar. Friendly crew at Abrag El Nasr.",
        textAr: "التشيزي برجر بوم غرقان شيدر سخن، والتعامل في فرع أبراج النصر محترم وسريع."
      },
      {
        nameEn: "Mostafa Gamal",
        nameAr: "مصطفى جمال",
        stars: 5,
        dateEn: "3 weeks ago",
        dateAr: "من 3 أسابيع",
        textEn: "Basmati Chicken bowl + Garlic & Toomy sauce is my late-night go-to every weekend.",
        textAr: "بولة البسمتي تشيكن مع التومية وصوص تومي ده عشاي المفضل كل ويك إند."
      }
    ];

    /* ---------- Real food photos (assets/Toomy's/images) ---------- */
    const GALLERY_PHOTOS = [
      "527069758_122126197880875441_735373576061130978_n.webp",
      "700641860_122170220090875441_6140530138794888347_n.webp",
      "703665496_122170220192875441_5277967330441624194_n.webp",
      "722223957_122173891394875441_8474957666186635188_n.webp",
      "732152407_122174901338875441_8299308441862567738_n.webp",
      "733832071_122175477944875441_1176622025684298745_n.webp",
      "757596530_122178513536875441_3934693628064378486_n.webp",
      "758252970_122178513560875441_8168361152005431301_n.webp",
      "758964301_122178868928875441_6993247707368304347_n.webp",
      "758964336_122178868904875441_8797335942860829148_n.webp",
      "758964354_122178869012875441_3056657179883538300_n.webp",
      "759446357_122178869066875441_4516403337306784274_n.webp",
      "774105550_122180992118875441_8742329588433856476_n.webp",
      "784233050_122181859046875441_529429058009069908_n.webp",
      "811711223_122184457148875441_4520686450416769790_n.webp",
      "825281831_122185942682875441_8052912206953711533_n.webp",
      "825350938_122186959550875441_6129030293154257138_n.webp",
      "825351263_122186959424875441_5688030746624403478_n.webp",
      "833346720_122186960186875441_8340577585048214447_n.webp",
      "886056986_122191061612875441_7090721438276183366_n.webp"
    ];

    /* ---------- Scratch & Win prizes ---------- */
    const SCRATCH_PRIZES = [
      { code: "TOOMY15", emoji: "🔥", en: "15% OFF your order", ar: "خصم 15% على أوردرك" },
      { code: "FREEFRIES", emoji: "🍟", en: "Free Golden Fries", ar: "بطاطس دهبي ببلاش" },
      { code: "TOOMY25", emoji: "🍔", en: "25 EGP OFF your order", ar: "خصم 25 جنيه على أوردرك" },
      { code: "TOOMY10", emoji: "🍕", en: "10% OFF your order", ar: "خصم 10% على أوردرك" }
    ];

    /* ---------- App switching ---------- */
    function setApp(name, originEl) {
      if (originEl) {
        const s = screen.getBoundingClientRect();
        const r = originEl.getBoundingClientRect();
        const ox = (((r.left + r.width / 2 - s.left) / s.width) * 100).toFixed(1) + "%";
        const oy = (((r.top + r.height / 2 - s.top) / s.height) * 100).toFixed(1) + "%";
        views.forEach((v) => {
          v.style.setProperty("--ox", ox);
          v.style.setProperty("--oy", oy);
        });
      }

      // Only load the real map the first time Maps is opened
      if (name === "maps" && mapFrame && !mapFrame.getAttribute("src")) {
        mapFrame.setAttribute("src", mapFrame.dataset.src);
      }

      // Portrait screens: open the place sheet half-way so the pin stays visible
      if (name === "maps" && screen.dataset.activeApp !== "maps") {
        const panel = screen.querySelector(".ios-maps-panel");
        const toggle = panel && panel.querySelector("[data-sheet-toggle]");
        const portrait = screen.clientHeight > screen.clientWidth;
        if (panel) panel.dataset.sheet = portrait ? "peek" : "full";
        if (toggle) {
          toggle.setAttribute(
            "aria-label",
            portrait ? t("Show more details", "اعرض تفاصيل أكتر") : t("Show fewer details", "اعرض تفاصيل أقل")
          );
        }
      }

      if (name !== "photos") closePhotoLightbox();

      screen.dataset.activeApp = name;
      views.forEach((v) => {
        const on = v.dataset.view === name;
        v.inert = !on;
        v.setAttribute("aria-hidden", String(!on));
      });

      if (name === "chat") onChatOpen();
      if (name === "scratch") initScratchApp();
      if (name === "photos") initPhotosApp();
      if (name === "reviews") initReviewsApp();
    }

    /* ---------- WhatsApp-style chat ---------- */
    const WA_NUMBER = "201040078750";
    const chatThread = screen.querySelector("[data-wa-thread]");
    const chatForm = screen.querySelector("[data-wa-form]");
    const chatInput = chatForm && chatForm.querySelector(".wa-input");
    const typingEl = screen.querySelector("[data-wa-typing]");
    const greetingEl = screen.querySelector("[data-wa-greeting]");
    const chipsEl = screen.querySelector("[data-wa-chips]");
    const reduceMotion =
      window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let chatGreeted = false;

    function cairoClock() {
      return new Intl.DateTimeFormat(isAr ? "ar-EG-u-nu-latn" : "en-US", {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Africa/Cairo"
      }).format(new Date());
    }

    function scrollThread() {
      if (chatThread) chatThread.scrollTo({ top: chatThread.scrollHeight, behavior: reduceMotion ? "auto" : "smooth" });
    }

    function syncSendState() {
      if (chatForm && chatInput) chatForm.classList.toggle("is-empty", !chatInput.value.trim());
    }

    function getCartItemsSafe() {
      try {
        const parsed = JSON.parse(localStorage.getItem("toomys_cart_v1"));
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }

    function syncWhatsAppCartChip() {
      if (!chipsEl) return;
      const existing = chipsEl.querySelector("[data-wa-cart-chip]");
      if (existing) existing.remove();

      const items = getCartItemsSafe();
      if (items.length === 0) return;

      const totalQty = items.reduce((sum, i) => sum + (i.qty || 1), 0);
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "wa-chip wa-chip-cart";
      chip.setAttribute("data-wa-chip", "");
      chip.setAttribute("data-wa-cart-chip", "");
      chip.textContent = isAr
        ? `ابعت الأوردر اللي في السلة 🛒 (${totalQty})`
        : `Send my cart order 🛒 (${totalQty})`;
      chipsEl.prepend(chip);
    }

    function buildWhatsAppCartMessage() {
      const items = getCartItemsSafe();
      if (items.length === 0) return "";
      const lines = items
        .map((i) => `• ${i.qty || 1}× ${i.title}${i.sub ? ` (${i.sub})` : ""}`)
        .join("\n");
      const subtotal = items.reduce((sum, i) => sum + (i.price || 0) * (i.qty || 1), 0);
      let reward = null;
      try {
        reward = JSON.parse(localStorage.getItem(SCRATCH_REWARD_KEY));
      } catch {}

      if (isAr) {
        let msg = `عايز أطلب الأوردر ده:\n${lines}\nالمجموع: ${subtotal.toLocaleString("en-US")} جنيه`;
        if (reward && reward.unlocked && reward.code) msg += `\nكود الخصم: ${reward.code}`;
        msg += `\nالعنوان: `;
        return msg;
      }

      let msg = `I'd like to order:\n${lines}\nSubtotal: ${subtotal.toLocaleString("en-US")} EGP`;
      if (reward && reward.unlocked && reward.code) msg += `\nPromo code: ${reward.code}`;
      msg += `\nAddress: `;
      return msg;
    }

    function onChatOpen() {
      syncWhatsAppCartChip();

      // Desktop: put the cursor in the box. Phones: don't pop the keyboard uninvited.
      if (chatInput && window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
        setTimeout(() => chatInput.focus({ preventScroll: true }), 420);
      }
      if (chatGreeted || !greetingEl) {
        if (chipsEl && getCartItemsSafe().length > 0) chipsEl.hidden = false;
        return;
      }
      chatGreeted = true;

      const nowEl = greetingEl.querySelector("[data-wa-now]");
      if (nowEl) nowEl.textContent = cairoClock();

      const reveal = () => {
        if (typingEl) typingEl.hidden = true;
        greetingEl.hidden = false;
        if (chipsEl) chipsEl.hidden = false;
        scrollThread();
      };

      if (reduceMotion) {
        reveal();
      } else {
        if (typingEl) typingEl.hidden = false;
        setTimeout(reveal, 1100);
      }
    }

    window.addEventListener("toomys:cart-sync", syncWhatsAppCartChip);
    window.addEventListener("storage", (e) => {
      if (e.key === "toomys_cart_v1") syncWhatsAppCartChip();
    });

    // Typing indicator is hidden until the chat is first opened
    if (typingEl) typingEl.hidden = true;

    if (chatInput) {
      chatInput.addEventListener("input", syncSendState);
      syncSendState();
    }

    if (chipsEl && chatInput) {
      chipsEl.addEventListener("click", (e) => {
        const chip = e.target.closest("[data-wa-chip]");
        if (!chip) return;
        chatInput.value = chip.hasAttribute("data-wa-cart-chip")
          ? buildWhatsAppCartMessage()
          : chip.textContent.trim();
        syncSendState();
        chatInput.focus({ preventScroll: true });
        if (typeof chatInput.setSelectionRange === "function") {
          const len = chatInput.value.length;
          chatInput.setSelectionRange(len, len);
        }
      });
    }

    if (chatForm && chatInput && chatThread) {
      chatForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();

        if (!message) {
          chatForm.classList.remove("is-shake");
          void chatForm.offsetWidth; // restart the nudge animation
          chatForm.classList.add("is-shake");
          chatInput.focus({ preventScroll: true });
          return;
        }

        // Open WhatsApp first, while the click still counts as a user action (avoids popup blockers)
        const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
        const win = window.open(url, "_blank");
        if (win) {
          win.opener = null;
        } else {
          window.location.href = url;
        }

        // Show the sent bubble in the tablet
        const bubble = document.createElement("div");
        bubble.className = "wa-bubble wa-out";
        const text = document.createElement("span");
        text.className = "wa-text";
        text.textContent = message;
        const meta = document.createElement("span");
        meta.className = "wa-meta";
        meta.innerHTML =
          `<span class="wa-time"></span>` +
          `<svg class="wa-ticks" viewBox="0 0 18 12" aria-hidden="true"><path d="M1 6.5l3.2 3.2L11 2.5M7.5 9.2l.5.5L15 2.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        meta.querySelector(".wa-time").textContent = cairoClock();
        bubble.append(text, meta);
        chatThread.appendChild(bubble);
        if (chipsEl) chipsEl.hidden = true;

        chatInput.value = "";
        syncSendState();
        scrollThread();
        setTimeout(() => bubble.classList.add("is-read"), 900);
      });
    }

    /* ---------- Scratch & Win app ---------- */
    const scratchWrap = screen.querySelector("[data-scratch-wrap]");
    const scratchCanvas = screen.querySelector("[data-scratch-canvas]");
    const scratchEmoji = screen.querySelector("[data-scratch-emoji]");
    const scratchHeadline = screen.querySelector("[data-scratch-headline]");
    const scratchCodeEl = screen.querySelector("[data-scratch-code]");
    const scratchHint = screen.querySelector("[data-scratch-hint]");
    const scratchForm = screen.querySelector("[data-scratch-form]");
    const scratchPhone = screen.querySelector("#scratchPhone");
    const scratchError = screen.querySelector("[data-scratch-error]");
    const scratchUnlocked = screen.querySelector("[data-scratch-unlocked]");
    const scratchCopyBtn = screen.querySelector("[data-scratch-copy]");

    let scratchReward = null;
    let scratchScratched = false;
    let scratchFoilDrawn = false;

    function loadOrCreateScratchReward() {
      try {
        const saved = JSON.parse(localStorage.getItem(SCRATCH_REWARD_KEY));
        if (saved && saved.code && SCRATCH_PRIZES.some((p) => p.code === saved.code)) {
          return saved;
        }
      } catch {}
      const pick = SCRATCH_PRIZES[Math.floor(Math.random() * SCRATCH_PRIZES.length)];
      const fresh = { code: pick.code, unlocked: false };
      try {
        localStorage.setItem(SCRATCH_REWARD_KEY, JSON.stringify(fresh));
      } catch {}
      return fresh;
    }

    function saveScratchReward(next) {
      scratchReward = next;
      try {
        localStorage.setItem(SCRATCH_REWARD_KEY, JSON.stringify(next));
      } catch {}
    }

    function renderScratchState() {
      if (!scratchReward) scratchReward = loadOrCreateScratchReward();
      const prize = SCRATCH_PRIZES.find((p) => p.code === scratchReward.code) || SCRATCH_PRIZES[0];

      if (scratchEmoji) scratchEmoji.textContent = prize.emoji;
      if (scratchHeadline) scratchHeadline.textContent = isAr ? prize.ar : prize.en;

      if (scratchReward.unlocked) {
        scratchScratched = true;
        if (scratchCodeEl) {
          scratchCodeEl.textContent = scratchReward.code;
          scratchCodeEl.classList.remove("is-locked");
        }
        if (scratchCanvas) scratchCanvas.classList.add("is-revealed");
        if (scratchHint) scratchHint.hidden = true;
        if (scratchForm) scratchForm.hidden = true;
        if (scratchUnlocked) scratchUnlocked.hidden = false;
      } else if (scratchScratched) {
        if (scratchCodeEl) {
          scratchCodeEl.textContent = "••••••••";
          scratchCodeEl.classList.add("is-locked");
        }
        if (scratchCanvas) scratchCanvas.classList.add("is-revealed");
        if (scratchHint) scratchHint.hidden = true;
        if (scratchForm) scratchForm.hidden = false;
        if (scratchUnlocked) scratchUnlocked.hidden = true;
      } else {
        if (scratchCodeEl) {
          scratchCodeEl.textContent = "••••••••";
          scratchCodeEl.classList.add("is-locked");
        }
        if (scratchCanvas) scratchCanvas.classList.remove("is-revealed");
        if (scratchHint) scratchHint.hidden = false;
        if (scratchForm) scratchForm.hidden = true;
        if (scratchUnlocked) scratchUnlocked.hidden = true;
      }
    }

    function spawnScratchConfetti() {
      if (!scratchWrap || reduceMotion) return;
      const box = document.createElement("div");
      box.className = "scratch-confetti";
      const colors = ["#e3262e", "#f5b727", "#246b35", "#007aff", "#ff9f0a"];
      for (let i = 0; i < 16; i++) {
        const dot = document.createElement("span");
        dot.className = "scratch-confetti-dot";
        const angle = (Math.PI * 2 * i) / 16;
        const dist = 48 + Math.random() * 68;
        dot.style.left = "50%";
        dot.style.top = "50%";
        dot.style.backgroundColor = colors[i % colors.length];
        dot.style.setProperty("--tx", `${Math.round(Math.cos(angle) * dist)}px`);
        dot.style.setProperty("--ty", `${Math.round(Math.sin(angle) * dist)}px`);
        box.appendChild(dot);
      }
      scratchWrap.appendChild(box);
      setTimeout(() => box.remove(), 820);
    }

    function drawScratchFoil() {
      if (!scratchCanvas || !scratchWrap || scratchFoilDrawn) return;
      const rect = scratchWrap.getBoundingClientRect();
      if (rect.width < 12 || rect.height < 12) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      scratchCanvas.width = Math.round(w * dpr);
      scratchCanvas.height = Math.round(h * dpr);

      const ctx = scratchCanvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#f8d468");
      grad.addColorStop(0.35, "#eab308");
      grad.addColorStop(0.65, "#f5b727");
      grad.addColorStop(1, "#d97706");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
      ctx.lineWidth = 6;
      for (let x = -h; x < w + h; x += 22) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + h, h);
        ctx.stroke();
      }

      ctx.fillStyle = "#5c3900";
      ctx.font = `800 ${Math.max(13, Math.round(w * 0.055))}px Cairo, "Plus Jakarta Sans", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(t("Scratch here ✨", "اكشط هنا ✨"), w / 2, h / 2);
      scratchFoilDrawn = true;
    }

    function initScratchApp() {
      scratchReward = loadOrCreateScratchReward();
      renderScratchState();
      if (!scratchReward.unlocked && !scratchScratched && !scratchFoilDrawn) {
        requestAnimationFrame(drawScratchFoil);
      }
    }

    if (scratchCanvas) {
      let isScratching = false;
      let lastPt = null;
      let moveCount = 0;

      const eraseAt = (e) => {
        const rect = scratchCanvas.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        const x = ((e.clientX - rect.left) / rect.width) * (scratchCanvas.width / Math.min(window.devicePixelRatio || 1, 2));
        const y = ((e.clientY - rect.top) / rect.height) * (scratchCanvas.height / Math.min(window.devicePixelRatio || 1, 2));
        const ctx = scratchCanvas.getContext("2d");
        if (!ctx) return;

        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        ctx.fillStyle = "#000";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 42;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.arc(x, y, 21, 0, Math.PI * 2);
        ctx.fill();

        if (lastPt) {
          ctx.beginPath();
          ctx.moveTo(lastPt.x, lastPt.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        ctx.restore();
        lastPt = { x, y };
      };

      const checkScratchProgress = () => {
        if (scratchScratched) return;
        const ctx = scratchCanvas.getContext("2d");
        if (!ctx || !scratchCanvas.width || !scratchCanvas.height) return;
        try {
          const data = ctx.getImageData(0, 0, scratchCanvas.width, scratchCanvas.height).data;
          let cleared = 0;
          let total = 0;
          for (let i = 3; i < data.length; i += 64) {
            total += 1;
            if (data[i] < 128) cleared += 1;
          }
          if (total > 0 && cleared / total >= 0.42) {
            scratchScratched = true;
            isScratching = false;
            spawnScratchConfetti();
            renderScratchState();
          }
        } catch {}
      };

      scratchCanvas.addEventListener("pointerdown", (e) => {
        if (scratchScratched || (scratchReward && scratchReward.unlocked)) return;
        isScratching = true;
        lastPt = null;
        moveCount = 0;
        try {
          scratchCanvas.setPointerCapture(e.pointerId);
        } catch {}
        eraseAt(e);
      });

      scratchCanvas.addEventListener("pointermove", (e) => {
        if (!isScratching) return;
        eraseAt(e);
        moveCount += 1;
        if (moveCount % 6 === 0) checkScratchProgress();
      });

      const stopScratch = () => {
        if (!isScratching) return;
        isScratching = false;
        lastPt = null;
        checkScratchProgress();
      };

      scratchCanvas.addEventListener("pointerup", stopScratch);
      scratchCanvas.addEventListener("pointercancel", stopScratch);
    }

    if (scratchForm && scratchPhone) {
      scratchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const raw = scratchPhone.value.replace(/\s+/g, "");
        const valid = /^(\+20|0)?1[0125][0-9]{8}$/.test(raw);
        if (!valid) {
          if (scratchError) {
            scratchError.textContent = t(
              "Enter a valid Egyptian number (e.g. 010XXXXXXXX).",
              "اكتب رقم موبايل مصري مظبوط (مثلًا 010XXXXXXXX)."
            );
          }
          scratchPhone.focus();
          return;
        }
        if (scratchError) scratchError.textContent = "";

        if (!scratchReward) scratchReward = loadOrCreateScratchReward();
        try {
          const leads = JSON.parse(localStorage.getItem(NEWSLETTER_LEADS_KEY)) || [];
          if (!leads.some((l) => l.phone === raw)) {
            leads.unshift({ phone: raw, source: "scratch", code: scratchReward.code, at: new Date().toISOString() });
            localStorage.setItem(NEWSLETTER_LEADS_KEY, JSON.stringify(leads.slice(0, 50)));
          }
        } catch {}

        saveScratchReward({ ...scratchReward, unlocked: true, phone: raw });
        renderScratchState();
      });
    }

    if (scratchCopyBtn) {
      scratchCopyBtn.addEventListener("click", () => {
        if (!scratchReward || !scratchReward.code) return;
        const finishCopy = () => {
          scratchCopyBtn.textContent = t("Copied ✓", "اتنسخ ✓");
          clearTimeout(scratchCopyBtn._copyTimer);
          scratchCopyBtn._copyTimer = setTimeout(() => {
            scratchCopyBtn.textContent = t("Copy Code", "انسخ الكود");
          }, 1600);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(scratchReward.code).then(finishCopy).catch(finishCopy);
        } else {
          finishCopy();
        }
      });
    }

    /* ---------- Photos gallery app ---------- */
    const photosGrid = screen.querySelector("[data-photos-grid]");
    const photosCountEl = screen.querySelector("[data-photos-count]");
    const photosLightbox = screen.querySelector("[data-photos-lightbox]");
    const photosLbStage = screen.querySelector("[data-photos-stage]");
    const photosLbImg = screen.querySelector("[data-photos-img]");
    const photosLbCounter = screen.querySelector("[data-photos-counter]");
    const photosLbStrip = screen.querySelector("[data-photos-strip]");
    const photosCloseBtn = screen.querySelector("[data-photos-close]");
    const photosPrevBtn = screen.querySelector("[data-photos-prev]");
    const photosNextBtn = screen.querySelector("[data-photos-next]");

    let photosBuilt = false;
    let activePhotoIdx = 0;

    function openPhotoLightbox(idx) {
      if (!photosLightbox || !photosLbImg) return;
      const len = GALLERY_PHOTOS.length;
      activePhotoIdx = ((idx % len) + len) % len;
      photosLbImg.src = `assets/Toomy's/images/${GALLERY_PHOTOS[activePhotoIdx]}`;
      photosLbImg.alt = t(`Toomy's food photo ${activePhotoIdx + 1}`, `صورة أكل توميز ${activePhotoIdx + 1}`);
      if (photosLbCounter) photosLbCounter.textContent = `${activePhotoIdx + 1} / ${len}`;

      if (photosLbStrip) {
        photosLbStrip.querySelectorAll(".photos-strip-thumb").forEach((btn, i) => {
          const active = i === activePhotoIdx;
          btn.classList.toggle("is-active", active);
          if (active) {
            btn.scrollIntoView({ inline: "center", block: "nearest", behavior: reduceMotion ? "auto" : "smooth" });
          }
        });
      }

      photosLightbox.hidden = false;
      photosLightbox.setAttribute("aria-hidden", "false");
      screen.classList.add("is-lightbox-open");
    }

    function closePhotoLightbox() {
      if (!photosLightbox || photosLightbox.hidden) return;
      photosLightbox.hidden = true;
      photosLightbox.setAttribute("aria-hidden", "true");
      screen.classList.remove("is-lightbox-open");
    }

    function initPhotosApp() {
      if (photosBuilt || !photosGrid) return;
      photosBuilt = true;
      if (photosCountEl) photosCountEl.textContent = String(GALLERY_PHOTOS.length);

      photosGrid.innerHTML = GALLERY_PHOTOS.map(
        (file, i) => `
          <button type="button" class="photos-thumb-btn" data-photo-idx="${i}" aria-label="${t(`Open photo ${i + 1}`, `افتح صورة ${i + 1}`)}">
            <img src="assets/Toomy's/images/${file}" alt="${t(`Toomy's food ${i + 1}`, `أكل توميز ${i + 1}`)}" loading="lazy" decoding="async" draggable="false" />
          </button>
        `
      ).join("");

      if (photosLbStrip) {
        photosLbStrip.innerHTML = GALLERY_PHOTOS.map(
          (file, i) => `
            <button type="button" class="photos-strip-thumb" data-photo-idx="${i}" aria-label="${t(`Photo ${i + 1}`, `صورة ${i + 1}`)}">
              <img src="assets/Toomy's/images/${file}" alt="" loading="lazy" decoding="async" draggable="false" />
            </button>
          `
        ).join("");
      }
    }

    if (photosGrid) {
      photosGrid.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-photo-idx]");
        if (btn) openPhotoLightbox(Number(btn.dataset.photoIdx));
      });
    }

    if (photosLbStrip) {
      photosLbStrip.addEventListener("click", (e) => {
        const btn = e.target.closest("[data-photo-idx]");
        if (btn) openPhotoLightbox(Number(btn.dataset.photoIdx));
      });
    }

    if (photosCloseBtn) photosCloseBtn.addEventListener("click", closePhotoLightbox);
    if (photosPrevBtn) photosPrevBtn.addEventListener("click", () => openPhotoLightbox(activePhotoIdx - 1));
    if (photosNextBtn) photosNextBtn.addEventListener("click", () => openPhotoLightbox(activePhotoIdx + 1));

    if (photosLbStage) {
      let swipeStartX = null;
      photosLbStage.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".photos-lb-nav")) return;
        swipeStartX = e.clientX;
      });
      photosLbStage.addEventListener("pointerup", (e) => {
        if (swipeStartX === null) return;
        const dx = e.clientX - swipeStartX;
        swipeStartX = null;
        if (Math.abs(dx) < 35) return;
        const goNext = isAr ? dx > 0 : dx < 0;
        openPhotoLightbox(activePhotoIdx + (goNext ? 1 : -1));
      });
      photosLbStage.addEventListener("pointercancel", () => {
        swipeStartX = null;
      });
    }

    /* ---------- Google Reviews app ---------- */
    const reviewsListEl = screen.querySelector("[data-reviews-list]");
    const reviewsGoogleBtn = screen.querySelector("[data-reviews-google-btn]");
    let reviewsBuilt = false;

    function initReviewsApp() {
      if (reviewsBuilt || !reviewsListEl) return;
      reviewsBuilt = true;
      if (reviewsGoogleBtn) reviewsGoogleBtn.href = GOOGLE_REVIEW_URL;

      reviewsListEl.innerHTML = TABLET_REVIEWS.map(
        (rev) => `
          <article class="review-card">
            <div class="review-card-top">
              <strong class="review-author">${isAr ? rev.nameAr : rev.nameEn}</strong>
              <span class="review-date">${isAr ? rev.dateAr : rev.dateEn}</span>
            </div>
            <div class="review-stars-row">
              <span class="review-stars" aria-label="${rev.stars} / 5">${"★".repeat(rev.stars)}</span>
              <span class="review-source-pill">Google</span>
            </div>
            <p class="review-quote">${isAr ? rev.textAr : rev.textEn}</p>
          </article>
        `
      ).join("");
    }

    /* ---------- iOS Home Screen drag & rearrange (jiggle mode) ---------- */
    const APP_ORDER_KEY = "toomys_tablet_apps_v1";
    const iosHome = screen.querySelector(".ios-home");
    const iosGrid = screen.querySelector("[data-ios-grid]");
    const jiggleDoneBtn = screen.querySelector("[data-jiggle-done]");
    let isJiggling = false;
    let suppressNextAppClick = false;
    let dragState = null;
    let lastSwapTime = 0;

    function restoreAppOrder() {
      if (!iosGrid) return;
      try {
        const saved = JSON.parse(localStorage.getItem(APP_ORDER_KEY));
        if (!Array.isArray(saved) || saved.length === 0) return;
        const map = new Map();
        iosGrid.querySelectorAll(".ios-app[data-app-id]").forEach((el) => {
          map.set(el.dataset.appId, el);
        });
        saved.forEach((id) => {
          const el = map.get(id);
          if (el) {
            iosGrid.appendChild(el);
            map.delete(id);
          }
        });
        map.forEach((el) => iosGrid.appendChild(el));
      } catch {}
    }

    function saveAppOrder() {
      if (!iosGrid) return;
      const order = Array.from(iosGrid.querySelectorAll(".ios-app[data-app-id]")).map(
        (el) => el.dataset.appId
      );
      try {
        localStorage.setItem(APP_ORDER_KEY, JSON.stringify(order));
      } catch {}
    }

    function setJiggleMode(enabled) {
      isJiggling = enabled;
      screen.classList.toggle("is-jiggling", enabled);
      if (jiggleDoneBtn) jiggleDoneBtn.hidden = !enabled;
    }

    function flipMoveApp(movingEl, targetEl, insertAfter) {
      if (!iosGrid || !movingEl || !targetEl || movingEl === targetEl) return;
      const siblings = Array.from(iosGrid.children);
      const firstRects = new Map();
      siblings.forEach((el) => firstRects.set(el, el.getBoundingClientRect()));

      if (insertAfter) targetEl.after(movingEl);
      else targetEl.before(movingEl);

      siblings.forEach((el) => {
        if (el === movingEl) return;
        const first = firstRects.get(el);
        const last = el.getBoundingClientRect();
        const dx = first.left - last.left;
        const dy = first.top - last.top;
        if (dx || dy) {
          el.style.transition = "none";
          el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
          requestAnimationFrame(() => {
            el.style.transition = "transform 240ms cubic-bezier(0.22, 1, 0.36, 1)";
            el.style.transform = "";
          });
        }
      });
    }

    if (iosGrid && iosHome) {
      restoreAppOrder();

      iosGrid.addEventListener("dragstart", (e) => e.preventDefault());

      const positionGhost = (state, clientX, clientY) => {
        if (!state.ghost || !state.homeRect) return;
        const x = clientX - state.homeRect.left - state.offsetX;
        const y = clientY - state.homeRect.top - state.offsetY;
        state.ghost.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      };

      const startDrag = (state, clientX, clientY) => {
        if (state.active) return;
        state.active = true;
        const appRect = state.app.getBoundingClientRect();
        state.homeRect = iosHome.getBoundingClientRect();
        state.offsetX = clientX - appRect.left;
        state.offsetY = clientY - appRect.top;

        const ghost = state.app.cloneNode(true);
        ghost.classList.add("ios-drag-ghost");
        ghost.style.width = `${appRect.width}px`;
        iosHome.appendChild(ghost);
        state.ghost = ghost;

        state.app.classList.add("is-drag-source");
        positionGhost(state, clientX, clientY);
      };

      iosGrid.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        const app = e.target.closest(".ios-app[data-app-id]");
        if (!app) return;

        dragState = {
          app,
          pointerId: e.pointerId,
          pointerType: e.pointerType,
          startX: e.clientX,
          startY: e.clientY,
          lastX: e.clientX,
          lastY: e.clientY,
          active: false,
          ghost: null,
          homeRect: null,
          offsetX: 0,
          offsetY: 0,
          timer: null
        };

        dragState.timer = setTimeout(() => {
          if (!dragState) return;
          setJiggleMode(true);
          startDrag(dragState, dragState.lastX, dragState.lastY);
        }, 380);
      });

      window.addEventListener("pointermove", (e) => {
        if (!dragState || e.pointerId !== dragState.pointerId) return;
        dragState.lastX = e.clientX;
        dragState.lastY = e.clientY;
        const dist = Math.hypot(e.clientX - dragState.startX, e.clientY - dragState.startY);

        if (!dragState.active) {
          if ((isJiggling && dist > 4) || (dragState.pointerType === "mouse" && dist > 10)) {
            clearTimeout(dragState.timer);
            setJiggleMode(true);
            startDrag(dragState, e.clientX, e.clientY);
          } else if (dist > 12) {
            clearTimeout(dragState.timer);
            dragState = null;
          }
          return;
        }

        positionGhost(dragState, e.clientX, e.clientY);

        const now = performance.now();
        if (now - lastSwapTime < 85) return;

        const children = Array.from(iosGrid.children);
        const draggedIdx = children.indexOf(dragState.app);
        for (let i = 0; i < children.length; i++) {
          const sibling = children[i];
          if (sibling === dragState.app) continue;
          const r = sibling.getBoundingClientRect();
          if (e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) {
            lastSwapTime = now;
            flipMoveApp(dragState.app, sibling, draggedIdx < i);
            break;
          }
        }
      });

      const endAppDrag = (e) => {
        if (!dragState || e.pointerId !== dragState.pointerId) return;
        clearTimeout(dragState.timer);
        if (dragState.active) {
          if (dragState.ghost) dragState.ghost.remove();
          dragState.app.classList.remove("is-drag-source");
          saveAppOrder();
          suppressNextAppClick = true;
          setTimeout(() => {
            suppressNextAppClick = false;
          }, 180);
        }
        dragState = null;
      };

      window.addEventListener("pointerup", endAppDrag);
      window.addEventListener("pointercancel", endAppDrag);

      iosGrid.addEventListener(
        "click",
        (e) => {
          if (suppressNextAppClick || isJiggling) {
            e.preventDefault();
            e.stopPropagation();
          }
        },
        true
      );
    }

    if (jiggleDoneBtn) {
      jiggleDoneBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        setJiggleMode(false);
      });
    }

    // The WhatsApp icon under the tablet opens the chat inside the tablet
    document.querySelectorAll("[data-open-tablet-chat]").forEach((link) => {
      link.addEventListener("click", (e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey) return; // let power users open wa.me directly
        e.preventDefault();
        const origin = screen.querySelector('.ios-dock [data-open-app="chat"]');
        setApp("chat", origin);
        const r = tablet.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) {
          tablet.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
        }
      });
    });

    screen.addEventListener("click", (e) => {
      const opener = e.target.closest("[data-open-app]");
      if (opener) {
        if (isJiggling && opener.closest("[data-ios-grid]")) {
          e.preventDefault();
          return;
        }
        e.preventDefault();
        setApp(opener.dataset.openApp, opener);
        return;
      }

      if (e.target.closest("[data-go-home]")) {
        if (screen.dataset.activeApp === "home" && isJiggling) {
          setJiggleMode(false);
          return;
        }
        setApp("home");
        return;
      }

      if (
        isJiggling &&
        screen.dataset.activeApp === "home" &&
        !e.target.closest(".ios-app, .ios-widget, .ios-jiggle-done")
      ) {
        setJiggleMode(false);
        return;
      }

      const toggle = e.target.closest("[data-sheet-toggle]");
      if (toggle) {
        const panel = toggle.closest(".ios-maps-panel");
        const expand = panel.dataset.sheet !== "full";
        panel.dataset.sheet = expand ? "full" : "peek";
        toggle.setAttribute(
          "aria-label",
          expand ? t("Show fewer details", "اعرض تفاصيل أقل") : t("Show more details", "اعرض تفاصيل أكتر")
        );
      }
    });

    tablet.addEventListener("keydown", (e) => {
      if (photosLightbox && !photosLightbox.hidden) {
        if (e.key === "Escape") {
          closePhotoLightbox();
          return;
        }
        if (e.key === "ArrowLeft") {
          e.preventDefault();
          openPhotoLightbox(activePhotoIdx + (isAr ? 1 : -1));
          return;
        }
        if (e.key === "ArrowRight") {
          e.preventDefault();
          openPhotoLightbox(activePhotoIdx + (isAr ? -1 : 1));
          return;
        }
      }
      if (e.key === "Escape") {
        if (screen.dataset.activeApp !== "home") {
          setApp("home");
        } else if (isJiggling) {
          setJiggleMode(false);
        }
      }
    });

    /* ---------- Live clock + open status (Cairo time) ---------- */
    const timeEls = screen.querySelectorAll("[data-ios-time]");
    const dateEls = screen.querySelectorAll("[data-ios-date]");
    const statusEls = screen.querySelectorAll("[data-open-status-text]");
    const statusWrap = screen.querySelectorAll("[data-open-status]");
    const locale = isAr ? "ar-EG-u-nu-latn" : "en-US";
    const TZ = "Africa/Cairo";

    function tick() {
      const now = new Date();

      const timeText = new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone: TZ })
        .formatToParts(now)
        .filter((p) => p.type !== "dayPeriod")
        .map((p) => p.value)
        .join("")
        .trim();

      const dateText = new Intl.DateTimeFormat(locale, {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: TZ
      }).format(now);

      const hour = Number(
        new Intl.DateTimeFormat("en-US", { hour: "numeric", hourCycle: "h23", timeZone: TZ }).format(now)
      );

      // Open daily 2:00 PM – 2:00 AM
      const isOpen = hour >= 14 || hour < 2;

      timeEls.forEach((el) => (el.textContent = timeText));
      dateEls.forEach((el) => (el.textContent = dateText));
      statusEls.forEach((el) => {
        el.textContent = isOpen
          ? t("Open now", "فاتحين دلوقتي")
          : t("Closed · opens 2 PM", "مقفولين · بنفتح 2 الضهر");
        el.classList.toggle("is-closed", !isOpen);
      });
      statusWrap.forEach((el) => el.classList.toggle("is-closed", !isOpen));
    }

    setApp("home");
    tick();
    setInterval(tick, 30000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
