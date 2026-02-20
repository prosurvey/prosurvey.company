import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const hexColorString = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

const linkSchema = z
  .object({
    text: nonEmptyString,
    href: nonEmptyString,
  })
  .strict();

export const homeContentSchema = z
  .object({
    site: z
      .object({
        lang: nonEmptyString,
        title: nonEmptyString,
        brandName: nonEmptyString,
        description: nonEmptyString,
        keywords: z.string().optional(),
      })
      .strict(),
    assets: z
      .object({
        favicon: nonEmptyString,
        logo: nonEmptyString,
        heroImage: nonEmptyString,
        formImage: nonEmptyString,
        certifications: z
          .array(
            z
              .object({
                image: nonEmptyString,
                title: nonEmptyString,
                width: z.number().positive(),
                height: z.number().positive(),
              })
              .strict(),
          )
          .min(1),
      })
      .strict(),
    theme: z
      .object({
        accent: hexColorString,
        bgDark: hexColorString,
        bgLight: hexColorString,
      })
      .strict(),
    nav: z
      .object({
        header: z
          .object({
            items: z.array(linkSchema).min(1),
            cta: linkSchema,
          })
          .strict(),
      })
      .strict(),
    sections: z
      .object({
        hero: z
          .object({
            title: nonEmptyString,
            text: nonEmptyString,
            buttons: z.array(linkSchema).min(1),
          })
          .strict(),
        about: z
          .object({
            id: nonEmptyString,
            eyebrow: nonEmptyString,
            title: nonEmptyString,
            text: nonEmptyString,
            stats: z
              .array(
                z
                  .object({
                    value: nonEmptyString,
                    label: nonEmptyString,
                  })
                  .strict(),
              )
              .min(1),
            note: nonEmptyString,
          })
          .strict(),
        services: z
          .object({
            id: nonEmptyString,
            title: nonEmptyString,
            subtitle: nonEmptyString,
            main: z.array(nonEmptyString).min(1),
            other: z.array(nonEmptyString).min(1),
          })
          .strict(),
        request: z
          .object({
            id: nonEmptyString,
            title: nonEmptyString,
            description: nonEmptyString,
            submitText: nonEmptyString,
            fields: z
              .object({
                name: z
                  .object({ label: nonEmptyString, required: z.boolean() })
                  .strict(),
                phone: z
                  .object({ label: nonEmptyString, required: z.boolean() })
                  .strict(),
                email: z
                  .object({ label: nonEmptyString, required: z.boolean() })
                  .strict(),
                message: z
                  .object({ label: nonEmptyString, required: z.boolean() })
                  .strict(),
                consent: z
                  .object({ label: nonEmptyString, required: z.boolean() })
                  .strict(),
              })
              .strict(),
            messages: z
              .object({
                success: nonEmptyString,
              })
              .strict(),
            consentLinks: z
              .object({
                privacy: linkSchema,
                terms: z
                  .object({
                    prefix: nonEmptyString,
                    text: nonEmptyString,
                    href: nonEmptyString,
                  })
                  .strict(),
              })
              .strict(),
          })
          .strict(),
        certifications: z
          .object({
            id: nonEmptyString,
            title: nonEmptyString,
          })
          .strict(),
        contacts: z
          .object({
            id: nonEmptyString,
            title: nonEmptyString,
            email: nonEmptyString,
            phoneText: nonEmptyString,
            phoneHref: nonEmptyString,
            hours: nonEmptyString,
            socials: z
              .array(
                z
                  .object({
                    type: nonEmptyString,
                    href: nonEmptyString,
                    label: nonEmptyString,
                  })
                  .strict(),
              )
              .min(1),
          })
          .strict(),
      })
      .strict(),
    footer: z
      .object({
        copyright: nonEmptyString,
        links: z.array(linkSchema).min(1),
      })
      .strict(),
    cookie: z
      .object({
        enabled: z.boolean(),
        acceptText: nonEmptyString,
        text: nonEmptyString,
        link: linkSchema,
      })
      .strict(),
  })
  .strict();

export type HomeContent = z.infer<typeof homeContentSchema>;
