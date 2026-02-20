import { describe, expect, it } from "vitest";
import { mapHomeContentToPageModel } from "../src/lib/content/mappers/home-page";
import type { HomeContent } from "../src/lib/content/schemas/home";

const fixtureContent: HomeContent = {
  site: {
    lang: "ru",
    title: "Title",
    brandName: "Brand",
    description: "Description",
    keywords: "a,b",
  },
  assets: {
    favicon: "/favicon.png",
    logo: "/logo.svg",
    heroImage: "/hero.png",
    formImage: "/form.png",
    certifications: [
      { image: "/cert.jpg", title: "Cert", width: 1200, height: 1600 },
    ],
  },
  theme: {
    accent: "#111111",
    bgDark: "#222222",
    bgLight: "#f5f5f5",
  },
  nav: {
    header: {
      items: [{ text: "About", href: "#about" }],
      cta: { text: "CTA", href: "#request" },
    },
  },
  sections: {
    hero: {
      title: "Hero",
      text: "Text",
      buttons: [{ text: "More", href: "#about" }],
    },
    about: {
      id: "about",
      eyebrow: "e",
      title: "a",
      text: "a",
      stats: [{ value: "1", label: "x" }],
      note: "n",
    },
    services: {
      id: "services",
      title: "s",
      subtitle: "s",
      main: ["m"],
      other: ["o"],
    },
    request: {
      id: "request",
      title: "r",
      description: "d",
      submitText: "send",
      fields: {
        name: { label: "name", required: true },
        phone: { label: "phone", required: true },
        email: { label: "email", required: true },
        message: { label: "message", required: false },
        consent: { label: "consent", required: true },
      },
      messages: { success: "ok" },
      consentLinks: {
        privacy: { text: "privacy", href: "/privacypol" },
        terms: { prefix: "и", text: "terms", href: "/termofuse" },
      },
    },
    certifications: { id: "cert", title: "cert" },
    contacts: {
      id: "contacts",
      title: "c",
      email: "mail@test.com",
      phoneText: "+1",
      phoneHref: "tel:+1",
      hours: "24/7",
      socials: [{ type: "tg", href: "#", label: "Telegram" }],
    },
  },
  footer: {
    copyright: "©",
    links: [{ text: "Privacy", href: "/privacypol" }],
  },
  cookie: {
    enabled: true,
    acceptText: "accept",
    text: "cookies",
    link: { text: "privacy", href: "/privacypol" },
  },
};

describe("mapHomeContentToPageModel", () => {
  it("maps source content into page model without mutating core values", () => {
    const pageModel = mapHomeContentToPageModel(fixtureContent);

    expect(pageModel.layout.title).toBe("Title");
    expect(pageModel.header.logoHref).toBe("/logo.svg");
    expect(pageModel.certifications.items[0]).toEqual({
      imageHref: "/cert.jpg",
      title: "Cert",
      width: 1200,
      height: 1600,
    });
    expect(pageModel.request.imageHref).toBe("/form.png");
    expect(pageModel.cookie.enabled).toBe(true);
  });
});
