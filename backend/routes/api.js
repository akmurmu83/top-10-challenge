import express from 'express';
import { generateTop10List } from '../services/openai.js';

const router = express.Router();

// Get top 10 list for single player mode
router.get('/top10', async (req, res) => {
  try {
    const { category } = req.query;
    
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }

    console.log(`🎯 Generating top 10 list for category: ${category}`);
    const items = await generateTop10List(category);
    
    const topItems = items.map((name, index) => ({
      rank: index + 1,
      name,
      isRevealed: false
    }));

    res.json({ 
      success: true, 
      category,
      items: topItems 
    });
  } catch (error) {
    console.error('Error in /api/top10:', error);
    res.status(500).json({ 
      error: 'Failed to generate top 10 list',
      message: error.message 
    });
  }
});

export { router as apiRoutes };