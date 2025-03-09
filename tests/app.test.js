/**
 * Tests for Recipe Recommender App
 */

import { jest } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

// Mock the API helper to avoid actual API calls during tests
jest.mock('../src/utils/apiHelper.js', () => ({
  __esModule: true,
  default: {
    searchRecipesByIngredients: jest.fn(),
    getRecipeById: jest.fn(),
    getRecipeSuggestions: jest.fn(),
  },
}));

// Import the mocked API helper
import ApiHelper from '../src/utils/apiHelper.js';

describe('Recipe API Routes', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('GET /api/recipes/search', () => {
    it('should return 400 if ingredients are not provided', async () => {
      const response = await request(app).get('/api/recipes/search');
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Ingredients are required');
    });

    it('should return recipes when valid ingredients are provided', async () => {
      // Mock the API response
      const mockRecipes = {
        results: [
          {
            id: 123,
            title: 'Test Recipe',
            image: 'test-image.jpg',
            vegetarian: true,
            vegan: false,
            glutenFree: true,
            dairyFree: false,
            readyInMinutes: 30,
          },
        ],
      };
      
      ApiHelper.searchRecipesByIngredients.mockResolvedValue(mockRecipes);
      
      const response = await request(app)
        .get('/api/recipes/search')
        .query({ ingredients: 'chicken,rice' });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockRecipes);
      expect(ApiHelper.searchRecipesByIngredients).toHaveBeenCalledWith(
        ['chicken', 'rice'],
        [],
        10
      );
    });

    it('should handle dietary restrictions', async () => {
      // Mock the API response
      const mockRecipes = {
        results: [
          {
            id: 456,
            title: 'Vegetarian Recipe',
            image: 'veg-image.jpg',
            vegetarian: true,
            vegan: true,
            glutenFree: true,
            dairyFree: true,
            readyInMinutes: 45,
          },
        ],
      };
      
      ApiHelper.searchRecipesByIngredients.mockResolvedValue(mockRecipes);
      
      const response = await request(app)
        .get('/api/recipes/search')
        .query({ 
          ingredients: 'tofu,rice',
          diets: 'vegetarian,vegan',
          number: '5'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockRecipes);
      expect(ApiHelper.searchRecipesByIngredients).toHaveBeenCalledWith(
        ['tofu', 'rice'],
        ['vegetarian', 'vegan'],
        5
      );
    });

    it('should handle API errors', async () => {
      // Mock an API error
      ApiHelper.searchRecipesByIngredients.mockRejectedValue(new Error('API error'));
      
      const response = await request(app)
        .get('/api/recipes/search')
        .query({ ingredients: 'chicken' });
      
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('An error occurred');
    });
  });

  describe('GET /api/recipes/:id', () => {
    it('should return recipe details for a valid ID', async () => {
      // Mock the API response
      const mockRecipe = {
        id: 789,
        title: 'Detailed Recipe',
        image: 'detailed-image.jpg',
        vegetarian: false,
        vegan: false,
        glutenFree: true,
        dairyFree: false,
        readyInMinutes: 60,
        servings: 4,
        diets: ['gluten free'],
        extendedIngredients: [
          { original: 'Ingredient 1' },
          { original: 'Ingredient 2' },
        ],
        instructions: 'Step 1: Cook. Step 2: Eat.',
        sourceUrl: 'https://example.com/recipe',
      };
      
      ApiHelper.getRecipeById.mockResolvedValue(mockRecipe);
      
      const response = await request(app).get('/api/recipes/789');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockRecipe);
      expect(ApiHelper.getRecipeById).toHaveBeenCalledWith('789');
    });

    it('should handle recipe not found', async () => {
      // Mock a 404 error
      const error = new Error('Recipe not found');
      error.response = { status: 404 };
      ApiHelper.getRecipeById.mockRejectedValue(error);
      
      const response = await request(app).get('/api/recipes/999');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Recipe not found');
    });
  });

  describe('GET /api/recipes/suggestions', () => {
    it('should return recipe suggestions', async () => {
      // Mock the API response
      const mockSuggestions = {
        results: [
          {
            id: 111,
            title: 'Suggested Recipe 1',
            image: 'suggestion1.jpg',
            vegetarian: true,
            vegan: false,
            glutenFree: true,
            dairyFree: false,
            readyInMinutes: 25,
          },
          {
            id: 222,
            title: 'Suggested Recipe 2',
            image: 'suggestion2.jpg',
            vegetarian: false,
            vegan: false,
            glutenFree: false,
            dairyFree: true,
            readyInMinutes: 40,
          },
        ],
      };
      
      ApiHelper.getRecipeSuggestions.mockResolvedValue(mockSuggestions);
      
      const response = await request(app).get('/api/recipes/suggestions');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSuggestions);
      expect(ApiHelper.getRecipeSuggestions).toHaveBeenCalledWith([], 10);
    });

    it('should handle dietary restrictions for suggestions', async () => {
      // Mock the API response
      const mockSuggestions = {
        results: [
          {
            id: 333,
            title: 'Vegetarian Suggestion',
            image: 'veg-suggestion.jpg',
            vegetarian: true,
            vegan: false,
            glutenFree: false,
            dairyFree: false,
            readyInMinutes: 35,
          },
        ],
      };
      
      ApiHelper.getRecipeSuggestions.mockResolvedValue(mockSuggestions);
      
      const response = await request(app)
        .get('/api/recipes/suggestions')
        .query({ 
          diets: 'vegetarian',
          number: '3'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockSuggestions);
      expect(ApiHelper.getRecipeSuggestions).toHaveBeenCalledWith(
        ['vegetarian'],
        3
      );
    });
  });
});
