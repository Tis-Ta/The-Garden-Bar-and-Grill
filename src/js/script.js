"use strict";
import Swup from "swup";
import SwupHeadPlugin from "@swup/head-plugin";

document.addEventListener("DOMContentLoaded", () => {
  initPageScripts();
  initSwup();
  activateHamburgerMenu();
  updateActiveNavLink();
  darkMode();
  initDarkToggleText();
  initLogoEasterEgg();
  secondaryPageSvgInit();
  initAboutCarousel();
  initMenu();
  initLazyImages();
  createImageTags();
  initGallery();
  scrollToTop();
  stopTransitionOnResize();
});

window.addEventListener("load", () => {
  requestAnimationFrame(() => {
    document.documentElement.classList.remove("is-loading");
    gsapOpeningHomeAnimations();
  });
});

////////////////////////////////* Swup page navigation *//////////////////////////////////////////////////////////////////////////////////////*

function initSwup() {
  const swup = new Swup({
    containers: ["#swup", "#swup-header-container", "#footer"],
    animateHistoryBrowsing: true,
    respectScroll: false,

    plugins: [
      new SwupHeadPlugin({
        awaitAssets: false,
        persistAssets: true,
      }),
    ],
  });

  swup.hooks.on("page:view", () => {
    initPageScripts();
    initDarkToggleText();
    activateHamburgerMenu();
    updateActiveNavLink();
    darkMode();
    initLogoEasterEgg();
    secondaryPageSvgInit();
    initAboutCarousel();
    initMenu();
    initLazyImages();
    createImageTags();
    initGallery();
    scrollToTop();
    stopTransitionOnResize();
  });
}

function initPageScripts() {
  setTimeout(() => {
    secondaryPageSvgInit(); // Re-run to make sure code prevents the side svg from animating in when coming from home page after the inital animation
  }, 1500);

  document.body.classList.remove("home", "secondary-pages");

  if (
    window.location.pathname === "/" ||
    window.location.pathname.endsWith("index.html")
  ) {
    document.body.classList.add("home");
    initHomeBackground();
  } else {
    document.body.classList.add("secondary-pages");

    if (bgInterval) clearInterval(bgInterval);
    if (bgObserver) bgObserver.disconnect();
  }

  // Re-run svgs to force repaint of box-shadows for mobile
  document.addEventListener("swup:animationInDone", () => {
    document.querySelectorAll(".gallery-book-svg").forEach((svg) => {
      svg.style.willChange = "transform";
      svg.style.transform = "translateZ(0)";
      setTimeout(() => {
        svg.style.transform = "";
        svg.style.willChange = "";
      }, 50);
    });
  });
}

///////////////////////////////////////////////////////////* Home intro animations *//////////////////////////////////////////////////////////////////////////*

function gsapOpeningHomeAnimations() {
  /* return; */

  const body = document.querySelector("body");
  const home = document.querySelector("body.home");
  const isMotionReduced = matchMedia("(prefers-reduced-motion: reduce)");

  //Remove wait for transitions if not on the main page
  if (body.classList.contains("secondary-pages")) {
    document.body.classList.add("loaded");
    return;
  }

  requestAnimationFrame(() => {
    document.body.classList.add("bg-fade-in");
  });

  if (!home || isMotionReduced.matches) return;

  const tl = gsap.timeline({
    defaults: { ease: "power3.out" },
    delay: 0.75,
  });

  gsap.set(".split-overlay", { display: "block" });

  tl.to(
    ".split-overlay--center",
    {
      clipPath: "inset(0% 0% 0% 100%)",
      duration: 0.75,
      ease: "power1.out",
    },
    "-=0.3",
  )
    .to({}, { duration: 0.65 })
    .to(
      ".split-overlay--top",
      { yPercent: -100, duration: 4, ease: "power4.out" },
      "+=0",
    )
    .to(
      ".split-overlay--bottom",
      { yPercent: 100, duration: 4, ease: "power4.out" },
      "-=4",
    )
    .to(".split-overlay", {
      duration: 0.01,
      onComplete() {
        gsap.set(".split-overlay", { display: "none", clearProps: "all" });
      },
    })
    .from(
      "#hero-title",
      {
        y: 100,
        opacity: 0,
        duration: 1.5,
      },
      "-=1",
    )
    .from(
      "#header",
      {
        y: -100,
        opacity: 0,
        duration: 1.5,
      },
      "-=0.5",
    )
    .from(
      "#footer",
      {
        opacity: 0,
        x: 200,
        duration: 1.25,
      },
      "-=1.5",
    )
    .from(
      ".hero-main-logo-container",
      {
        scale: 0.1,
        opacity: 0,
        duration: 2,
        onComplete() {
          // Change body classes so swup takes over animations for page changes
          document.body.classList.remove("loading");
          document.body.classList.remove("bg-fade-in");
          document.body.classList.add("loaded");
        },
      },
      "-=1",
    )
    .from(
      ".cmp-info-text--pg1",
      {
        scale: 0.1,
        opacity: 0,
        duration: 2,
      },
      "-=0",
    );
}

///////////////////////////////////////////////////////* Home section background image transitions *////////////////////////////////////////////////////////*

const dayImagesLarge = [];
const dayImagesMedium = [];
const dayImagesSmall = [];
const nightImagesLarge = [];
const nightImagesMedium = [];
const nightImagesSmall = [];
let bgInterval = null;
let bgObserver = null;

(function fillImageArrays() {
  for (let i = 1; i < 16; i++) {
    const dayLarge = `/assets/images/day/garden-day-${i}.webp`;
    const dayMedium = `/assets/images/day/garden-day-${i}-m.webp`;
    const daySmall = `/assets/images/day/garden-day-${i}-s.webp`;
    const nightLarge = `/assets/images/night/garden-night-${i}.webp`;
    const nightMedium = `/assets/images/night/garden-night-${i}-m.webp`;
    const nightSmall = `/assets/images/night/garden-night-${i}-s.webp`;

    dayImagesLarge.push(dayLarge);
    dayImagesMedium.push(dayMedium);
    dayImagesSmall.push(daySmall);
    nightImagesLarge.push(nightLarge);
    nightImagesMedium.push(nightMedium);
    nightImagesSmall.push(nightSmall);
  }
})();

function initHomeBackground() {
  const home = document.querySelector("body.home");
  if (!home) return;

  let currentIndex = 0;
  let stopBackground = false;
  let toggle = false;
  const intervalTime = 7500;

  home.classList.remove("bg-fade-in", "with-transition");

  requestAnimationFrame(() => {
    home.classList.add("bg-fade-in");
  });

  const imageCache = new Map();

  function preloadImage(src) {
    if (imageCache.has(src)) return;

    const img = new Image();
    img.src = src;

    imageCache.set(src, img);
  }

  function stopImagesOnChange() {
    const navLinks = document.querySelectorAll("nav a");
    const pageLinks = document.querySelectorAll(".cmp-main-btn--pg1-s1");

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        stopBackground = true;
      });
    });

    pageLinks.forEach((link) => {
      link.addEventListener("click", () => {
        stopBackground = true;
      });
    });
  }

  stopImagesOnChange();

  let theme =
    localStorage.getItem("theme") ||
    (window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light");

  function checkScreenSize() {
    if (window.matchMedia("(max-width: 425px)").matches) return "small";
    else if (
      window.matchMedia("(min-width: 425px) and (max-width: 700px)").matches
    )
      return `medium`;
    else return "large";
  }

  function getCurrentSet() {
    if (checkScreenSize() === "small") {
      return theme === "light" ? dayImagesSmall : nightImagesSmall;
    } else if (checkScreenSize() === "medium") {
      return theme === "light" ? dayImagesMedium : nightImagesMedium;
    } else {
      return theme === "light" ? dayImagesLarge : nightImagesLarge;
    }
  }

  let currentSet = getCurrentSet();

  function showImage(index) {
    if (stopBackground) return;

    const nextIndex = (index + 1) % currentSet.length;
    preloadImage(currentSet[nextIndex]);

    const url = `url(${currentSet[index]})`;

    if (toggle) {
      home.style.setProperty("--bg-before", url);
      home.style.setProperty("--before-opacity", 1);
      home.style.setProperty("--after-opacity", 0);
    } else {
      home.style.setProperty("--bg-after", url);
      home.style.setProperty("--before-opacity", 0);
      home.style.setProperty("--after-opacity", 1);
    }

    toggle = !toggle;
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % currentSet.length;
    showImage(currentIndex);
  }

  showImage(currentIndex);

  setTimeout(() => {
    home.classList.add("with-transition");
  }, 2000);

  if (bgInterval) clearInterval(bgInterval);
  bgInterval = setInterval(nextImage, intervalTime);

  if (bgObserver) bgObserver.disconnect();
  bgObserver = new MutationObserver(() => {
    theme = document.documentElement.classList.contains("dark-mode")
      ? "dark"
      : "light";

    currentSet = getCurrentSet();
    currentIndex = 0;
    showImage(currentIndex);

    clearInterval(bgInterval);
    bgInterval = setInterval(nextImage, intervalTime);
  });

  bgObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  window.addEventListener("resize", () => {
    const newSet = getCurrentSet();
    if (newSet !== currentSet) {
      currentSet = newSet;
      currentIndex = 0;
      showImage(currentIndex);
    }
  });
}

///////////////////////////////////////////////////////* Secondary pages side-svg transitions */////////////////////////////////////////////////////////////*

function secondaryPageSvgInit() {
  const svgBox = document.querySelector(".side-svg-decor-box");
  const body = document.querySelector("body");

  if (body.classList.contains("home")) {
    svgBox.style.opacity = "0";
  } else {
    svgBox.style.opacity = "1";
  }
}

///////////////////////////////////////////////////////* About section carousel function *///////////////////////////////////////////////////////////////////*

function initAboutCarousel() {
  const track = document.querySelector(".about-image-track");
  const container = document.querySelector(".about-flex__carousel");

  if (!track || !container || typeof gsap === "undefined") return;

  for (let i = 1; i <= 20; i++) {
    const file = `${i}`;
    const alt = `Carousel image ${i} of 20.`;

    const a = document.createElement("a");
    a.className = "glightbox";
    a.dataset.gallery = "about-carousel";
    a.dataset.srcset = `/assets/images/carousel/${file}-s.webp 600w, /assets/images/carousel/${file}-l.webp 1920w`;
    a.dataset.sizes = "100vw";
    a.dataset.type = "image";

    const picture = document.createElement("picture");
    const sourceWebp = document.createElement("source");
    const img = document.createElement("img");

    sourceWebp.srcset = `/assets/images/carousel/${file}-s.webp`;
    sourceWebp.sizes = "100vw";
    sourceWebp.type = "image/webp";

    img.width = 400;
    img.height = 300;
    img.decoding = "async";
    img.loading = "lazy";
    img.alt = alt;

    picture.appendChild(sourceWebp);
    picture.appendChild(img);

    a.appendChild(picture);
    track.appendChild(a);
  }

  window.lightbox = GLightbox({
    selector: ".glightbox",
    loop: false,
    zoomable: true,
    keyboardNavigation: true,
    touchNavigation: true,
    openEffect: "fade",
    closeEffect: "fade",
  });

  const scrollImages = container.querySelectorAll("img");

  function updateImageVisibility() {
    const containerRect = container.getBoundingClientRect();
    const visibilityThreshold = 0.4; // Change to set when the next image fades in

    scrollImages.forEach((img) => {
      const rect = img.getBoundingClientRect();
      const imgHeight = rect.height;

      const visibleHeight =
        Math.min(rect.bottom, containerRect.bottom) -
        Math.max(rect.top, containerRect.top);

      const visibilityRatio = visibleHeight / imgHeight;

      gsap.to(img, {
        opacity: visibilityRatio >= visibilityThreshold ? 1 : 0,
        duration: 0.6,
        ease: "power1.out",
      });
    });
  }

  updateImageVisibility();
  container.addEventListener("scroll", updateImageVisibility);

  container.style.webkitOverflowScrolling = "touch";
  container.style.overflowY = "auto";
}

/////////////////////////////////////////////////////* Menu section modal image logic *//////////////////////////////////////////////////////////////////////*

function initMenu() {
  document.querySelectorAll(".food-btn button").forEach((button) => {
    button.addEventListener("click", () => {
      const lang = button.dataset.lang;
      let images = [];

      switch (lang) {
        case "en":
          images = [
            { href: "/assets/images/menu/english-1.webp", type: "image" },
            { href: "/assets/images/menu/english-2.webp", type: "image" },
          ];
          break;
        case "pt":
          images = [
            { href: "/assets/images/menu/portuguese-1.webp", type: "image" },
            { href: "/assets/images/menu/portuguese-2.webp", type: "image" },
          ];
          break;
        case "de":
          images = [
            { href: "/assets/images/menu/german-1.webp", type: "image" },
            { href: "/assets/images/menu/german-2.webp", type: "image" },
          ];
          break;
        case "fr":
          images = [
            { href: "/assets/images/menu/french-1.webp", type: "image" },
            { href: "/assets/images/menu/french-2.webp", type: "image" },
          ];
          break;
        case "dr":
          images = [
            { href: "/assets/images/menu/drinks-1.webp", type: "image" },
            { href: "/assets/images/menu/drinks-2.webp", type: "image" },
          ];
          break;
        case "bw":
          images = [
            { href: "/assets/images/menu/beer-wine-1.webp", type: "image" },
            { href: "/assets/images/menu/beer-wine-2.webp", type: "image" },
          ];
          break;
      }

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;

      if (images.length > 0) {
        const menuLightbox = GLightbox({
          elements: images,
          loop: false,
          zoomable: false,
          keyboardNavigation: true,
          touchNavigation: true,
          openEffect: prefersReducedMotion ? "none" : "fade",
          closeEffect: prefersReducedMotion ? "none" : "fade",
        });

        menuLightbox.open();
      }
    });
  });
}

////////////////////////////////////////////////////* Gallery section album books *///////////////////////////////////////////////////////////////////////////*

function initGallery() {
  const galleryRoot = document.querySelector(".gallery-page");
  const galleryMain = document.querySelector("main.gallery-page");

  if (
    !galleryRoot ||
    typeof gsap === "undefined" ||
    typeof GLightbox === "undefined"
  )
    return;

  if (window.lightbox && typeof window.lightbox.destroy === "function") {
    window.lightbox.destroy();
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  window.lightbox = GLightbox({
    selector: ".glightbox",
    loop: false,
    zoomable: true,
    keyboardNavigation: true,
    touchNavigation: true,
    openEffect: prefersReducedMotion ? "none" : "fade",
    closeEffect: prefersReducedMotion ? "none" : "fade",
  });

  galleryRoot.querySelectorAll("a.glightbox").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  });

  const albumImages = galleryRoot.querySelectorAll(".album-grid img");
  albumImages.forEach((img) => img.setAttribute("loading", "lazy"));

  const books = galleryRoot.querySelectorAll(".gallery-book-svg-box__wrapper");
  const wrappers = galleryRoot.querySelectorAll(".album-wrapper");
  const backButtons = galleryRoot.querySelectorAll(".album-grid__btn");
  const bookTimelines = [];
  let animationOnGoing = false;

  books.forEach((wrapper) => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia("(max-width: 62.5rem)").matches
    )
      return;

    wrapper.addEventListener("mouseenter", () => {
      if (animationOnGoing) return;

      gsap.fromTo(
        wrapper,
        { scaleX: 1, scaleY: 1 },
        {
          keyframes: [
            {
              scaleX: 1.15,
              scaleY: 0.85,
              duration: 0.25,
              ease: "power1.inOut",
            },
            {
              scaleX: 0.85,
              scaleY: 1.05,
              duration: 0.15,
              ease: "power1.inOut",
            },
            { scaleX: 1, scaleY: 1, duration: 0.2, ease: "power1.inOut" },
          ],
        },
      );
    });
  });

  function showAlbum(index) {
    animationOnGoing = true;

    const wrapper = wrappers[index];
    const booksBox = document.querySelector(".gallery-book-svg-box");
    const album = wrapper.querySelector(".album-grid");
    const images = album.querySelectorAll("img");

    wrappers.forEach((w) => w.classList.add("hidden"));
    wrapper.classList.remove("hidden");

    const tl = gsap.timeline({
      onComplete: () => {
        animationOnGoing = false;
        books.forEach((book) => (book.style.display = "none"));
      },
    });

    setTimeout(() => {
      booksBox.classList.add("absolute-position");
    }, 1500);

    // Animate clicked book
    tl.to(books[index], {
      duration: 1.75,
      scale: 2,
      rotation: -15,
      opacity: 0,
      transformOrigin: "50% 50%",
      ease: "power2.inOut",
      delay: 0.2,
    });

    // Animate other book flying away
    books.forEach((book, i) => {
      if (i !== index) {
        tl.to(
          book,
          {
            duration: 1.75,
            opacity: 0,
            x: i % 2 === 0 ? -300 : 300,
            y: -100,
            rotation: i % 2 === 0 ? -30 : 30,
            scale: 0.1,
            ease: "power1.in",
          },
          0,
        );
      }
    });

    album.style.pointerEvents = "none"; // Prevent opening image while animating

    // Fade in album
    tl.fromTo(
      album,
      { opacity: 0 },
      {
        duration: 1.25,
        opacity: 1,
        ease: "power4.in",
        onComplete: () => {
          album.style.pointerEvents = "auto";
        },
      },
      "-=1",
    );

    ////// Animate images in
    gsap.fromTo(
      images,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.35,
        stagger: 0.05,
        ease: "power4.in",
        delay: 1.25,
      },
    );

    setTimeout(() => {
      window.scrollTo({ top: 80, behavior: "smooth" });
    }, 1700);

    bookTimelines[index] = tl;
  }

  function hideAlbum() {
    animationOnGoing = true;

    const openWrapper = galleryRoot.querySelector(
      ".album-wrapper:not(.hidden)",
    );

    if (!openWrapper) return;

    const albumIndex = [...wrappers].indexOf(openWrapper);
    const tl = bookTimelines[albumIndex];
    const booksBox = document.querySelector(".gallery-book-svg-box");
    const album = document.querySelector(`.album-grid--${albumIndex + 1}`);

    album.style.pointerEvents = "none"; // Prevent opening image while animating

    setTimeout(() => {
      booksBox.classList.remove("absolute-position"); // Remove absolute class which was preventing books from taking up dom space
    }, 600);

    if (tl) {
      const images = openWrapper.querySelectorAll("img");

      ////// Fade out images
      gsap.to(images, {
        opacity: 0,
        duration: 0.8,
        y: 10,
        ease: "power3.in",
      });

      books.forEach((book) => (book.style.display = "block"));

      // Reverse timeline and reset books
      tl.reverse().then(() => {
        openWrapper.classList.add("hidden");
        books.forEach((book) =>
          gsap.set(book, { clearProps: "all", opacity: 1, scale: 1 }),
        );
        animationOnGoing = false;
      });
    }
  }

  ///// Bind events
  books.forEach((book, index) =>
    book.addEventListener("click", () => showAlbum(index)),
  );
  backButtons.forEach((btn) => btn.addEventListener("click", hideAlbum));
}

// Lazy load images so as not to load all images as soon as a user enters an album. Observer is defined at the very top of the page.
let observer;

function initLazyImages(container) {
  if (!container) return;

  const isMobile = window.matchMedia("(max-width: 768px)").matches;

  observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const img = entry.target;

        img.src = img.dataset.src;

        if (img.dataset.srcset) {
          img.srcset = img.dataset.srcset;
        }

        obs.unobserve(img);
      });
    },
    {
      rootMargin: isMobile ? "800px" : "400px",
    },
  );

  const images = container.querySelectorAll("img[data-src]");
  images.forEach((img) => observer.observe(img));
}

///// Loop to create the image tags within the HTML
function createImageTags() {
  function tags2012() {
    const container = document.querySelector(".album-grid--1");

    if (!container) return;

    for (let i = 1; i <= 328; i++) {
      const a = document.createElement("a");
      a.className = "glightbox";
      a.dataset.gallery = "album1";
      a.dataset.href = `/assets/images/book-start/${i}-l.webp`;
      a.dataset.srcset = `/assets/images/book-start/${i}-s.webp 1000w, /assets/images/book-start/${i}-l-m.webp 1400w, /assets/images/book-start/${i}-l.webp 1920w`;
      a.dataset.sizes = "100vw";
      a.dataset.type = "image";

      const img = document.createElement("img");
      img.dataset.src = `/assets/images/book-start/${i}-s-xs.webp`;
      img.width = 400;
      img.height = 300;
      img.alt = `Image ${i}`;
      img.decoding = "async";

      a.appendChild(img);
      container.appendChild(a);
    }
  }

  function tags2016() {
    const container = document.querySelector(".album-grid--2");

    if (!container) return;

    for (let i = 1; i <= 365; i++) {
      if (i === 73) continue;

      const a = document.createElement("a");
      a.className = "glightbox";
      a.dataset.gallery = "album2";
      a.dataset.href = `/assets/images/book-2016/${i}-l.webp`;
      a.dataset.srcset = `/assets/images/book-2016/${i}-s.webp 800w, /assets/images/book-2016/${i}-l-m.webp 1400w, /assets/images/book-2016/${i}-l.webp 1920w`;
      a.dataset.sizes = "100vw";
      a.dataset.type = "image";

      const img = document.createElement("img");
      img.dataset.src = `/assets/images/book-2016/${i}-s-xs.webp`;
      img.width = 400;
      img.height = 300;
      img.alt = `Image ${i}`;
      img.decoding = "async";

      a.appendChild(img);
      container.appendChild(a);
    }
  }

  function tagsBeer() {
    const container = document.querySelector(".album-grid--3");

    if (!container) return;

    for (let i = 2; i <= 22; i++) {
      const a = document.createElement("a");
      a.className = "glightbox";
      a.dataset.gallery = "album3";
      a.dataset.href = `/assets/images/beer-fest/${i}-l.webp`;
      a.dataset.srcset = `/assets/images/beer-fest/${i}-s.webp 800w, /assets/images/beer-fest/${i}-l-m.webp 1400w, /assets/images/beer-fest/${i}-l.webp 1920w`;
      a.dataset.sizes = "100vw";
      a.dataset.type = "image";

      const img = document.createElement("img");
      img.dataset.src = `/assets/images/beer-fest/${i}-s-xs.webp`;
      img.width = 400;
      img.height = 300;
      img.alt = `Image ${i}`;
      img.decoding = "async";

      a.appendChild(img);
      container.appendChild(a);
    }
  }

  tags2012();
  initLazyImages(document.querySelector(".album-grid--1"));

  tags2016();
  initLazyImages(document.querySelector(".album-grid--2"));

  tagsBeer();
  initLazyImages(document.querySelector(".album-grid--3"));
}

function scrollToTop() {
  const button = document?.querySelector(".scrollToTopButton");

  if (!button) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 800) {
      button.style.opacity = "1";
      button.style.pointerEvents = "auto";
      button.style.position = "fixed";
    } else {
      button.style.opacity = "0";
      button.style.pointerEvents = "none";
      button.style.position = "static";
    }
  });

  button?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/////////////////////////////////////////////////////////////* Main page logo easter egg *//////////////////////////////////////////////////////////////////////*

function initLogoEasterEgg() {
  const logo = document.querySelector(".hero-main-logo");
  const easterEgg = document.querySelector(".hero-main-logo__easter-egg");

  if (!logo || !easterEgg) return;

  logo.addEventListener("click", () => {
    easterEgg.classList.add("easter-egg-active");

    setTimeout(() => {
      easterEgg.classList.remove("easter-egg-active");
    }, 4000);
  });
}

///////////////////////////////////////////////////////* Navigation links and hamburger menu *//////////////////////////////////////////////////////////////////////*

function activateHamburgerMenu() {
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const navBar = document.querySelector(".nav-bar");
  const navBarList = document.querySelector(".nav-bar ul");

  let isAnimating = false;

  hamburgerBtn.addEventListener("click", () => {
    if (isAnimating) return;

    const isOpen = navBar.classList.contains("hamburger-btn__open");

    if (isOpen) {
      isAnimating = true;
      hamburgerBtn.classList.remove("active");
      navBar.classList.remove("hamburger-btn__open");
    } else {
      navBar.style.display = "block";
      requestAnimationFrame(() => {
        isAnimating = true;
        hamburgerBtn.classList.add("active");
        navBar.classList.add("hamburger-btn__open");
      });
    }

    setNavAttributes();

    setTimeout(() => {
      isAnimating = false;
    }, 400);
  });

  navBar.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform") return;

    isAnimating = false;
  });

  document.addEventListener("click", (e) => {
    if (
      !navBar.classList.contains("hamburger-btn__open") ||
      isAnimating ||
      e.target === navBar ||
      e.target === hamburgerBtn ||
      e.target === navBarList
    )
      return;

    isAnimating = true;
    hamburgerBtn.classList.remove("active");
    navBar.classList.remove("hamburger-btn__open");

    setNavAttributes();
  });
}

function setNavAttributes() {
  const navBar = document.querySelector(".nav-bar");
  const navBarLinks = document.querySelectorAll(".nav-bar a");
  const navBarHasActiveClass = navBar.classList.contains("hamburger-btn__open");
  const hamburgerBtn = document.querySelector(".hamburger-btn");

  if (!navBarHasActiveClass && navBar.contains(document.activeElement)) {
    document.activeElement.blur();
  }

  navBar.setAttribute("aria-hidden", String(!navBarHasActiveClass));
  hamburgerBtn.setAttribute("aria-expanded", String(navBarHasActiveClass));

  navBarLinks.forEach((link) => {
    link.tabIndex = navBarHasActiveClass ? 0 : -1;
  });
}

/////////////////////////////////////////////////////////////* Show the current page *////////////////////////////////////////////////////////////////////////////////*

function updateActiveNavLink() {
  const navBarLinks = document.querySelectorAll(".nav-bar a");
  const currentPath = window.location.pathname;

  navBarLinks.forEach((link) => {
    const linkPath = new URL(link.href).pathname;

    if (linkPath === currentPath) {
      link.classList.add("active-link");

      requestAnimationFrame(() => {
        link.classList.add("animate-underline");
      });
    } else {
      link.classList.remove("active-link", "animate-underline");
    }
  });
}

////////////////////////////////////////////////////////////////* Dark-mode change *////////////////////////////////////////////////////////////////////////*

function darkMode() {
  const darkModeButton = document.getElementById("dark-mode-toggle");

  function enableDarkMode() {
    document.documentElement.classList.add("dark-mode");
    localStorage.setItem("theme", "dark");
  }

  function disableDarkMode() {
    document.documentElement.classList.remove("dark-mode");
    localStorage.setItem("theme", "light");
  }

  (function detectColorScheme() {
    const bodyEl = document.querySelector("body");
    let theme = "light";

    if (localStorage.getItem("theme")) {
      theme = localStorage.getItem("theme");
    } else if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      theme = "dark";
    }

    if (theme === "light" && bodyEl.classList.contains("home")) {
      disableDarkMode();
    } else if (theme === "dark" && bodyEl.classList.contains("home")) {
      enableDarkMode();
    }
  })();

  function switchTheme(newTheme) {
    newTheme === "dark" ? enableDarkMode() : disableDarkMode();
  }

  darkModeButton.addEventListener("click", () => {
    const home = document.querySelector("body.home");
    const isPressed = darkModeButton.getAttribute("aria-pressed") === "true";
    darkModeButton.setAttribute("aria-pressed", String(!isPressed));

    const currentTheme = localStorage.getItem("theme") || "light";
    const newTheme = currentTheme === "light" ? "dark" : "light";

    home?.classList.remove("with-transition");

    setTimeout(() => {
      home?.classList.add("with-transition"); // Remove transition class for a small delay as button is pressed to prevent background-image transition from happening
    }, 1000);

    if (!document.startViewTransition) {
      switchTheme(newTheme);
      return;
    }

    document.startViewTransition(() => {
      switchTheme(newTheme);
    });
  });
}

///////////////////////////////////////////////////////* Dark toggle day/night text change *////////////////////////////////////////////////////////*

function initDarkToggleText() {
  const textBox = document.querySelector(".dark-toggle-text-box");
  const body = document.querySelector("body");

  if (body.classList.contains("secondary-pages")) {
    textBox.style.display = "none";
    return;
  } else {
    textBox.style.display = "flex";
  }

  const day = textBox.querySelector(".dark-toggle-text__day");
  const night = textBox.querySelector(".dark-toggle-text__night");

  function updateMode() {
    if (!day && !night) return;

    const isDark = document.documentElement.classList.contains("dark-mode");
    day.style.display = isDark ? "flex" : "none";
    night.style.display = isDark ? "none" : "flex";
  }

  const observer = new MutationObserver(updateMode);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
}

/////////////////////////////////////* Prevent navigation transitions happening on resize *////////////////////////////////////////////////////////*

function stopTransitionOnResize() {
  const navBar = document.querySelector(".nav-bar");
  let resizeTimeout;

  window.addEventListener("resize", () => {
    navBar.classList.add("no-transition");

    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      navBar.classList.remove("no-transition");
    }, 1);
  });
}
