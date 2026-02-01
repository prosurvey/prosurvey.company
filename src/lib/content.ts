import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export type HomeContent = {
  site: {
    lang: string;
    title: string;
    brandName: string;
    description: string;
    keywords?: string;
  };
  assets: {
    favicon: string;
    logo: string;
    heroImage: string;
    formImage: string;
    contactsImage: string;
    certifications: Array<{ image: string; title: string }>;
  };
  theme: {
    accent: string;
    bgDark: string;
    bgLight: string;
  };
  nav: {
    header: {
      items: Array<{ text: string; href: string }>;
      cta: { text: string; href: string };
    };
  };
  sections: {
    hero: {
      title: string;
      text: string;
      buttons: Array<{ text: string; href: string }>;
    };
    about: {
      id: string;
      eyebrow: string;
      title: string;
      text: string;
      stats: Array<{ value: string; label: string }>;
      note: string;
    };
    services: {
      id: string;
      title: string;
      subtitle: string;
      main: string[];
      other: string[];
    };
    request: {
      id: string;
      title: string;
      description: string;
      submitText: string;
      fields: {
        name: { label: string; required: boolean };
        phone: { label: string; required: boolean };
        email: { label: string; required: boolean };
        message: { label: string; required: boolean };
        consent: { label: string; required: boolean };
      };
      consentLinks: {
        privacy: { text: string; href: string };
        terms: { prefix: string; text: string; href: string };
      };
    };
    certifications: { id: string; title: string };
    contacts: {
      id: string;
      title: string;
      email: string;
      phoneText: string;
      phoneHref: string;
      hours: string;
      address: string;
      socials: Array<{ type: string; href: string; label: string }>;
    };
  };
  footer: {
    copyright: string;
    links: Array<{ text: string; href: string }>;
  };
  cookie: {
    enabled: boolean;
    text: string;
    link: { text: string; href: string };
  };
};

let cached: HomeContent | null = null;

export async function loadHomeContent(): Promise<HomeContent> {
  if (cached) return cached;

  // NOTE: During `astro build`, this module is executed from the emitted `dist/` bundle,
  // so `import.meta.url` would point at `dist/...` and break relative file resolution.
  // Using `process.cwd()` keeps the content path stable for both dev and build.
  const filePath = path.join(process.cwd(), "src", "content", "home.yml");
  const raw = await fs.readFile(filePath, "utf-8");
  cached = YAML.parse(raw) as HomeContent;
  return cached;
}
