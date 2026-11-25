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

    let fulfillmentMethod = "delivery"; // "delivery" | "pickup"
    let isEmptyViewActive = false;

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
      const fee = checkoutCart.length === 0 ? 0 : fulfillmentMethod === "delivery" ? 25 : 0;
      const grandTotal = subtotal + fee;

      if (checkoutSubtotalVal) checkoutSubtotalVal.textContent = formatPrice(subtotal);
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
      const fee = fulfillmentMethod === "delivery" ? 25 : 0;
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
        fee,
        total: subtotal + fee,
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

      screen.dataset.activeApp = name;
      views.forEach((v) => {
        const on = v.dataset.view === name;
        v.inert = !on;
        v.setAttribute("aria-hidden", String(!on));
      });

      if (name === "chat") onChatOpen();
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

    function onChatOpen() {
      // Desktop: put the cursor in the box. Phones: don't pop the keyboard uninvited.
      if (chatInput && window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
        setTimeout(() => chatInput.focus({ preventScroll: true }), 420);
      }
      if (chatGreeted || !greetingEl) return;
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
        chatInput.value = chip.textContent.trim();
        syncSendState();
        chatInput.focus({ preventScroll: true });
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
        e.preventDefault();
        setApp(opener.dataset.openApp, opener);
        return;
      }

      if (e.target.closest("[data-go-home]")) {
        setApp("home");
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
      if (e.key === "Escape" && screen.dataset.activeApp !== "home") setApp("home");
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
