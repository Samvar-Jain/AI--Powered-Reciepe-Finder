import React, { useState, useEffect } from 'react';
import { Search, ChefHat, Loader2 } from 'lucide-react';

interface Recipe {
  title: string;
  ingredients: string[];
  instructions: string[];
}

function App() {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('R');
  const [darkMode, setDarkMode] = useState(false);
  const fullText = 'RecipeFinder.ai';
    
  useEffect(() => {
    let index = 1;
    let forward = true;
    const interval = setInterval(() => {
      if (forward) {
        setText(fullText.slice(0, index + 1));
        index++;
        if (index === fullText.length) {
          forward = false;
        }
      } else {
        setText(fullText.slice(0, index));
        index--;
        if (index === 1) {
          forward = true;
        }
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);
  
  const copyRecipe = (recipe: Recipe) => {
    const recipeText = `Title: ${recipe.title}\n\nIngredients:\n${recipe.ingredients.join(
      '\n'
    )}\n\nInstructions:\n${recipe.instructions.join('\n')}`;
    navigator.clipboard.writeText(recipeText)
      .then(() => alert('Recipe copied to clipboard!'))
      .catch(() => alert('Failed to copy recipe.'));
  };
  
  const downloadRecipe = (recipe: Recipe) => {
    const recipeText = `Title: ${recipe.title}\n\nIngredients:\n${recipe.ingredients.join(
      '\n'
    )}\n\nInstructions:\n${recipe.instructions.join('\n')}`;
    const blob = new Blob([recipeText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${recipe.title}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  const handleSearch = async () => {
    if (!ingredients.trim()) {
      setError('Please enter some ingredients');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:3000/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipes');
      }
      
      const data = await response.json();
      setRecipes(data);
    } catch (error) {
      console.error('Error fetching recipes:', error);
      setError('Failed to fetch recipes. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen font-serif ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-orange-50 to-orange-100'}`}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center mb-12">
          <ChefHat className={`w-16 h-20 mb-4 ${darkMode ? 'text-orange-300' : 'text-orange-500'}`} />
          <h1 className="text-4xl font-bold mb-2">{text}</h1>
          <p className="text-center">
            Enter ingredients you have, and we'll find recipes for you!
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex gap-4">
            <input
              type="text"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              placeholder="Enter ingredients (e.g., chicken, rice, tomatoes)"
              className={`flex-1 px-4 py-3 rounded-lg border ${darkMode ? 'border-gray-700 bg-gray-800 text-white' : 'border-gray-300'} focus:outline-none focus:ring-2 focus:ring-orange-500`}
            />
            <button
              onClick={handleSearch}
              disabled={loading}
              className={`px-6 py-3 rounded-lg text-white ${darkMode ? 'bg-orange-600 hover:bg-orange-700' : 'bg-orange-500 hover:bg-orange-600'} focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 flex items-center gap-2`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Find Recipes
            </button>
          </div>
          {error && (
            <p className="mt-2 text-red-500">{error}</p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipes?.map((recipe, index) => (
  <div
    key={index}
    className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow ${darkMode ? 'bg-slate-700 text-white' : ''}`}
  >
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-4">
        {recipe.title}
      </h3>
      <div className="mb-4">
        <h4 className="font-medium mb-2">Ingredients:</h4>
        <ul className="list-disc list-inside">
          {recipe.ingredients.map((ingredient, idx) => (
            <li key={idx}>{ingredient}</li>
          ))}
        </ul>
      </div>
      <div>
        <h4 className="font-medium mb-2">Instructions:</h4>
        <ol className="list-decimal list-inside">
          {recipe.instructions.map((step, idx) => (
            <li key={idx}>{step}</li>
          ))}
        </ol>
      </div>
      <div className="flex gap-4 mt-4">
        <button
          onClick={() => copyRecipe(recipe)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Copy Recipe
        </button>
        <button
          onClick={() => downloadRecipe(recipe)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Download Recipe
        </button>
      </div>
    </div>
  </div>
))}

        </div>
        <footer className="mt-12 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} RecipeFinder.ai. All rights reserved.
          </p>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-sm underline mt-2"
          >
            {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          </button>
        </footer>
      </div>
    </div>
  );
}

export default App;