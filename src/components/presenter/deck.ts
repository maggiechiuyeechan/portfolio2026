import { slides } from "../anthropicxmaggie/slides";

export default {
  deckId: "notionxmaggie",
  title: "Notion × Maggie",
  slides: slides.map((slide, index) => ({
    id: String(slide.number),
    title: slide.name,
    preview: `/anthropicxmaggie/previews/slide-${String(index + 1).padStart(2, "0")}.png`,
  })),
};
