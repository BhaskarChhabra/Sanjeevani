import axios from "axios";

// ==================== APOLLO PHARMACY CONFIG ====================
const APOLLO_API_URL = "https://search.apollo247.com/v3/fullSearch";
const APOLLO_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Content-Type": "application/json",
  "Authorization": "Oeu324WMvfKOj5KMJh2Lkf00eW1", // may expire
};

// ==================== PHARMEASY CONFIG ====================
const PHARMEASY_API_URL = "https://pharmeasy.in/api/search/search/";

// ==================== 1MG CONFIG ====================
const ONE_MG_API_URL = "https://www.1mg.com/pharmacy_api_webservices/search-all";

// ===================================================================
// 🏥 Scraper for Apollo Pharmacy
// ===================================================================
export const scrapeApollo = async (medicineName) => {
  console.log(`Fetching Apollo API for: ${medicineName}`);

  const payload = {
    query: medicineName,
    page: 1,
    productsPerPage: 10,
    selSortBy: "relevance",
    filters: [],
    pincode: "",
  };

  try {
    const response = await axios.post(APOLLO_API_URL, payload, {
      headers: APOLLO_HEADERS,
    });

    if (!response.data?.data?.products || !Array.isArray(response.data.data.products)) {
      console.error("Invalid Apollo API response structure.");
      return [];
    }

    const products = response.data.data.products.map((product) => ({
      name: product.name || "Unknown Product",
      price: product.specialPrice || product.price || "N/A",
      imageUrl: product.thumbnail || null,
      link: product.productSeoUrl
        ? `https://www.apollopharmacy.in${product.productSeoUrl}`
        : product.slug
        ? `https://www.apollopharmacy.in/otc/${product.slug}`
        : "https://www.apollopharmacy.in/",
      source: "Apollo Pharmacy",
    }));

    return products;
  } catch (error) {
    console.error(
      `Error fetching from Apollo API: ${error.response?.status || ""} ${error.message}`
    );
    return [];
  }
};

// ===================================================================
// 💊 Scraper for Pharmeasy
// ===================================================================
export const scrapePharmeasy = async (medicineName) => {
  console.log(`Fetching Pharmeasy API for: ${medicineName}`);

  try {
    const response = await axios.get(PHARMEASY_API_URL, {
      params: { q: medicineName, page: 1 },
    });

    if (!response.data?.data?.products || !Array.isArray(response.data.data.products)) {
      console.error("Invalid Pharmeasy API response structure.");
      return [];
    }

    const products = response.data.data.products.map((product) => ({
      name: product.name || "Unknown Product",
      price: product.salePriceDecimal || "N/A",
      imageUrl: product.image || null,
      link: `https://pharmeasy.in/online-medicine-order/${product.slug}`,
      source: "Pharmeasy",
    }));

    return products;
  } catch (error) {
    console.error(
      `Error fetching from Pharmeasy API: ${error.response?.status || ""} ${error.message}`
    );
    return [];
  }
};

// ===================================================================
// 🧪 Scraper for 1mg
// ===================================================================
export const scrape1mg = async (medicineName) => {
  console.log(`Fetching 1mg API for: ${medicineName}`);

  try {
    const response = await axios.get(ONE_MG_API_URL, {
      params: {
        city: "Delhi",
        name: medicineName,
        pageSize: 20,
        page_number: 1,
        types: "sku",
        filter: true,
      },
    });

    if (!response.data?.results || !Array.isArray(response.data.results)) {
      console.error("Invalid 1mg API response structure.");
      return [];
    }

    const DEFAULT_IMAGE = "https://via.placeholder.com/160x160.png?text=Medicine";

    const products = [];
    response.data.results.forEach((result) => {
      result.value?.data?.forEach((product) => {
        const medName = product.brand_name || product.label || "Unknown Product";
        const medPrice = product.discounted_price || null;
        const medImage = product.cropped_image || DEFAULT_IMAGE;

        // Skip generic N/A medicines
        if (!medPrice || medPrice.toString().toLowerCase().includes("generic")) return;

        products.push({
          name: medName,
          price: medPrice,
          imageUrl: medImage,
          link: product.url ? `https://www.1mg.com${product.url}` : "https://www.1mg.com/",
          source: "1mg",
        });
      });
    });

    return products;
  } catch (error) {
    console.error(
      `Error fetching from 1mg API: ${error.response?.status || ""} ${error.message}`
    );
    return [];
  }
};

// ===================================================================
// 🔁 Combine All Sources
// ===================================================================
export const scrapeAllSources = async (medicineName) => {
  const [apollo, pharmeasy, oneMg] = await Promise.all([
    scrapeApollo(medicineName),
    scrapePharmeasy(medicineName),
    scrape1mg(medicineName),
  ]);

  const allResults = [...apollo, ...pharmeasy, ...oneMg];

  // Sort by numeric price
  const sorted = allResults.sort((a, b) => {
    const priceA = parseFloat(a.price) || Infinity;
    const priceB = parseFloat(b.price) || Infinity;
    return priceA - priceB;
  });

  return sorted;
};

// ===================================================================
// ✅ Example usage
// ===================================================================
(async () => {
  const results = await scrapeAllSources("crocin");
  console.log("\n✅ Combined Medicine Results (Apollo + Pharmeasy + 1mg):\n", results);
})();
