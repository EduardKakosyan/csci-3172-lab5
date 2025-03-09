import ApiHelper from '../utils/apiHelper.js';

/**
 * Controller for recipe-related operations
 */
class RecipeController {
  /**
   * Search for recipes based on ingredients and dietary restrictions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async searchRecipes(req, res, next) {
    try {
      const { ingredients, diets, number } = req.query;
      
      console.log('Search request received with params:', req.query);
      
      if (!ingredients) {
        return res.status(400).json({
          success: false,
          message: 'Ingredients are required for recipe search',
        });
      }
      
      const ingredientsArray = ingredients.split(',').map(item => item.trim());
      const dietsArray = diets ? diets.split(',').map(item => item.trim()) : [];
      
      const parsedNumber = number ? parseInt(number, 10) : 10;
      
      console.log('Parsed parameters:', {
        ingredientsArray,
        dietsArray,
        parsedNumber
      });
      
      const recipes = await ApiHelper.searchRecipesByIngredients(
        ingredientsArray,
        dietsArray,
        parsedNumber
      );
      
      console.log(`Returning ${recipes.results ? recipes.results.length : 0} recipes`);
      
      return res.status(200).json({
        success: true,
        data: recipes,
      });
    } catch (error) {
      console.error('Error in searchRecipes controller:', error);
      next(error);
    }
  }

  /**
   * Get detailed recipe information by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async getRecipeById(req, res, next) {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          message: 'Recipe ID is required',
        });
      }
      
      const recipe = await ApiHelper.getRecipeById(id);
      
      return res.status(200).json({
        success: true,
        data: recipe,
      });
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return res.status(404).json({
          success: false,
          message: 'Recipe not found',
        });
      }
      
      next(error);
    }
  }

  /**
   * Get recipe suggestions based on dietary restrictions
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async getRecipeSuggestions(req, res, next) {
    try {
      const { diets, number } = req.query;
      
      const dietsArray = diets ? diets.split(',').map(item => item.trim()) : [];
      
      const parsedNumber = number ? parseInt(number, 10) : 10;
      
      const suggestions = await ApiHelper.getRecipeSuggestions(
        dietsArray,
        parsedNumber
      );
      
      return res.status(200).json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default RecipeController;
