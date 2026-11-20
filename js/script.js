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
          <h2 class="cart-drawer-title" id="cartDrawerTitle">Your Order</h2>
          <button type="button" class="cart-close-btn" id="cartCloseBtn" aria-label="Close Cart">&#10005;</button>
        </div>
        <div class="cart-drawer-body" id="cartDrawerBody"></div>
        <div class="cart-drawer-footer" id="cartDrawerFooter" style="display: none;">
          <div class="cart-summary-rows">
            <div class="cart-summary-line">
              <span>Subtotal</span>
              <span id="cartSubtotalValue">0 EGP</span>
            </div>
            <div class="cart-summary-line">
              <span>Asyut Delivery</span>
              <span>${DELIVERY_FEE_EGP} EGP</span>
            </div>
          </div>
          <div class="cart-total-row">
            <span class="cart-total-label">Total</span>
            <span class="cart-total-value" id="cartTotalValue">0 EGP</span>
          </div>
          <button type="button" class="cart-checkout-btn" id="cartCheckoutBtn">Place Order</button>
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
    }

    let cartItems = loadCart();

    function formatEGP(amount) {
      return `${Number(amount).toLocaleString("en-US")} EGP`;
    }

    function triggerPop(el, className = "is-popped") {
      if (!el) return;
      el.classList.remove(className);
      void el.offsetWidth;
      el.classList.add(className);
    }

    // Hydrate every ".star-add-btn" with persistent 3-state layers & strip any stale per-element listeners
    function initMenuCardButtons() {
      document.querySelectorAll(".star-add-btn").forEach((rawBtn) => {
        const btn = rawBtn.cloneNode(true);
        rawBtn.replaceWith(btn);

        const defaultLabel = btn.textContent.trim() || "+ ADD";
        btn.innerHTML = `
          <span class="star-btn-view star-btn-view-default">${defaultLabel}</span>
          <span class="star-btn-view star-btn-view-added" aria-hidden="true">Added &#10003;</span>
          <span class="star-btn-view star-btn-view-stepper">
            <span class="card-step-btn" data-card-step="dec" role="button" tabindex="0" aria-label="Decrease quantity">&minus;</span>
            <span class="card-step-qty">1</span>
            <span class="card-step-btn" data-card-step="inc" role="button" tabindex="0" aria-label="Increase quantity">+</span>
          </span>
        `;
      });
    }

    // Keep both Home (.star-card) and Menu (.menu-card) buttons synced with live cart quantities
    function syncMenuCardButtons(changedTitle = null) {
      document.querySelectorAll(".star-card, .menu-card").forEach((card) => {
        const title = card.querySelector(".star-title, .menu-card-title")?.textContent.trim();
        const btn = card.querySelector(".star-add-btn, .menu-card-cta");
        if (!title || !btn) return;

        const match = cartItems.find((item) => item.title === title);
        const qtyEl = btn.querySelector(".card-step-qty");

        if (match && match.qty > 0) {
          btn.classList.add("is-in-cart");
          if (qtyEl) {
            const prevQty = Number(qtyEl.textContent);
            qtyEl.textContent = match.qty;
            if (changedTitle === title && prevQty !== match.qty) {
              triggerPop(qtyEl, "is-popped");
            }
          }
        } else {
          clearTimeout(btn._addedTimer);
          btn.classList.remove("is-in-cart", "is-added");
          if (qtyEl) qtyEl.textContent = "1";
        }
      });
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

    function closeCartDrawer() {
      cartDrawer.classList.remove("is-open", "is-animating-items");
      cartBackdrop.classList.remove("is-open");
      if (cartToggleBtn) cartToggleBtn.setAttribute("aria-expanded", "false");
      if (!document.body.classList.contains("is-menu-open")) {
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
            <h3 class="cart-empty-heading">Order received!</h3>
            <p class="cart-empty-subtext">We're firing up the grill in Asyut. Your order will be hot and ready soon.</p>
            <span class="cart-order-ref">Order #TM-${orderNum}</span>
            <button type="button" class="cart-empty-cta" id="cartBackToMenuBtn">
              <span>Back to Menu</span>
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
              alt="Toomy's"
              class="cart-empty-logo"
              draggable="false"
            />
            <h3 class="cart-empty-heading">Nothing yet, let's order</h3>
            <p class="cart-empty-subtext">Your tray is empty—pick something delicious from our menu.</p>
            <button type="button" class="cart-empty-cta" id="cartBackToMenuBtn">
              <span>Back to Menu</span>
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
                      <button type="button" class="cart-qty-btn" data-action="dec" data-index="${index}" aria-label="Decrease quantity">&minus;</button>
                      <span class="cart-qty-val">${item.qty}</span>
                      <button type="button" class="cart-qty-btn" data-action="inc" data-index="${index}" aria-label="Increase quantity">+</button>
                    </div>
                    <button type="button" class="cart-remove-btn" data-action="remove" data-index="${index}">Remove</button>
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
    if (cartToggleBtn) cartToggleBtn.addEventListener("click", openCartDrawer);
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

    // Place Order action
    if (cartCheckoutBtn) {
      cartCheckoutBtn.addEventListener("click", () => {
        cartItems = [];
        saveCart(cartItems);
        renderCart(true);
        updateBadge(true);
        syncMenuCardButtons();
      });
    }

    // Unified Card CTA & Inline Stepper Handler ("+ ADD" -> "Added ✓" -> "- 1 +")
    document.addEventListener("click", (e) => {
      const addBtn = e.target.closest(".star-add-btn, .menu-card-cta");
      if (!addBtn) return;

      const card = addBtn.closest(".star-card, .menu-card");
      if (!card) return;

      const title =
        card.querySelector(".star-title, .menu-card-title")?.textContent.trim() ||
        "Toomy's Special";
      const priceText =
        card.querySelector(".star-price, .menu-card-price")?.textContent || "0";
      const price = parseFloat(priceText.replace(/[^0-9.]/g, "")) || 0;
      const image =
        card.querySelector(".star-visual img, .menu-card-img")?.getAttribute("src") ||
        "assets/logo-small.png";
      const note = card.querySelector(".star-note, .menu-card-sub")?.textContent.trim();
      const sub = note ? note : "Regular";

      // Check if user clicked "-" or "+" inside the inline stepper
      const stepTrigger = e.target.closest("[data-card-step]");
      if (stepTrigger) {
        const direction = stepTrigger.dataset.cardStep;
        const itemIdx = cartItems.findIndex((item) => item.title === title);
        if (itemIdx === -1) return;

        if (direction === "inc") {
          cartItems[itemIdx].qty += 1;
        } else if (direction === "dec") {
          if (cartItems[itemIdx].qty > 1) {
            cartItems[itemIdx].qty -= 1;
          } else {
            cartItems.splice(itemIdx, 1);
          }
        }

        saveCart(cartItems);
        renderCart(false);
        updateBadge(true);
        syncMenuCardButtons(title);
        return;
      }

      // Otherwise user clicked "+ ADD" (or clicked during the brief "Added ✓" phase)
      const existing = cartItems.find((item) => item.title === title);
      if (existing) {
        existing.qty += 1;
      } else {
        cartItems.push({ title, price, image, sub, qty: 1 });
      }

      saveCart(cartItems);
      renderCart(false);
      updateBadge(true);
      syncMenuCardButtons(title);

      // Show crisp "Added ✓" confirmation for 1.1s, then reveal the "- 1 +" stepper
      addBtn.classList.add("is-added");
      clearTimeout(addBtn._addedTimer);
      addBtn._addedTimer = setTimeout(() => {
        addBtn.classList.remove("is-added");
      }, 1100);
    });

    // Initialize card buttons, sync any saved cart quantities, and render drawer
    initMenuCardButtons();
    syncMenuCardButtons();
    renderCart(false);
  }

  /* =========================================
     14. FULL MENU PAGE (FILTERING, STICKY HEADER & QUICK VIEW)
     ========================================= */
  const menuProductGrid = document.getElementById("menuProductGrid");
  const menuFilterBar = document.getElementById("menuFilterBar");
  const menuFilterWrap = document.getElementById("menuFilterWrap");
  const menuFilterIndicator = document.getElementById("menuFilterIndicator");
  const siteHeaderEl = document.getElementById("siteHeader");

  if (menuProductGrid && menuFilterBar) {
    const MENU_CATALOG = [
      // BURGERS (5)
      {
        id: "toomy-burger",
        category: "burgers",
        theme: "theme-red",
        badge: "The Original",
        title: "Toomy Burger",
        subtitle: "SIGNATURE DOUBLE SMASH",
        desc: "Double smashed beef patties, crispy onion rings, melted mozzarella sticks, beef bacon, and Toomy's smoky house sauce.",
        price: 185,
        image: "assets/products/toomy-burger.webp"
      },
      {
        id: "juicy-jack-burger",
        category: "burgers",
        theme: "theme-yellow",
        badge: "For True Hungry",
        title: "Juicy Jack Burger",
        subtitle: "JUICY & SPICY",
        desc: "Three seared Angus smash patties layered with aged cheddar, caramelized onions, pickles, and seasoned golden fries.",
        price: 235,
        image: "assets/products/juicy-jack.png"
      },
      {
        id: "pepperonzi-burger",
        category: "burgers",
        theme: "theme-cream",
        badge: "Just Right",
        title: "Pizza-Style Smash",
        subtitle: "ALL-AMERICAN MELT",
        desc: "Juicy smashed beef patty topped with double American cheddar, crisp lettuce, ripe tomatoes, and tangy diner sauce.",
        price: 145,
        image: "assets/products/pepperonzi.png"
      },
      {
        id: "mushroom-swiss-smash",
        category: "burgers",
        theme: "theme-red",
        badge: "Rich & Creamy",
        title: "Mushroom Swiss Smash",
        subtitle: "TRUFFLE CREAM GLAZE",
        desc: "Smashed beef seared to perfection under roasted button mushrooms, melted Swiss cheese, and creamy peppercorn aioli.",
        price: 195,
        image: "assets/products/truck.png"
      },
      {
        id: "jalapeno-fire-burger",
        category: "burgers",
        theme: "theme-yellow",
        badge: "Spicy Kick",
        title: "Jalapeno Fire Burger",
        subtitle: "HABANERO CHEDDAR",
        desc: "Flame-seared smash patty stacked with pickled jalapenos, crispy onions, spicy cheese sauce, and chipotle mayo.",
        price: 175,
        image: "assets/products/burger-boom.png"
      },

      // CHICKEN (4)
      {
        id: "truck-chicken-sandwich",
        category: "chicken",
        theme: "theme-cream",
        badge: "Crowd Favorite",
        title: "Truck Chicken Crunch",
        subtitle: "EXTRA CRISPY FILLET",
        desc: "Hand-breaded crunchy chicken breast glazed with honey mustard, coleslaw, melted cheddar, and toasted brioche.",
        price: 160,
        image: "assets/products/truck-chicken.webp"
      },
      {
        id: "buffalo-chicken-sandwich",
        category: "chicken",
        theme: "theme-red",
        badge: "Hot & Tangy",
        title: "Buffalo Chicken",
        subtitle: "SPICY GLAZED BREAST",
        desc: "Crispy fried chicken fillet tossed in bold Buffalo sauce, cooled with house buttermilk ranch and crunchy pickles.",
        price: 165,
        image: "assets/products/buffalo.png"
      },
      {
        id: "ranch-chicken-sandwich",
        category: "chicken",
        theme: "theme-yellow",
        badge: "Sweet & Smoky",
        title: "Ranch Chicken",
        subtitle: "BUTTERMILK RANCH GLAZE",
        desc: "Golden fried chicken breast brushed with sweet hickory BBQ sauce, crispy turkey bacon, and smoked gouda.",
        price: 170,
        image: "assets/products/ranch.png"
      },
      {
        id: "chicken-boom-sandwich",
        category: "chicken",
        theme: "theme-cream",
        badge: "Full Feast",
        title: "Loaded Chicken Box",
        subtitle: "2 PIECES + SIDES",
        desc: "Two golden-fried crispy chicken pieces served with seasoned fries, creamy garlic dip, coleslaw, and a warm bun.",
        price: 190,
        image: "assets/products/chicken-boom.png"
      },

      // TENDERS (3)
      {
        id: "tenders-meal",
        category: "tenders",
        theme: "theme-red",
        badge: "Best Seller",
        title: "Tenders Meal",
        subtitle: "SIZE DIFFERS • 4 / 6 PCS",
        desc: "Crispy hand-battered chicken tenders, golden fries, toasted brioche buns, and your choice of two signature dips.",
        price: 175,
        image: "assets/products/tenders-meal.webp"
      },
      {
        id: "nashville-hot-tenders",
        category: "tenders",
        theme: "theme-yellow",
        badge: "Extra Heat",
        title: "Nashville Hot Tenders",
        subtitle: "CAYENNE SPICE DUST",
        desc: "Crunchy chicken tenders basted in fiery Nashville chili oil, served over Texas toast with dill pickles and ranch.",
        price: 185,
        image: "assets/products/tenders-meal.webp"
      },
      {
        id: "honey-mustard-tenders",
        category: "tenders",
        theme: "theme-cream",
        badge: "Just Right",
        title: "Golden Tenders Trio",
        subtitle: "3 STRIPS + FRIES",
        desc: "Three juicy all-white-meat crispy tenders paired with crinkle-cut fries and our house honey mustard sauce.",
        price: 135,
        image: "assets/products/tenders-meal.webp"
      },

      // PIZZA (3)
      {
        id: "chicken-popcorn-pizza",
        category: "pizza",
        theme: "theme-red",
        badge: "House Star",
        title: "Chicken Popcorn Pizza",
        subtitle: "BUFFALO & RANCH DRIZZLE",
        desc: "Toomy's signature tomato sauce, stretchy mozzarella, golden fried popcorn chicken, and a rich Buffalo-ranch drizzle.",
        price: 210,
        image: "assets/products/pizza-popcorn-buffalo.webp"
      },
      {
        id: "sea-ranch-pizza",
        category: "pizza",
        theme: "theme-yellow",
        badge: "Wood-Fired Style",
        title: "Sea Ranch Pizza",
        subtitle: "BUTTERMILK RANCH & SHRIMP",
        desc: "Tangy BBQ base loaded with crispy chicken chunks, red onions, smoked mozzarella, and fresh cilantro.",
        price: 205,
        image: "assets/products/pizza-searanch.png"
      },
      {
        id: "steak-pizza",
        category: "pizza",
        theme: "theme-cream",
        badge: "Cheese Pull",
        title: "Steak Melt Pizza",
        subtitle: "JUICY STEAK & MOZZARELLA",
        desc: "Rich blend of mozzarella, aged cheddar, gouda, and parmesan baked on a hand-stretched golden crust.",
        price: 185,
        image: "assets/products/pizza-steak.png"
      },
      // BASMATI (2)
      {
        id: "basmati-crispy-bowl",
        category: "basmati",
        theme: "theme-yellow",
        badge: "The House Signature",
        title: "Basmati Crispy Bowl",
        subtitle: "SPICED GOLDEN RICE",
        desc: "Fragrant yellow basmati rice topped with sliced crispy chicken tenders, garlic sauce, and toasted almonds.",
        price: 155,
        image: "assets/products/basmati-chicken.webp"
      },
      {
        id: "smoky-beef-basmati-bowl",
        category: "basmati",
        theme: "theme-cream",
        badge: "Hearty Bowl",
        title: "Smoky Beef Basmati Bowl",
        subtitle: "CHARGRILLED STRIPS",
        desc: "Aromatic seasoned basmati rice loaded with seared beef strips, roasted peppers, and smoky tahini-garlic drizzle.",
        price: 170,
        image: "assets/products/basmati-steak.png"
      },

      // CRISPY (1)
      {
        id: "hot-dog-crispy-roll",
        category: "crispy",
        theme: "theme-cream",
        badge: "Roll Up",
        title: "Hot Dog Crispy Roll",
        subtitle: "STACKED & MELTED",
        desc: "Crispy tortilla wrap packed with grilled hot dog bites, melted mozzarella, cheddar sauce, and fresh veggies.",
        price: 145,
        image: "assets/products/crispy-roll.webp"
      }
    ];

    const VALID_CATS = ["all", "burgers", "chicken", "tenders", "pizza", "basmati", "crispy"];

    // Update tab counts dynamically
    VALID_CATS.forEach((cat) => {
      const countEl = menuFilterBar.querySelector(`[data-count-for="${cat}"]`);
      if (countEl) {
        const count =
          cat === "all"
            ? MENU_CATALOG.length
            : MENU_CATALOG.filter((item) => item.category === cat).length;
        countEl.textContent = count;
      }
    });

    // Position the sliding red indicator pill behind the active tab
    function moveFilterIndicator(activeTab) {
      if (!menuFilterIndicator || !activeTab) return;
      const left = activeTab.offsetLeft;
      const width = activeTab.offsetWidth;
      menuFilterIndicator.style.width = `${width}px`;
      menuFilterIndicator.style.transform = `translate3d(${left}px, 0, 0)`;
    }

    // Render cards for the selected category with staggered entrance
    function renderMenuCards(category, animate = true) {
      const filtered =
        category === "all"
          ? MENU_CATALOG
          : MENU_CATALOG.filter((item) => item.category === category);

      const buildMarkup = () => {
        menuProductGrid.innerHTML = filtered
          .map(
            (item, idx) => `
          <article
            class="menu-card ${item.theme}"
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
                aria-label="Quick View ${item.title}"
              >
                <span class="menu-qv-icon" aria-hidden="true">&#10530;</span>
                <span class="menu-qv-label">Quick View</span>
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
              <p class="menu-card-desc">${item.desc}</p>
            </div>

            <div class="menu-card-footer">
              <span class="menu-card-price">${item.price} EGP</span>

              <button type="button" class="menu-card-cta">
                <span class="star-btn-view star-btn-view-default">+ Add</span>
                <span class="star-btn-view star-btn-view-added" aria-hidden="true">Added &#10003;</span>
                <span class="star-btn-view star-btn-view-stepper">
                  <span class="card-step-btn" data-card-step="dec" role="button" tabindex="0" aria-label="Decrease quantity">&minus;</span>
                  <span class="card-step-qty">1</span>
                  <span class="card-step-btn" data-card-step="inc" role="button" tabindex="0" aria-label="Increase quantity">+</span>
                </span>
              </button>
            </div>
          </article>
        `
          )
          .join("");

        // Sync live cart quantities onto newly rendered card buttons
        if (typeof syncMenuCardButtons === "function") {
          syncMenuCardButtons();
        }
      };

      if (!animate) {
        buildMarkup();
        return;
      }

      // Fade & scale out current cards (~150ms), then stagger new cards in (~280ms)
      menuProductGrid.classList.add("is-filtering-out");
      clearTimeout(menuProductGrid._filterTimer);
      menuProductGrid._filterTimer = setTimeout(() => {
        buildMarkup();
        menuProductGrid.classList.remove("is-filtering-out");
      }, 150);
    }

    // Set active category tab + update URL query (?cat=...) without reload
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

    // Tab click delegation
    menuFilterBar.addEventListener("click", (e) => {
      const tab = e.target.closest(".menu-filter-tab");
      if (!tab || tab.classList.contains("is-active")) return;
      setActiveCategory(tab.dataset.cat, { updateUrl: true, animate: true });
    });

    // Keep sliding indicator aligned on window resize / font load
    window.addEventListener("resize", () => {
      const activeTab = menuFilterBar.querySelector(".menu-filter-tab.is-active");
      moveFilterIndicator(activeTab);
    });

    // Initial category from URL (?cat=burgers, etc.)
    const initialCat =
      new URLSearchParams(window.location.search).get("cat")?.toLowerCase() || "all";
    setActiveCategory(initialCat, { updateUrl: false, animate: false });
    requestAnimationFrame(() => {
      const activeTab = menuFilterBar.querySelector(".menu-filter-tab.is-active");
      moveFilterIndicator(activeTab);
    });

    // Scroll-Linked Top Nav Auto-Hide & Sticky Filter Pill Elevation
    let lastScrollY = window.scrollY;
    window.addEventListener(
      "scroll",
      () => {
        const currentY = window.scrollY;
        const delta = currentY - lastScrollY;

        if (menuFilterWrap) {
          const wrapTop = menuFilterWrap.getBoundingClientRect().top;
          menuFilterWrap.classList.toggle("is-stuck", wrapTop <= 90);
        }

        if (siteHeaderEl && !document.body.classList.contains("is-menu-open")) {
          if (currentY > 140 && delta > 6) {
            siteHeaderEl.classList.add("is-header-hidden");
            if (menuFilterWrap) menuFilterWrap.classList.add("is-top-pinned");
          } else if (delta < -6 || currentY <= 100) {
            siteHeaderEl.classList.remove("is-header-hidden");
            if (menuFilterWrap) menuFilterWrap.classList.remove("is-top-pinned");
          }
        }

        lastScrollY = currentY;
      },
      { passive: true }
    );

    // Quick-View Modal Controller
    const qvBackdrop = document.getElementById("qvBackdrop");
    const qvModal = document.getElementById("qvModal");
    const qvCloseBtn = document.getElementById("qvCloseBtn");
    const qvVisualPane = document.getElementById("qvVisualPane");
    const qvBadge = document.getElementById("qvBadge");
    const qvImage = document.getElementById("qvImage");
    const qvSubtitle = document.getElementById("qvSubtitle");
    const qvTitle = document.getElementById("qvTitle");
    const qvDesc = document.getElementById("qvDesc");
    const qvPrice = document.getElementById("qvPrice");
    const qvAddBtn = document.getElementById("qvAddBtn");
    let activeQvItem = null;

    function openQuickView(item) {
      if (!item || !qvModal) return;
      activeQvItem = item;
      qvVisualPane.className = `qv-visual-pane ${item.theme}`;
      qvBadge.textContent = item.badge;
      qvImage.src = item.image;
      qvImage.alt = item.title;
      qvSubtitle.textContent = item.subtitle;
      qvTitle.textContent = item.title;
      qvDesc.textContent = item.desc;
      qvPrice.textContent = `${item.price} EGP`;

      qvBackdrop.classList.add("is-open");
      qvModal.classList.add("is-open");
      qvModal.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    function closeQuickView() {
      if (!qvModal) return;
      qvBackdrop.classList.remove("is-open");
      qvModal.classList.remove("is-open");
      qvModal.setAttribute("aria-hidden", "true");
      if (
        !document.body.classList.contains("is-menu-open") &&
        !document.getElementById("cartDrawer")?.classList.contains("is-open")
      ) {
        document.body.style.overflow = "";
      }
    }

    menuProductGrid.addEventListener("click", (e) => {
      const qvBtn = e.target.closest("[data-qv-id]");
      if (!qvBtn) return;
      const item = MENU_CATALOG.find((entry) => entry.id === qvBtn.dataset.qvId);
      if (item) openQuickView(item);
    });

    if (qvCloseBtn) qvCloseBtn.addEventListener("click", closeQuickView);
    if (qvBackdrop) qvBackdrop.addEventListener("click", closeQuickView);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && qvModal?.classList.contains("is-open")) {
        closeQuickView();
      }
    });

    if (qvAddBtn) {
      qvAddBtn.addEventListener("click", () => {
        if (!activeQvItem) return;
        const matchingCard = menuProductGrid.querySelector(
          `.menu-card[data-id="${activeQvItem.id}"] .menu-card-cta`
        );
        if (matchingCard) {
          matchingCard.click();
        }
        closeQuickView();
      });
    }
  }
});