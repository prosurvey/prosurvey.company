import { loadHomeContent } from "./loaders/home";
import { mapHomeContentToPageModel } from "./mappers/home-page";

export { loadHomeContent, mapHomeContentToPageModel };
export type { HomeContent } from "./schemas/home";
export type { HomePageModel } from "./mappers/home-page";

export async function loadHomePageModel() {
  const homeContent = await loadHomeContent();
  return mapHomeContentToPageModel(homeContent);
}
