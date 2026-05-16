import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { DEFAULT_DESCRIPTION } from "@/constants";

export async function GET(context: { site: URL }) {
  const posts = (await getCollection("blog"))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  return rss({
    title: "Nikola V. Maruszewski — Blog",
    description: DEFAULT_DESCRIPTION,
    site: context.site,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: `/blog/${p.id}/`,
    })),
  });
}
