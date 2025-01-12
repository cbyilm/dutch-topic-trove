import axios from "axios";

const API_URL = "https://nl.wikipedia.org/w/api.php";

export const fetchDutchReferenceText = async (category: string): Promise<string> => {
  console.log("Fetching Dutch reference text for category:", category);
  
  try {
    // First get random page from category
    const randomPageParams = {
      action: "query",
      format: "json",
      list: "random",
      rnnamespace: 0,
      rnlimit: 5, // Increased to get more potential pages
      origin: "*",
      gcmtitle: `Categorie:${category}`,
    };

    const randomResponse = await axios.get(API_URL, { params: randomPageParams });
    let selectedPage = null;
    let text = "";

    // Try each random page until we find one with sufficient content
    for (const page of randomResponse.data.query.random) {
      const pageTitle = page.title;
      console.log("Trying page:", pageTitle);

      // Get content for this page
      const contentParams = {
        action: "parse",
        format: "json",
        page: pageTitle,
        prop: "text",
        section: 0,
        origin: "*",
      };

      const contentResponse = await axios.get(API_URL, { params: contentParams });
      const htmlContent = contentResponse.data.parse.text["*"];

      // Clean up HTML content
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = htmlContent;
      const tempText = tempDiv.textContent || "";
      const cleanText = tempText.replace(/\s+/g, " ").trim();

      // Check if the text is long enough (at least 300 words)
      const wordCount = cleanText.split(" ").length;
      if (wordCount >= 300) {
        selectedPage = pageTitle;
        text = cleanText;
        console.log(`Found suitable page: ${pageTitle} with ${wordCount} words`);
        break;
      }
    }

    if (!selectedPage) {
      throw new Error("Could not find a page with sufficient content length");
    }

    // Truncate to approximately 400 words if longer
    const words = text.split(" ");
    if (words.length > 400) {
      text = words.slice(0, 400).join(" ") + "...";
    }

    console.log("Successfully processed text");
    return text;
  } catch (error) {
    console.error("Error fetching Dutch reference text:", error);
    throw new Error("Failed to fetch reference text");
  }
};