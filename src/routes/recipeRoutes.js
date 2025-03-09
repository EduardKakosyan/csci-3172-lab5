import express from 'express';
import RecipeController from '../controllers/recipeController.js';

const router = express.Router();

/**
 * @route   GET /api/recipes/search
 * @desc    Search for recipes based on ingredients and dietary restrictions
 * @access  Public
 */
router.get('/search', RecipeController.searchRecipes);

/**
 * @route   GET /api/recipes/suggestions
 * @desc    Get recipe suggestions based on dietary restrictions
 * @access  Public
 */
router.get('/suggestions', RecipeController.getRecipeSuggestions);

/**
 * @route   GET /api/recipes/:id
 * @desc    Get detailed recipe information by ID
 * @access  Public
 */
router.get('/:id', RecipeController.getRecipeById);

export default router;
