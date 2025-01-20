export async function fetchAuthorData(authorId: string): Promise<{
  author: {
    name: string;
    affiliations: string;
    interests: { title: string }[];
  };
  articles: {
    title: string;
    link: string;
    citation_id: string;
    authors: string;
    publication: string;
    year: string;
  }[];
}> {
  const proxyEndpoint = 'https://serpapi-proxy.vercel.app/api/index'; // Replace with your proxy server URL
  const url = `${proxyEndpoint}?author_id=${authorId}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch author data: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      author: {
        name: data.author?.name || '',
        affiliations: data.author?.affiliations || '',
        interests: data.author?.interests || [],
      },
      articles: (data.articles || []).map((article: any) => ({
        title: article.title || '',
        link: article.link || '',
        citation_id: article.citation_id || '',
        authors: article.authors || '',
        publication: article.publication || '',
        year: article.year || '',
      })),
    };
  } catch (error) {
    console.error('Error fetching author data:', error);
    throw error;
  }
}
