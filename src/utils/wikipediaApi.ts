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
      rnlimit: 1,
      origin: "*",
      gcmtitle: `Categorie:${category}`,
    };

    const randomResponse = await axios.get(API_URL, { params: randomPageParams });
    const pageTitle = randomResponse.data.query.random[0].title;
    console.log("Found page:", pageTitle);

    // Then get content
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
    let text = tempDiv.textContent || "";
    text = text.replace(/\s+/g, " ").trim();

    // Truncate to approximately 400 words
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