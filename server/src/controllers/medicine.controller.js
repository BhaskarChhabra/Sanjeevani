import { scrapePharmeasy, scrape1mg } from '../services/scraperService.js';

export const searchMedicines = async (req, res) => {
  const { medicine } = req.query;

  if (!medicine) {
    return res.status(400).json({ success: false, message: 'Medicine name query parameter is required.' });
  }

  try {
    // Promise.all to run both scrapers in parallel
    const [pharmeasyResults, oneMgResults] = await Promise.all([
      scrapePharmeasy(medicine),
      scrape1mg(medicine)
      // scrapeApollo(medicine), // Apollo is still commented out
    ]);

    // Merge both results into a single array
    const allResults = [...pharmeasyResults, ...oneMgResults];

    if (allResults.length === 0) {
      return res.status(404).json({ success: false, message: `No results found for "${medicine}".` });
    }

    return res.status(200).json({
      success: true,
      data: allResults,
      message: "Successfully fetched medicine prices."
    });

  } catch (error) {
    console.error('Controller Error in searchMedicines:', error);
    return res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};
