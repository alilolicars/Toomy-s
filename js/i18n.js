/* =========================================================
   TOOMY'S — LANGUAGE ENGINE (EN / AR-EG RTL)
   ---------------------------------------------------------
   • Loaded in <head> so <html lang/dir> is set BEFORE first paint.
   • English stays exactly as authored in the HTML (source of truth).
   • Arabic copy is written in warm Egyptian colloquial (عامية مصرية),
     not literal translation — it should feel like a friend from Asyut.
   • Language priority: ?lang=ar|en  →  saved choice  →  browser language.
   ========================================================= */
(function () {
  "use strict";

  var STORAGE_KEY = "toomys_lang";

  function detectLang() {
    try {
      var fromUrl = new URLSearchParams(window.location.search).get("lang");
      if (fromUrl === "ar" || fromUrl === "en") {
        localStorage.setItem(STORAGE_KEY, fromUrl);
        return fromUrl;
      }
      var saved = localStorage.getItem(STORAGE_KEY);
      if (saved === "ar" || saved === "en") return saved;
    } catch (e) {
      /* storage blocked — fall through */
    }
    var nav = (navigator.languages && navigator.languages[0]) || navigator.language || "";
    return /^ar\b/i.test(nav) ? "ar" : "en";
  }

  var lang = detectLang();
  var isAr = lang === "ar";
  var root = document.documentElement;

  root.setAttribute("lang", isAr ? "ar-EG" : "en");
  root.setAttribute("dir", isAr ? "rtl" : "ltr");

  function setLang(next) {
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (e) {
      /* ignore */
    }
    var url = new URL(window.location.href);
    url.searchParams.delete("lang");
    window.location.replace(url.toString());
  }

  window.TOOMYS_I18N = { lang: lang, isAr: isAr, setLang: setLang };

  // Hide the English text for a split second while Arabic is swapped in (no flash)
  var cloak = null;
  if (isAr && document.head) {
    cloak = document.createElement("style");
    cloak.id = "toomysI18nCloak";
    cloak.textContent = "body{visibility:hidden!important}";
    document.head.appendChild(cloak);
    setTimeout(removeCloak, 2500); // failsafe
  }

  function removeCloak() {
    if (cloak && cloak.parentNode) cloak.parentNode.removeChild(cloak);
    cloak = null;
  }

  /* =========================================================
     ARABIC (EGYPTIAN) COPY — [selector, value]
     value: "html string" | { html, value, <attr>: "..." } | function(el)
     ========================================================= */
  var EGP = "جنيه";

  function swapCurrency(el) {
    el.textContent = el.textContent.replace(/EGP/g, EGP);
  }

  var QUICK_PICKS = {
    "toomy-burger": { title: "تومي برجر", full: "تومي برجر" },
    "juicy-jack-burger": { title: "جوسي جاك", full: "جوسي جاك برجر" },
    "popcorn-chicken-pizza": { title: "بيتزا بوب كورن", full: "بيتزا بوب كورن تشيكن" }
  };

  var AR = [
    /* ---------- GLOBAL: NAVBAR ---------- */
    [".nav-brand", { "aria-label": "توميز — الرئيسية" }],
    [".nav-brand-img", { alt: "توميز" }],
    [".nav-center-links", { "aria-label": "القايمة الرئيسية" }],
    ['.nav-link[data-page="home"]', "الرئيسية"],
    ['.nav-link[data-page="menu"]', "المنيو"],
    ['.nav-link[data-page="about"]', "حكايتنا"],
    ['.nav-link[data-page="contact"]', "كلّمنا"],
    ["#cartToggle", { "aria-label": "افتح الأوردر" }],
    [".cart-pill-label", "الأوردر"],
    ["#mobileMenuBtn", { "aria-label": "افتح القايمة" }],

    /* ---------- GLOBAL: MOBILE TAKEOVER ---------- */
    [".mobile-takeover-links", { "aria-label": "قايمة الموبايل" }],
    ['.mobile-takeover-link[data-page="home"]', "الرئيسية"],
    ['.mobile-takeover-link[data-page="menu"]', "المنيو"],
    ['.mobile-takeover-link[data-page="about"]', "حكايتنا"],
    ['.mobile-takeover-link[data-page="contact"]', "كلّمنا"],
    [".mobile-takeover-tagline", "الطعم الحلو مايتفوّتش"],

    /* ---------- GLOBAL: FOOTER ---------- */
    [".footer-logo", { "aria-label": "توميز — الرئيسية" }],
    [".footer-logo img", { alt: "توميز" }],
    [".footer-logo-fallback", "توميز"],
    [".footer-tagline", "مقلي طازة، ومليان طعم.. من قلب أسيوط."],
    [".footer-nav", { "aria-label": "روابط سريعة" }],
    [".footer-col:nth-child(1) .footer-col-heading", "المنيو بتاعنا"],
    [".footer-col:nth-child(2) .footer-col-heading", "هتلاقينا فين"],
    [".footer-col:nth-child(3) .footer-col-heading", "خلّيك قريب"],
    ['.footer-link[href="menu.html?cat=burgers"]', "برجر"],
    ['.footer-link[href="menu.html?cat=pizza"]', "بيتزا"],
    ['.footer-link[href="menu.html?cat=tenders"]', "تندرز"],
    ['.footer-link[href="menu.html?cat=chicken"]', "فراخ"],
    ['.footer-link[href="menu.html?cat=crispy"]', "كرسبي رولز"],
    ['.footer-link[href="menu.html"]', "اطلب أونلاين"],
    ['.footer-link[href="newsletter.html"]', "كلّمنا"],
    ['.footer-link[href="about.html"]', "حكايتنا"],
    [".footer-col:nth-child(2) .footer-col-list li:nth-child(1) .footer-info-text", "أسيوط، أبراج النصر"],
    [".footer-col:nth-child(2) .footer-col-list li:nth-child(2) .footer-info-text", "فاتحين كل يوم: من 2 الضهر لـ 2 بالليل"],
    [".footer-map-link", "وصّلني لحد عندكم &#8598;"],
    [".footer-socials", { "aria-label": "تابعنا على السوشيال" }],
    [".footer-burger-img", { alt: "برجر توميز المميز" }],
    [
      ".footer-copyright",
      function (el) {
        var year = el.querySelector("#footerYear");
        el.textContent = "";
        el.append("© ");
        if (year) el.append(year);
        el.append(" توميز. كل الحقوق محفوظة.");
      }
    ],

    /* ---------- GLOBAL: SHARED ARIA ---------- */
    ['[aria-label="Decrease quantity"]', { "aria-label": "قلّل الكمية" }],
    ['[aria-label="Increase quantity"]', { "aria-label": "زوّد الكمية" }],
    ['[aria-label="Item Quantity"]', { "aria-label": "الكمية" }],
    ['[aria-label="Included Items"]', { "aria-label": "المكونات" }],

    /* ---------- QUICK VIEW MODAL (index / menu) ---------- */
    ["#qvCloseBtn", { "aria-label": "اقفل" }],
    ["#qvBadge", "جرّبها دلوقتي"],
    ["#qvAddLabel", "ضيف للأوردر"],

    /* ---------- HOME: HERO ---------- */
    [".hero-logo-img", { src: "assets/logo-main-ar.webp", alt: "لوجو توميز" }],
    [".hero-wordmark", "توميز"],
    [".hero-slogan", "الطعم الحلو مايتفوّتش! — أجمد برجر وبيتزا في أسيوط كلها."],
    [".btn-order", { "aria-label": "جعت؟ اطلب دلوقتي" }],
    [".btn-order-text-default", "جعت ولا لسه؟"],
    [".btn-order-text-hover", "يلا اطلب!"],
    [".category-dock", { "aria-label": "أصناف لازم تجربها" }],
    ['.category-card[data-category="chicken"] img', { alt: "ساندوتش فراخ مقرمشة" }],
    ['.category-card[data-category="chicken"] .category-title', "ساندوتش فراخ كرسبي"],
    ['.category-card[data-category="chicken"] .category-sub', "مقرمش برّه وطري جوّه"],
    ['.category-card[data-category="burger"] img', { alt: "سماش برجر" }],
    ['.category-card[data-category="burger"] .category-title', "سماش برجر"],
    ['.category-card[data-category="burger"] .category-sub', "مدخّن ومليان على الآخر"],
    ['.category-card[data-category="crispy"] img', { alt: "كرسبي رول" }],
    ['.category-card[data-category="crispy"] .category-title', "كرسبي رول"],
    ['.category-card[data-category="crispy"] .category-sub', "متقّل وجبنته سايحة"],
    ['.category-card[data-category="pizza"] img', { alt: "بيتزا" }],
    ['.category-card[data-category="pizza"] .category-title', "بيتزا محمّلة"],
    ['.category-card[data-category="pizza"] .category-sub', "جبنة بتشد وتتبيلة نار"],
    ['.category-card[data-category="basmati"] img', { alt: "رز بسمتي" }],
    ['.category-card[data-category="basmati"] .category-title', "بسمتي وبروتين"],
    ['.category-card[data-category="basmati"] .category-sub', "سبيشيال البيت"],

    /* ---------- HOME: MENU STARS ---------- */
    [".menu-stars-eyebrow .eyebrow-text", "الأكتر طلبًا"],
    [".menu-stars-heading", "نجوم المنيو"],
    [".menu-stars-action", 'شوف المنيو كله <span class="action-arrow" aria-hidden="true">&rarr;</span>'],
    [
      '.star-card[data-item-id="toomy-burger"]',
      function (el) {
        starCard(el, "الأصلي", "تومي برجر",
          "قطعة لحمة سماش، أونيون رينجز مقرمشة، أصابع موتزاريلا، طبقة بيف بيكون، صوص شيدر سخن، وفي الآخر صوص تومي السري.. كله في عيش بريوش بالزبدة.");
      }
    ],
    [
      '.star-card[data-item-id="popcorn-chicken-pizza"]',
      function (el) {
        starCard(el, "على الطريقة الأمريكاني", "بيتزا بوب كورن تشيكن",
          "صوص طماطم توميز الخاص، فراخ بوب كورن مقلية ودهبي، وتسييحة من الصوص اللي بتحبه.");
      }
    ],
    [
      '.star-card[data-item-id="tenders-meal"]',
      function (el) {
        starCard(el, "قرمشة على الآخر", "وجبة تندرز",
          "تندرز مقرمشة، بطاطس دهبي، عيش بريوش محمّص، والصوصات اللي على مزاجك.");
        var note = el.querySelector(".star-note");
        if (note) note.textContent = "الحجم على حسب اختيارك";
      }
    ],
    [
      '.star-card[data-item-id="hotdog-crispy-roll"]',
      function (el) {
        starCard(el, "مقرمش من الآخر", "هوت دوج كرسبي رول",
          "قطع هوت دوج، موتزاريلا سايحة، صوص شيدر، وخضار فريش.. ملفوفين في رول دهبي مقرمش.");
      }
    ],
    [
      '.star-card[data-item-id="truck-chicken"]',
      function (el) {
        starCard(el, null, "تراك تشيكن",
          "فراخ مقلية مقرمشة، صوص شيدر، صوص توميز الخاص، خس ومخلل.. في عيش بريوش طري.");
      }
    ],
    [
      '.star-card[data-item-id="basmati-chicken"]',
      function (el) {
        starCard(el, "معمول أحلى", "بسمتي تشيكن",
          "رز بسمتي دهبي، فوقه قطع فراخ مقرمشة، ومعاه 2 صوص من اختيارك.");
      }
    ],
    [".star-add-btn", "+ ضيف"],
    [".star-price", swapCurrency],

    /* ---------- HOME: PROMO TICKER ---------- */
    [".promo-ticker", { "aria-label": "أصناف مميزة" }],
    [
      ".promo-ticker-group",
      function (el) {
        var words = ["سماش برجر", "تندرز", "بيتزا أمريكاني", "ساندوتشات فراخ", "بولات بسمتي", "كرسبي رولز"];
        el.querySelectorAll(".ticker-item").forEach(function (item, i) {
          if (words[i]) item.textContent = words[i];
        });
      }
    ],

    /* ---------- MENU PAGE ---------- */
    [".menu-hero-eyebrow span:not(.menu-eyebrow-dot)", "اطلب أونلاين"],
    [".menu-hero-title", "المنيو"],
    [".menu-hero-subcopy", "كل حاجة بتتعمل طازة أول ما تطلب. اختار اللي نفسك فيه.. والباقي علينا."],
    [".menu-filter-bar", { "aria-label": "أقسام المنيو" }],
    ['.menu-filter-tab[data-cat="all"] .tab-name', "الكل"],
    ['.menu-filter-tab[data-cat="burgers"] .tab-name', "برجر"],
    ['.menu-filter-tab[data-cat="chicken"] .tab-name', "فراخ"],
    ['.menu-filter-tab[data-cat="tenders"] .tab-name', "تندرز"],
    ['.menu-filter-tab[data-cat="pizza"] .tab-name', "بيتزا"],
    ['.menu-filter-tab[data-cat="basmati"] .tab-name', "بسمتي"],
    ['.menu-filter-tab[data-cat="crispy"] .tab-name', "كرسبي"],
    [".menu-grid-section", { "aria-label": "الأصناف" }],

    /* ---------- ABOUT PAGE ---------- */
    [".about-eyebrow-label span:not(.about-eyebrow-circle)", "من قلب أسيوط"],
    ["#aboutHeadline", "أكل بجد،<br />معمول من القلب."],
    [
      ".about-story-paragraph",
      "بنفرد كل برجر على صاج مولّع نار، وبنقلي التندرز لحد ما تقرمش، وعمرنا ما بنبخل في الصوص. لا بنستسهل ولا عندنا خسّة دبلانة — بس الحاجة الحلوة، زي ما أسيوط بتحبها بالظبط."
    ],
    [".about-pillars-list", { "aria-label": "أسرار الصنعة" }],
    [".about-pillar-row:nth-child(1) .about-pillar-title", "سماش.. مش مكبوس"],
    [".about-pillar-row:nth-child(1) .about-pillar-desc", "لحمة رفيعة، أطراف مقرمشة، وقلب كله عصارة."],
    [".about-pillar-row:nth-child(2) .about-pillar-title", "صوص على كل حاجة"],
    [".about-pillar-row:nth-child(2) .about-pillar-desc", "صوص تومي، شيدر، بافلو. اختار اتنين.. أو خدهم كلهم، محدش هيقولك لأ."],
    [".about-pillar-row:nth-child(3) .about-pillar-title", "متغلّف للمشوار"],
    [".about-pillar-row:nth-child(3) .about-pillar-desc", "بيوصلك لحد باب البيت سخن ومقرمش.. كأنك واكله عندنا."],
    [".about-collage-card-primary .about-collage-photo", { alt: "دبل سماش تشيز برجر وبطاطس كرينكل على صينية توميز الحمرا" }],
    [".about-collage-card-secondary .about-collage-photo", { alt: "سلايس بيتزا توميز محمّلة والجبنة بتشد" }],
    [".about-brand-seal", { "aria-label": "جايين نقعد، مش نعدّي" }],
    [".about-brand-seal-text", "جايين نقعد<br />مش نعدّي"],

    /* ---------- NEWSLETTER / CONTACT PAGE ---------- */
    [".ticket-stamp-text", "العروض<br />أول<br />بأول"],
    [".ticket-vip-tag", "كارت VIP &bull; 01"],
    [".ticket-eyebrow span:not(.ticket-eyebrow-dot)", "نشرة توميز"],
    ["#newsletterHeading", "العروض توصلك<br />قبل<br />أي حد."],
    [
      ".ticket-desc",
      "سيب رقمك وهنبعتلك أجدد الأصناف، وعروض حصرية قبل ما تنزل لأي حد، وكل جديد عندنا — من غير رخامة، وتقدر تلغي في أي وقت."
    ],
    ['label[for="newsletterPhone"]', "رقم الموبايل"],
    [".subscribe-btn span:not(.subscribe-arrow-badge)", "اشترك"],
    [".hungry-eyebrow", "جعان؟"],
    [".hungry-headline", "ماتفوّتش<br />ولا لقمة!"],
    [".start-order-label", "ابدأ الأوردر"],

    /* Contact / Find us section */
    ["#contactHeading", "كلّمنا، ابعتلنا،<br />أو عدّي علينا."],
    [".contact-lede", "بنرد بسرعة، والصاج شغّال كل يوم من 2 الضهر لحد 2 بالليل."],

    /* Interactive tablet */
    [".tablet-socials", { "aria-label": "توميز على السوشيال ميديا" }],
    [".ios-home", { "aria-label": "الشاشة الرئيسية للتابلت" }],
    [".ios-w-eyebrow", "توميز"],
    [".ios-w-big", "2 الضهر – 2 بالليل"],
    [".ios-w-sub", "كل يوم"],
    [".ios-w-map-title", "أبراج النصر"],
    [".ios-w-map-sub", "جنب خير زمان"],
    [".ios-jiggle-done", "تم"],
    ['[data-app-id="maps"] .ios-app-label', "الخرايط"],
    ['[data-app-id="contact"] .ios-app-label', "جهات الاتصال"],
    ['[data-app-id="call"] .ios-app-label', "اتصال"],
    ['[data-app-id="whatsapp"] .ios-app-label', "واتساب"],
    ['[data-app-id="scratch"] .ios-app-label', "اكشط واكسب"],
    ['[data-app-id="photos"] .ios-app-label', "الصور"],
    ['[data-app-id="reviews"] .ios-app-label', "التقييمات"],
    ['[data-app-id="squad"] .ios-app-label', "حاسبة الشلّة"],
    ['[data-app-id="menu"] .ios-app-label', "المنيو"],
    ['[data-app-id="instagram"] .ios-app-label', "إنستجرام"],
    ['[data-app-id="facebook"] .ios-app-label', "فيسبوك"],
    [".ios-dock-app:nth-child(1)", { "aria-label": "اتصل بتوميز" }],
    [".ios-dock-app:nth-child(2)", { "aria-label": "افتح الخرايط" }],
    [".ios-dock-app:nth-child(3)", { "aria-label": "افتح كارت التواصل" }],
    [".ios-dock-app:nth-child(4)", { "aria-label": "كلّم توميز واتساب" }],
    [".ios-home-bar", { "aria-label": "ارجع للشاشة الرئيسية" }],
    [".ios-maps", { "aria-label": "الخرايط" }],
    [".ios-maps-frame", { title: "مكان توميز على الخريطة — أبراج النصر، أسيوط" }],
    [".ios-grabber", { "aria-label": "اعرض تفاصيل أقل" }],
    [".ios-place-name", "توميز"],
    [".ios-place-kind", "برجر وبيتزا · أبراج النصر"],
    [".ios-close", { "aria-label": "اقفل الخرايط" }],
    [".ios-action-directions", "الاتجاهات"],
    [".ios-action-call", "اتصال"],
    [".ios-action-message", "رسالة"],
    [".ios-action-menu", "المنيو"],
    [".ios-info-hours-label", "المواعيد"],
    [".ios-info-hours", "من 2 الضهر لـ 2 بالليل كل يوم"],
    [".ios-info-phone-label", "التليفون"],
    [".ios-info-address-label", "العنوان"],
    [".ios-info-address", "أسيوط - أبراج النصر، جنب خير زمان، 71511"],
    [".ios-contact", { "aria-label": "كارت التواصل" }],
    [".ios-back-label", "الرئيسية"],
    [".ios-contact-name", "توميز"],
    [".ios-contact-sub", "برجر وبيتزا · أسيوط"],
    [".ios-quick-message", "رسالة"],
    [".ios-quick-call", "اتصال"],
    [".ios-quick-map", "الخريطة"],
    [".ios-quick-insta", "تابعنا"],
    [".ios-cell-mobile", "موبايل"],
    [".ios-cell-address", "العنوان"],
    [".ios-cell-address-value", "أبراج النصر، جنب خير زمان<br />أسيوط 71511<br />مصر"],
    [".ios-cell-hours", "المواعيد"],
    [".ios-cell-hours-value", "كل يوم · من 2 الضهر لـ 2 بالليل"],

    /* Tablet — WhatsApp chat */
    [".ios-chat", { "aria-label": "شات واتساب مع توميز" }],
    [".wa-back", { "aria-label": "ارجع للشاشة الرئيسية" }],
    [".wa-name", "توميز"],
    [".wa-sub", "برجر وبيتزا · أسيوط"],
    [".wa-call", { "aria-label": "اتصل بتوميز" }],
    [".wa-day", "النهارده"],
    [".wa-system", "اكتب رسالتك هنا — ولما تبعت، هتتفتح في واتساب جاهزة."],
    ["[data-wa-greeting] .wa-text", "أهلًا! 👋 نوّرت توميز. نفسك في إيه النهارده؟"],
    [".wa-chip:nth-child(1)", "عايز أطلب أوردر 🍔"],
    [".wa-chip:nth-child(2)", "بتوصّلوا لمنطقتي؟"],
    [".wa-chip:nth-child(3)", "إيه اللي في المنيو النهارده؟"],
    ['label[for="waMessage"]', "رسالتك لتوميز"],
    [".wa-input", { placeholder: "رسالة" }],
    [".wa-send", { "aria-label": "ابعت على واتساب" }],
    [".tablet-social-whatsapp", { "aria-label": "واتساب" }],

    /* Tablet — Scratch & Win */
    [".ios-scratch", { "aria-label": "اكشط واكسب" }],
    [".ios-scratch-bar-title", "اكشط واكسب"],
    [".scratch-eyebrow", "هدية توميز"],
    [".scratch-title", "اكشط الكارت وشوف حظك!"],
    ["[data-scratch-canvas]", { "aria-label": "سطح الكارت" }],
    [".scratch-hint", "امسح الكارت الدهبي بصباعك أو بالماوس"],
    [".scratch-claim-label", "اكتب رقم موبايلك عشان تفكّ الكود:"],
    [".scratch-unlock-btn", "فكّ الكود"],
    [".scratch-copy-btn", "انسخ الكود"],
    [".scratch-use-btn", "استخدمه في الأوردر &larr;"],
    [".scratch-saved-note", "الكود اتحفظ! تقدر تطبّقه في صفحة الدفع."],

    /* Tablet — Photos */
    [".ios-photos", { "aria-label": "صور توميز" }],
    [".ios-photos-bar-title", "الصور"],
    [".photos-lb-close", { "aria-label": "ارجع للصور" }],
    [".photos-lb-back-label", "كل الصور"],
    [".photos-lb-prev", { "aria-label": "الصورة اللي قبلها" }],
    [".photos-lb-next", { "aria-label": "الصورة اللي بعدها" }],

    /* Tablet — Reviews */
    [".ios-reviews", { "aria-label": "تقييمات جوجل" }],
    [".ios-reviews-bar-title", "التقييمات"],
    [".reviews-score-out", "من 5"],
    [".reviews-google-cta-label", "قيّمنا على جوجل مابس"],

    /* Tablet — iOS Notification Banner */
    [".ios-notif-app", "توميز"],
    [".ios-notif-time", "دلوقتي"],
    [".ios-notif-dismiss", { "aria-label": "اقفل الإشعار" }],

    /* Tablet — Squad / Feast Calculator */
    [".ios-squad", { "aria-label": "حاسبة الشلّة والعزومة" }],
    [".ios-squad-bar-title", "حاسبة الشلّة"],
    ["[data-squad-shuffle]", { "aria-label": "بدّل الاقتراح" }],
    [".squad-people-label", "عدد الصحاب كام؟"],
    ['[data-hunger="chill"]', "ع الخفيف 🙂"],
    ['[data-hunger="hungry"]', "جعانين 🍔"],
    ['[data-hunger="starving"]', "جعانين موت 🔥"],
    [".squad-split-label", "على الفرد الواحد"],
    [".squad-total-label", "إجمالي العزومة"],
    ["[data-squad-add-label]", "ضيف أوردر الشلّة كله للسلة"],
    ["[data-squad-checkout]", "روح لصفحة الدفع &larr;"],

    /* ---------- CHECKOUT PAGE ---------- */
    [".checkout-eyebrow span:not(.checkout-eyebrow-dot)", "خلاص قرّبنا"],
    [".checkout-title", "آخر خطوة"],
    ["#step1Title", "تحب تستلم إزاي؟"],
    ["#fulfillmentToggle", { "aria-label": "طريقة الاستلام" }],
    ['.fulfillment-tab[data-method="delivery"]', "توصيل لحد البيت"],
    ['.fulfillment-tab[data-method="pickup"]', "هعدّي آخده"],
    ["#step2Title", "بياناتك"],
    ['label[for="checkoutName"]', "اسمك"],
    ["#checkoutName", { placeholder: "اكتب اسمك بالكامل", value: "علي راضي إبراهيم" }],
    ['label[for="checkoutPhone"]', "رقم موبايلك"],
    ['label[for="checkoutAddress"]', "هنوصّلك فين؟"],
    ["#checkoutAddress", { placeholder: "الشارع، العمارة، الدور، الشقة", value: "أبراج النصر، شارع 12، أسيوط" }],
    ['label[for="checkoutNotes"]', '<span>ملاحظات</span> <span class="checkout-optional-tag">لو حابب</span>'],
    ["#checkoutNotes", { placeholder: "من غير مخلل؟ مناديل زيادة؟ قولنا." }],
    ["#step3Title", "الدفع"],
    [".payment-cash-badge", "كاش"],
    ["#paymentMethodDesc", "ادفع كاش لما الأوردر يوصلك"],
    [".checkout-submit-label", "أكّد الأوردر"],
    ["#summaryHeading", "الأوردر بتاعك"],
    ["#checkoutPromoInput", { placeholder: "كود الخصم", "aria-label": "كود الخصم" }],
    ["#checkoutPromoApplyBtn", "تطبيق"],
    ["#checkoutDiscountLabel", "الخصم"],
    ["#checkoutPromoWrap + .checkout-summary-line > span:first-child", "المجموع"],
    ["#checkoutFeeLabel", "التوصيل"],
    [".checkout-grand-label", "الإجمالي"],
    [".checkout-add-more-link", '<span>زوّد أكل كمان</span> <span class="add-more-arrow" aria-hidden="true">&#8594;</span>'],
    [".checkout-empty-tray-img", { alt: "صينية توميز فاضية" }],
    [".checkout-empty-eyebrow span:not(.checkout-empty-eyebrow-dot)", "الصينية فاضية"],
    ["#checkoutEmptyHeadline", "لسه مفيش حاجة نأكدها."],
    [".checkout-empty-subcopy", "ضيف حاجة حلوة الأول — إحنا مستنيينك."],
    [".checkout-empty-cta-label", "شوف المنيو"],
    [".checkout-recovery-block", { "aria-label": "اختيارات سريعة" }],
    [".checkout-recovery-label", "نفسك في حاجة على السريع؟ &bull; الأكتر طلبًا"],
    [
      ".checkout-recovery-card",
      function (el) {
        var btn = el.querySelector("[data-quick-add]");
        var pick = btn && QUICK_PICKS[btn.getAttribute("data-quick-add")];
        if (!pick) return;
        var title = el.querySelector(".checkout-recovery-title");
        var img = el.querySelector("img");
        if (title) title.textContent = pick.title;
        if (img) img.alt = pick.full;
        btn.textContent = "+ ضيف";
        btn.setAttribute("aria-label", "ضيف " + pick.full + " للأوردر");
      }
    ],
    [".checkout-recovery-price, .checkout-num, .checkout-grand-val, .checkout-submit-pill", swapCurrency],

    /* ---------- ORDER CONFIRMATION PAGE ---------- */
    [".confirm-starburst-text", "طازة<br />وسخن"],
    [".confirm-eyebrow", "الأوردر وصلنا!"],
    [
      "#confirmHeadline",
      function (el) {
        var name = el.querySelector("#confirmFirstName");
        el.textContent = "";
        el.append("تسلم يا ");
        if (name) {
          name.textContent = "علي";
          el.append(name);
        }
        el.append("!");
      }
    ],
    [
      ".confirm-copy",
      function (el) {
        var code = el.querySelector("#confirmInlineCode");
        var phone = el.querySelector("#confirmInlinePhone");
        el.textContent = "";
        el.append("أوردرك رقم ");
        if (code) el.append(code);
        el.append(" اتسجّل والمطبخ بدأ يجهّزه حالًا. هنرن عليك على ");
        if (phone) el.append(phone);
        el.append(" عشان نأكد معاك.");
      }
    ],
    [".confirm-btn-primary span:not(.confirm-btn-circle)", "اطلب حاجة تانية"],
    ["#myOrdersBtn span:not(.confirm-btn-circle)", "طلباتي"],
    [".confirm-receipt-section", { "aria-label": "الفاتورة" }],
    ["#ordersModalTitle", "طلباتي"],
    ["#ordersModalClose", { "aria-label": "اقفل" }],
    [".receipt-summary-line:first-child > span:first-child", "المجموع"],
    ["#receiptDiscountLabel", "الخصم"],
    [".receipt-total-label", "الإجمالي"],
    [".receipt-num, .receipt-total-val", swapCurrency],

    /* ---------- PRODUCT PAGE ---------- */
    ["#pdpBadge", "جرّبها دلوقتي"],
    ["#pdpAddLabel", "ضيف للأوردر"],
    [".pdp-upsell-eyebrow", "متقفش هنا"],
    ["#pdpUpsellHeading", "يحلى معاه"]
  ];

  function starCard(card, badge, title, desc) {
    var badgeEl = card.querySelector(".star-badge:not(.is-empty)");
    var titleEl = card.querySelector(".star-title");
    var descEl = card.querySelector(".star-desc");
    var imgEl = card.querySelector(".star-visual img");
    if (badge && badgeEl) badgeEl.textContent = badge;
    if (titleEl) titleEl.textContent = title;
    if (imgEl) imgEl.alt = title;
    if (descEl) {
      descEl.textContent = desc;
      descEl.setAttribute("title", desc);
    }
  }

  var PAGE_TITLES = {
    index: "توميز — أكل شارع جامد وقرمشة تفتح النفس",
    menu: "المنيو — توميز | أجمد برجر وبيتزا في أسيوط",
    about: "حكايتنا — توميز | أجمد برجر وبيتزا في أسيوط",
    newsletter: "كلّمنا — توميز | أجمد برجر وبيتزا في أسيوط",
    checkout: "آخر خطوة — توميز | أجمد برجر وبيتزا في أسيوط",
    "order-confirmation": "الأوردر وصلنا — توميز | أجمد برجر وبيتزا في أسيوط",
    product: "تفاصيل الصنف — توميز | أجمد برجر وبيتزا في أسيوط"
  };

  function applyValue(el, value) {
    if (typeof value === "string") {
      el.innerHTML = value;
    } else if (typeof value === "function") {
      value(el);
    } else if (value) {
      Object.keys(value).forEach(function (key) {
        if (key === "html") el.innerHTML = value[key];
        else if (key === "text") el.textContent = value[key];
        else if (key === "value") {
          el.value = value[key];
          el.setAttribute("value", value[key]);
        } else el.setAttribute(key, value[key]);
      });
    }
  }

  function translatePage() {
    // Sections that were hard-locked to LTR follow the page direction in Arabic
    document.querySelectorAll(".menu-stars-section, .site-footer").forEach(function (el) {
      el.setAttribute("dir", "rtl");
      el.setAttribute("lang", "ar-EG");
    });

    AR.forEach(function (entry) {
      var nodes;
      try {
        nodes = document.querySelectorAll(entry[0]);
      } catch (e) {
        return;
      }
      nodes.forEach(function (el) {
        try {
          applyValue(el, entry[1]);
        } catch (e) {
          /* never let one string break the page */
        }
      });
    });

    var page = (window.location.pathname.split("/").pop() || "index.html").replace(/\.html?$/i, "") || "index";
    if (page.toLowerCase() === "toomy-s") page = "index";
    if (PAGE_TITLES[page]) document.title = PAGE_TITLES[page];
  }

  function injectLanguageToggle() {
    var cluster = document.querySelector(".nav-action-cluster");
    if (!cluster || cluster.querySelector(".nav-lang-toggle")) return;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-lang-toggle";
    btn.setAttribute("lang", isAr ? "en" : "ar");
    btn.setAttribute("aria-label", isAr ? "Switch to English" : "حوّل للعربي");
    btn.setAttribute("title", isAr ? "English" : "عربي");
    btn.textContent = isAr ? "EN" : "عربي";
    btn.addEventListener("click", function () {
      setLang(isAr ? "en" : "ar");
    });
    cluster.insertBefore(btn, cluster.firstChild);
  }

  function boot() {
    if (isAr) translatePage();
    injectLanguageToggle();
    removeCloak();
  }

  if (document.readyState === "loading") {
    // Registered from <head>, so this runs BEFORE script.js builds dynamic UI
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
