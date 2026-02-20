import type { GalleryAnchorElement } from "./types";
import { enableInputTracking } from "./input-mode";
import {
  createGallerySlides,
  createLightbox,
  enableWheelSwipe,
  registerCustomUi,
} from "./lightbox";

const GALLERY_SELECTOR = "#certs-gallery";

function getGalleryAnchors(gallery: Element): GalleryAnchorElement[] {
  return Array.from(gallery.querySelectorAll("a")).filter(
    (el): el is GalleryAnchorElement => el instanceof HTMLAnchorElement,
  );
}

function initGallery(): void {
  enableInputTracking();
  const gallery = document.querySelector<HTMLElement>(GALLERY_SELECTOR);

  if (!gallery || gallery.dataset.pswpInitialized === "true") return;
  gallery.dataset.pswpInitialized = "true";

  const links = getGalleryAnchors(gallery);
  const slides = createGallerySlides(links);
  const lightbox = createLightbox(GALLERY_SELECTOR);

  registerCustomUi(lightbox);
  enableWheelSwipe(lightbox);

  lightbox.init();

  gallery.addEventListener("click", (event) => {
    const eventTarget = event.target;
    if (!(eventTarget instanceof Element)) return;

    const target = eventTarget.closest("a");
    if (!(target instanceof HTMLAnchorElement) || !gallery.contains(target))
      return;

    event.preventDefault();
    const index = links.indexOf(target);
    if (index === -1) return;
    lightbox.loadAndOpen(index, slides);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGallery, { once: true });
} else {
  initGallery();
}
