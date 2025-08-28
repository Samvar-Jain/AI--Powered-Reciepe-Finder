import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(join(__dirname, '../dist')));

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY || API_KEY === 'your_gemini_api_key_here') {
  console.error('Invalid or missing GEMINI_API_KEY in .env file');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(API_KEY);

app.post('/api/recipes', async (req, res) => {
  try {
    const { ingredients } = req.body;
    
    if (!ingredients || ingredients.trim() === '') {
      return res.status(400).json({ error: 'Please provide ingredients' });
    }

    const prompt = `Given these ingredients: ${ingredients}
    Please suggest 6 possible recipes that can be made. 
    For each recipe, provide:
    1. A title
    2. A list of all required ingredients (including the ones provided)
    3. Step-by-step cooking instructions
    
    Format the response as a JSON array of objects, without including any additional formatting or markdown syntax.
    {
      "title": "Recipe Name",
      "ingredients": ["ingredient1", "ingredient2", ...],
      "instructions": ["step1", "step2", ...]
    }`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    try {
      const text = await response.text(); // Ensure async handling
      console.log('Raw Gemini response:', text); // Debugging purpose
      const recipes = JSON.parse(text);

      if (!Array.isArray(recipes)) {
        throw new Error('Parsed result is not an array');
      }

      res.json(recipes);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError.message);
      res.status(500).json({ 
        error: 'Failed to parse recipe data', 
        details: parseError.message,
      });
    }
  } catch (error) {
    console.error('Error during recipe generation:', error.message);
    res.status(500).json({ error: 'Failed to generate recipes', details: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}).on('error', (err) => {
  console.error('Failed to start server:', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});
