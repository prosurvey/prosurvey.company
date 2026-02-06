import PhotoSwipeLightbox from "photoswipe/lightbox";

const enableInputTracking = () => {
  const body = document.body;
  if (!body || body.dataset.inputTracking === "true") return;

  body.dataset.inputTracking = "true";

  const markPointer = () => {
    body.dataset.input = "pointer";
  };

  const markKeyboard = (event) => {
    if (event.key === "Tab" || event.key.startsWith("Arrow")) {
      body.dataset.input = "keyboard";
    }
  };

  document.addEventListener("pointerdown", markPointer, { passive: true });
  document.addEventListener("keydown", markKeyboard);
};

const initGallery = () => {
  enableInputTracking();
  const gallery = document.querySelector("#certs-gallery");

  if (!gallery || gallery.dataset.pswpInitialized === "true") return;
  gallery.dataset.pswpInitialized = "true";

  const lightbox = new PhotoSwipeLightbox({
    gallery: "#certs-gallery",
    children: "a",
    pswpModule: () => import("photoswipe"),
    bgOpacity: 0.96,
    spacing: 0.12,
    wheelToZoom: false,
    showHideAnimationType: "fade",
    showHideOpacity: true,
    showAnimationDuration: 200,
    hideAnimationDuration: 180,
    zoomAnimationDuration: 180,
    easing: "cubic-bezier(0.2, 0, 0, 1)",
    preloadFirstSlide: true,
    initialZoomLevel: "fit",
    paddingFn: (viewportSize) => ({
      top: Math.max(24, viewportSize.y * 0.06),
      bottom: Math.max(24, viewportSize.y * 0.06),
      left: Math.max(16, viewportSize.x * 0.06),
      right: Math.max(16, viewportSize.x * 0.06),
    }),
  });

  const links = Array.from(gallery.querySelectorAll("a"));
  const slides = links.map((link) => ({
    src: link.dataset.pswpSrc || link.getAttribute("href") || "",
    width: Number(link.dataset.pswpWidth) || 0,
    height: Number(link.dataset.pswpHeight) || 0,
    element: link,
  }));

  lightbox.on("uiRegister", () => {
    lightbox.pswp.ui.registerElement({
      name: "download-button",
      order: 8,
      isButton: true,
      tagName: "a",
      html: `
        <svg class="pswp__icn" viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            d="M12 3a1 1 0 0 1 1 1v8.59l2.3-2.3a1 1 0 1 1 1.4 1.42l-4.01 4a1 1 0 0 1-1.4 0l-4.01-4a1 1 0 1 1 1.42-1.42L11 12.59V4a1 1 0 0 1 1-1Zm-7 14a1 1 0 0 1 1 1v2h12v-2a1 1 0 1 1 2 0v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z"
          />
        </svg>
      `,
      onInit: (el, pswp) => {
        el.classList.add("pswp__button", "pswp__button--download");
        el.setAttribute("download", "");
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener");
        el.setAttribute("aria-label", "Скачать сертификат");
        el.setAttribute("title", "Скачать сертификат");

        const update = () => {
          const src = pswp.currSlide?.data?.src;
          if (src) {
            el.setAttribute("href", src);
          }
        };

        update();
        pswp.on("change", update);
      },
    });

    lightbox.pswp.ui.registerElement({
      name: "custom-caption",
      order: 9,
      isButton: false,
      appendTo: "root",
      html: "",
      onInit: (el, pswp) => {
        const updateCaption = () => {
          const currSlideElement = pswp.currSlide?.data?.element;
          const caption =
            currSlideElement?.dataset?.pswpCaption ||
            currSlideElement?.getAttribute("aria-label")?.replace("Открыть ", "") ||
            "";
          el.textContent = caption;
          el.classList.toggle("is-empty", !caption);
        };

        updateCaption();
        pswp.on("change", updateCaption);
      },
    });
  });

  lightbox.on("afterInit", () => {
    const pswp = lightbox.pswp;
    if (!pswp?.element) return;

    let lastWheelTime = 0;
    pswp.element.addEventListener(
      "wheel",
      (event) => {
        if (event.ctrlKey) return;
        const absX = Math.abs(event.deltaX);
        const absY = Math.abs(event.deltaY);
        if (absX < 30 || absX < absY) return;
        const now = Date.now();
        if (now - lastWheelTime < 450) return;
        lastWheelTime = now;
        event.preventDefault();
        const velocity = Math.min(4, Math.max(1, absX / 120));
        const direction = event.deltaX > 0 ? 1 : -1;
        pswp.mainScroll.moveIndexBy(direction, true, velocity * direction);
      },
      { passive: false }
    );
  });

  lightbox.init();

  gallery.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target.closest("a") : null;
    if (!target || !gallery.contains(target)) return;
    event.preventDefault();
    const index = links.indexOf(target);
    if (index === -1) return;
    lightbox.loadAndOpen(index, slides);
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGallery, { once: true });
} else {
  initGallery();
}
