import type { MetadataRoute } from "next";

// Keep design-draft homepages and internal prototypes out of search results.
// The live homepage is `/`; the routes below are alternate visual skins or demo
// prototypes that would otherwise surface as near-duplicate/experimental pages.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/home-editorial",
        "/home-editorial-fanvue",
        "/home-spotlight",
        "/home-onyx",
        "/home-sculpt",
        "/home-creatix",
        "/previews",
        "/agent-demo",
      ],
    },
  };
}
