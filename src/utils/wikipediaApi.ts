import axios from "axios";

const API_URL = "https://nl.wikipedia.org/w/api.php";

export const fetchDutchReferenceText = async (category: string): Promise<string> => {
  console.log("Fetching Dutch reference text for category:", category);
  
  try {
    // Try different category name formats
    const categoryVariations = [
      `Categorie:${category}`,
      `Categorie:${category.charAt(0).toUpperCase() + category.slice(1)}`,
      `Categorie:Nederlandse_${category}`,
      `Categorie:${category}_in_Nederland`
    ];

    let foundPages = false;
    let categoryResponse;

    // Try each category variation until we find pages
    for (const categoryTitle of categoryVariations) {
      console.log("Trying category:", categoryTitle);
      
      const categoryParams = {
        action: "query",
        format: "json",
        list: "categorymembers",
        cmtitle: categoryTitle,
        cmlimit: 10, // Increased limit to find more potential pages
        cmtype: "page",
        origin: "*",
      };

      categoryResponse = await axios.get(API_URL, { params: categoryParams });
      
      if (categoryResponse.data.query?.categorymembers?.length) {
        console.log(`Found pages in category: ${categoryTitle}`);
        foundPages = true;
        break;
      }
    }

    if (!foundPages || !categoryResponse?.data.query?.categorymembers?.length) {
      console.error("No pages found in any category variation");
      throw new Error("No pages found in this category");
    }

    let selectedPage = null;
    let text = "";

    // Try each page until we find one with sufficient content
    for (const page of categoryResponse.data.query.categorymembers) {
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