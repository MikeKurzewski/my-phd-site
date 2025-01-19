const { getJson } = require("serpapi");

interface Interest {
    title: string;
    link: string;
    serpapi_link: string;
  }
  
  interface Author {
    name: string;
    affiliations: string;
    email: string;
    website: string;
    interests: Interest[];
    thumbnail: string;
  }
  
  interface Article {
    title: string;
    link: string;
    citation_id: string;
    authors: string;
    publication: string;
    year: string;
  }
  
  interface SerpApiResponse {
    author: Author;
    articles: Article[];
  }

const fetchAuthorData = async (authorId: string): Promise<SerpApiResponse> => {
  const apiKey = process.env.SERPAPI_KEY; // Securely fetch API key
  if (!apiKey) {
    throw new Error("API key is not set in the environment variables.");
  }

  return new Promise((resolve, reject) => {
    getJson(
      {
        api_key: apiKey,
        engine: "google_scholar_author",
        hl: "en",
        author_id: authorId,
      },
      (json: SerpApiResponse) => {
        if (json && json.author && json.articles) {
          resolve(json); // Resolve with the complete response
        } else {
          reject(new Error("Failed to fetch author data or articles"));
        }
      }
    );
  });
};

  