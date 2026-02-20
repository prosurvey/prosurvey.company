import fs from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";
import type { HomeContent } from "../schemas/home";
import { homeContentSchema } from "../schemas/home";

let cachedContent: HomeContent | null = null;

function normalizeBasePath(baseUrl: string): string {
  const trimmedBaseUrl = baseUrl.trim();
  if (!trimmedBaseUrl || trimmedBaseUrl === "/") return "";

  const prefixedBaseUrl = trimmedBaseUrl.startsWith("/")
    ? trimmedBaseUrl
    : `/${trimmedBaseUrl}`;
  return prefixedBaseUrl.endsWith("/")
    ? prefixedBaseUrl.slice(0, -1)
    : prefixedBaseUrl;
}

function withBasePath(pathValue: string): string {
  if (!pathValue.startsWith("/") || pathValue.startsWith("//"))
    return pathValue;

  const normalizedBasePath = normalizeBasePath(import.meta.env.BASE_URL ?? "/");
  if (!normalizedBasePath) return pathValue;
  if (pathValue === "/") return `${normalizedBasePath}/`;

  return `${normalizedBasePath}${pathValue}`;
}

function applyBasePathRecursively<T>(value: T): T {
  if (typeof value === "string") return withBasePath(value) as T;

  if (Array.isArray(value)) {
    return value.map((entry) => applyBasePathRecursively(entry)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        applyBasePathRecursively(entry),
      ]),
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
  const isDevelopment = import.meta.env.DEV;
  if (!isDevelopment && cachedContent) return cachedContent;

  const homeContentFilePath = path.join(
    process.cwd(),
    "src",
    "content",
    "home.yml",
  );
  const homeContentRaw = await fs.readFile(homeContentFilePath, "utf-8");
  const parsedYaml = YAML.parse(homeContentRaw);
  const validatedContent = homeContentSchema.safeParse(parsedYaml);

  if (!validatedContent.success) {
    const issueDetails = validatedContent.error.issues
      .map((issue) => `${formatIssuePath(issue.path)}: ${issue.message}`)
      .join("\n");
    throw new Error(
      `Invalid content file src/content/home.yml:\n${issueDetails}`,
    );
  }

  const homeContent = applyBasePathRecursively(validatedContent.data);
  if (!isDevelopment) cachedContent = homeContent;

  return homeContent;
}
