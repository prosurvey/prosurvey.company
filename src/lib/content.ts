import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import { z } from "zod";

const nonEmptyString = z.string().trim().min(1);
const hexColorString = z.string().regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);

const linkSchema = z
  .object({
    text: nonEmptyString,
    href: nonEmptyString,
  })
  .strict();

const homeContentSchema = z
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
        contactsImage: nonEmptyString,
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
                name: z.object({ label: nonEmptyString, required: z.boolean() }).strict(),
                phone: z.object({ label: nonEmptyString, required: z.boolean() }).strict(),
                email: z.object({ label: nonEmptyString, required: z.boolean() }).strict(),
                message: z.object({ label: nonEmptyString, required: z.boolean() }).strict(),
                consent: z.object({ label: nonEmptyString, required: z.boolean() }).strict(),
              })
              .strict(),
            messages: z
              .object({
                invalidForm: nonEmptyString,
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

let cached: HomeContent | null = null;

function normalizeBasePath(baseUrl: string): string {
  const trimmed = baseUrl.trim();
  if (!trimmed || trimmed === "/") return "";
  const withLeadingSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLeadingSlash.endsWith("/") ? withLeadingSlash.slice(0, -1) : withLeadingSlash;
}

function withBasePath(pathValue: string): string {
  if (!pathValue.startsWith("/") || pathValue.startsWith("//")) return pathValue;
  const basePath = normalizeBasePath(import.meta.env.BASE_URL ?? "/");
  if (!basePath) return pathValue;
  if (pathValue === "/") return `${basePath}/`;
  return `${basePath}${pathValue}`;
}

function applyBasePathRecursively<T>(value: T): T {
  if (typeof value === "string") {
    return withBasePath(value) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item) => applyBasePathRecursively(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [key, applyBasePathRecursively(nestedValue)]),
    ) as T;
  }

  return value;
}

function formatIssuePath(pathItems: Array<string | number>): string {
  if (pathItems.length === 0) return "(root)";

  return pathItems
    .map((item, index) => {
      if (typeof item === "number") return `[${item}]`;
      return index === 0 ? item : `.${item}`;
    })
    .join("");
}

export async function loadHomeContent(): Promise<HomeContent> {
  if (cached) return cached;

  // NOTE: During `astro build`, this module is executed from the emitted `dist/` bundle,
  // so `import.meta.url` would point at `dist/...` and break relative file resolution.
  // Using `process.cwd()` keeps the content path stable for both dev and build.
  const filePath = path.join(process.cwd(), "src", "content", "home.yml");
  const raw = await fs.readFile(filePath, "utf-8");

  const parsedYaml = YAML.parse(raw);
  const validated = homeContentSchema.safeParse(parsedYaml);

  if (!validated.success) {
    const details = validated.error.issues
      .map((issue) => `${formatIssuePath(issue.path)}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid content file src/content/home.yml:\n${details}`);
  }

  cached = applyBasePathRecursively(validated.data);
  return cached;
}
