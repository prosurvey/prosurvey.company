import type { HomeContent } from "../schemas/home";

export type HomePageModel = {
  layout: {
    lang: string;
    title: string;
    description: string;
    keywords?: string;
    faviconHref: string;
    theme: HomeContent["theme"];
  };
  header: {
    logoHref: string;
    logoAlt: string;
    navItems: HomeContent["nav"]["header"]["items"];
    cta: HomeContent["nav"]["header"]["cta"];
  };
  hero: HomeContent["sections"]["hero"] & { imageHref: string };
  about: HomeContent["sections"]["about"];
  services: HomeContent["sections"]["services"];
  request: HomeContent["sections"]["request"] & { imageHref: string };
  certifications: {
    id: string;
    title: string;
    items: Array<{
      imageHref: string;
      title: string;
      width: number;
      height: number;
    }>;
  };
  contacts: HomeContent["sections"]["contacts"];
  footer: {
    navItems: HomeContent["nav"]["header"]["items"];
    links: HomeContent["footer"]["links"];
    copyright: string;
  };
  cookie: HomeContent["cookie"];
};

export function mapHomeContentToPageModel(
  homeContent: HomeContent,
): HomePageModel {
  return {
    layout: {
      lang: homeContent.site.lang,
      title: homeContent.site.title,
      description: homeContent.site.description,
      keywords: homeContent.site.keywords,
      faviconHref: homeContent.assets.favicon,
      theme: homeContent.theme,
    },
    header: {
      logoHref: homeContent.assets.logo,
      logoAlt: homeContent.site.brandName,
      navItems: homeContent.nav.header.items,
      cta: homeContent.nav.header.cta,
    },
    hero: {
      ...homeContent.sections.hero,
      imageHref: homeContent.assets.heroImage,
    },
    about: homeContent.sections.about,
    services: homeContent.sections.services,
    request: {
      ...homeContent.sections.request,
      imageHref: homeContent.assets.formImage,
    },
    certifications: {
      id: homeContent.sections.certifications.id,
      title: homeContent.sections.certifications.title,
      items: homeContent.assets.certifications.map((certificationItem) => ({
        imageHref: certificationItem.image,
        title: certificationItem.title,
        width: certificationItem.width,
        height: certificationItem.height,
      })),
    },
    contacts: homeContent.sections.contacts,
    footer: {
      navItems: homeContent.nav.header.items,
      links: homeContent.footer.links,
      copyright: homeContent.footer.copyright,
    },
    cookie: homeContent.cookie,
  };
}
