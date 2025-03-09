import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const SPOONACULAR_API_KEY = process.env.SPOONACULAR_API_KEY;
const BASE_URL = 'https://api.spoonacular.com';

/**
 * Helper class for interacting with the Spoonacular API
 */
class ApiHelper {
  /**
   * Search for recipes based on ingredients and dietary restrictions
   * @param {Array} ingredients - List of ingredients
   * @param {Array} diets - List of dietary restrictions
   * @param {Number} number - Number of results to return (default: 10)
   * @returns {Promise} - Promise with recipe search results
   */
  static async searchRecipesByIngredients(ingredients, diets = [], number = 10) {
    try {
      // Format ingredients as comma-separated string
      const ingredientsStr = ingredients.join(',');
      
      // Format diets as comma-separated string
      const dietsStr = diets.join(',');
      
      console.log('Searching recipes with params:', {
        ingredients: ingredientsStr,
        diets: dietsStr,
        number
      });
      
      const params = {
        apiKey: SPOONACULAR_API_KEY,
        number,
        addRecipeInformation: true,
        fillIngredients: true,
        instructionsRequired: true
      };
      
      // Only add ingredients if they exist
      if (ingredientsStr) {
        params.includeIngredients = ingredientsStr;
      }
      
      // Only add diet if it exists
      if (dietsStr) {
        params.diet = dietsStr;
      }
      
      const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, { params });
      
      console.log(`Found ${response.data.results ? response.data.results.length : 0} recipes`);
      
      return response.data;
    } catch (error) {
      console.error('Error searching recipes:', error.response ? error.response.data : error.message);
      throw error;
    }
  }

  /**
   * Get detailed recipe information by ID
   * @param {Number} recipeId - Recipe ID
   * @returns {Promise} - Promise with recipe details
   */
  static async getRecipeById(recipeId) {
    try {
      const response = await axios.get(`${BASE_URL}/recipes/${recipeId}/information`, {
        params: {
          apiKey: SPOONACULAR_API_KEY,
          includeNutrition: true,
        },
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error getting recipe ${recipeId}:`, error.message);
      throw error;
    }
  }

  /**
   * Get recipe suggestions based on dietary restrictions
   * @param {Array} diets - List of dietary restrictions
   * @param {Number} number - Number of results to return (default: 10)
   * @returns {Promise} - Promise with recipe suggestions
   */
  static async getRecipeSuggestions(diets = [], number = 10) {
    try {
      // Format diets as comma-separated string
      const dietsStr = diets.join(',');
      
      const params = {
        apiKey: SPOONACULAR_API_KEY,
        number,
        addRecipeInformation: true,
        sort: 'popularity',
        sortDirection: 'desc'
      };
      
      // Only add diet if it exists
      if (dietsStr) {
        params.diet = dietsStr;
      }
      
      const response = await axios.get(`${BASE_URL}/recipes/complexSearch`, { params });
      
      return response.data;
    } catch (error) {
      console.error('Error getting recipe suggestions:', error.message);
      throw error;
    }
  }
}

export default ApiHelper;
