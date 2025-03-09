/**
 * Recipe Recommender App
 * Client-side JavaScript for handling user interactions and API requests
 */

// DOM Elements
const recipeSearchForm = document.getElementById('recipe-search-form');
const ingredientsInput = document.getElementById('ingredients');
const ingredientsError = document.getElementById('ingredients-error');
const recipeCountSelect = document.getElementById('recipe-count');
const searchButton = document.getElementById('search-button');
const loadingSection = document.getElementById('loading-section');
const errorSection = document.getElementById('error-section');
const errorMessage = document.getElementById('error-message');
const resultsSection = document.getElementById('results-section');
const recipeCountDisplay = document.getElementById('recipe-count-display');
const recipeGrid = document.getElementById('recipe-grid');
const noResultsSection = document.getElementById('no-results-section');
const suggestionsSection = document.getElementById('suggestions-section');
const suggestionsGrid = document.getElementById('suggestions-grid');
const recipeModal = document.getElementById('recipe-modal');
const modalTitle = document.getElementById('modal-title');
const modalContent = document.getElementById('modal-content');
const closeModal = document.getElementById('close-modal');

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Add skip link for keyboard users
  addSkipLink();
  
  // Load initial recipe suggestions
  loadSuggestions();
  
  // Form submission
  recipeSearchForm.addEventListener('submit', handleFormSubmit);
  
  // Modal close button
  closeModal.addEventListener('click', () => {
    hideModal();
  });
  
  // Close modal on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !recipeModal.classList.contains('hidden')) {
      hideModal();
    }
  });
  
  // Close modal when clicking outside
  recipeModal.addEventListener('click', (e) => {
    if (e.target === recipeModal) {
      hideModal();
    }
  });
});

/**
 * Add skip link for keyboard accessibility
 */
function addSkipLink() {
  const skipLink = document.createElement('a');
  skipLink.href = '#main-heading';
  skipLink.className = 'skip-link';
  skipLink.textContent = 'Skip to content';
  document.body.prepend(skipLink);
}

/**
 * Handle form submission
 * @param {Event} e - Form submit event
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  
  // Validate form
  if (!validateForm()) {
    return;
  }
  
  // Get form values
  const ingredients = ingredientsInput.value.trim();
  const dietCheckboxes = document.querySelectorAll('input[name="diet"]:checked');
  const diets = Array.from(dietCheckboxes).map(checkbox => checkbox.value);
  const recipeCount = recipeCountSelect.value;
  
  console.log('Form values:', { ingredients, diets, recipeCount });
  
  // Show loading state
  showLoading();
  
  try {
    // Build query parameters
    const params = new URLSearchParams();
    params.append('ingredients', ingredients);
    if (diets.length > 0) {
      params.append('diets', diets.join(','));
    }
    params.append('number', recipeCount);
    
    const url = `/api/recipes/search?${params.toString()}`;
    console.log('Fetching from URL:', url);
    
    // Fetch recipes from API
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('API response:', data);
    
    // Hide loading state
    hideLoading();
    
    if (!data.success) {
      showError(data.message || 'Failed to fetch recipes');
      return;
    }
    
    // Display results
    displayResults(data.data);
    
  } catch (error) {
    console.error('Error searching recipes:', error);
    hideLoading();
    showError('An error occurred while searching for recipes. Please try again later.');
  }
}

/**
 * Validate the search form
 * @returns {Boolean} - Whether the form is valid
 */
function validateForm() {
  let isValid = true;
  
  // Validate ingredients
  if (!ingredientsInput.value.trim()) {
    ingredientsError.classList.remove('hidden');
    ingredientsInput.setAttribute('aria-invalid', 'true');
    ingredientsInput.focus();
    isValid = false;
  } else {
    ingredientsError.classList.add('hidden');
    ingredientsInput.removeAttribute('aria-invalid');
  }
  
  return isValid;
}

/**
 * Show loading state
 */
function showLoading() {
  // Hide other sections
  resultsSection.classList.add('hidden');
  errorSection.classList.add('hidden');
  noResultsSection.classList.add('hidden');
  
  // Show loading section
  loadingSection.classList.remove('hidden');
  
  // Disable search button
  searchButton.disabled = true;
  searchButton.setAttribute('aria-busy', 'true');
}

/**
 * Hide loading state
 */
function hideLoading() {
  // Hide loading section
  loadingSection.classList.add('hidden');
  
  // Enable search button
  searchButton.disabled = false;
  searchButton.removeAttribute('aria-busy');
}

/**
 * Show error message
 * @param {String} message - Error message to display
 */
function showError(message) {
  // Set error message
  errorMessage.textContent = message;
  
  // Show error section
  errorSection.classList.remove('hidden');
  
  // Hide other sections
  resultsSection.classList.add('hidden');
  noResultsSection.classList.add('hidden');
  
  // Announce error to screen readers
  errorSection.setAttribute('aria-live', 'assertive');
}

/**
 * Display recipe results
 * @param {Object} data - Recipe data from API
 */
function displayResults(data) {
  // Clear previous results
  recipeGrid.innerHTML = '';
  
  console.log('Recipe data received:', data);
  
  // Check if there are results
  if (!data.results || data.results.length === 0) {
    console.log('No recipes found');
    resultsSection.classList.add('hidden');
    noResultsSection.classList.remove('hidden');
    return;
  }
  
  // Update results count
  recipeCountDisplay.textContent = data.results.length;
  
  // Create recipe cards
  data.results.forEach(recipe => {
    const recipeCard = createRecipeCard(recipe);
    recipeGrid.appendChild(recipeCard);
  });
  
  // Show results section
  resultsSection.classList.remove('hidden');
  noResultsSection.classList.add('hidden');
  
  // Scroll to results
  resultsSection.scrollIntoView({ behavior: 'smooth' });
}

/**
 * Create a recipe card element
 * @param {Object} recipe - Recipe data
 * @returns {HTMLElement} - Recipe card element
 */
function createRecipeCard(recipe) {
  const card = document.createElement('div');
  card.className = 'recipe-card bg-white rounded-lg shadow-md overflow-hidden';
  card.setAttribute('tabindex', '0');
  
  // Image with fallback
  const imageUrl = recipe.image || 'https://via.placeholder.com/300x200?text=No+Image+Available';
  
  // Create card content
  card.innerHTML = `
    <div class="relative">
      <img 
        src="${imageUrl}" 
        alt="${recipe.title}" 
        class="w-full h-48 object-cover"
        loading="lazy"
      >
      <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
        <h3 class="recipe-card-title text-white font-bold text-lg">${recipe.title}</h3>
      </div>
    </div>
    <div class="p-4">
      <div class="flex flex-wrap gap-2 mb-3">
        ${recipe.vegetarian ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Vegetarian</span>' : ''}
        ${recipe.vegan ? '<span class="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Vegan</span>' : ''}
        ${recipe.glutenFree ? '<span class="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">Gluten Free</span>' : ''}
        ${recipe.dairyFree ? '<span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Dairy Free</span>' : ''}
      </div>
      <p class="text-sm text-gray-600 mb-3">Ready in ${recipe.readyInMinutes} minutes</p>
      <button 
        class="w-full px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
        aria-label="View details for ${recipe.title}"
        data-recipe-id="${recipe.id}"
      >
        View Recipe
      </button>
    </div>
  `;
  
  // Add event listener to view recipe button
  const viewButton = card.querySelector('button');
  viewButton.addEventListener('click', () => {
    fetchRecipeDetails(recipe.id);
  });
  
  // Add keyboard accessibility
  card.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      fetchRecipeDetails(recipe.id);
    }
  });
  
  return card;
}

/**
 * Fetch detailed recipe information
 * @param {Number} recipeId - Recipe ID
 */
async function fetchRecipeDetails(recipeId) {
  try {
    // Show loading in modal
    showModal();
    modalTitle.textContent = 'Loading...';
    modalContent.innerHTML = '<div class="flex justify-center"><div class="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div></div>';
    
    // Fetch recipe details
    const response = await fetch(`/api/recipes/${recipeId}`);
    const data = await response.json();
    
    if (!data.success) {
      modalContent.innerHTML = `<p class="text-red-500">Error: ${data.message || 'Failed to load recipe details'}</p>`;
      return;
    }
    
    // Display recipe details
    displayRecipeDetails(data.data);
    
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    modalContent.innerHTML = '<p class="text-red-500">An error occurred while loading recipe details. Please try again later.</p>';
  }
}

/**
 * Display recipe details in modal
 * @param {Object} recipe - Recipe details
 */
function displayRecipeDetails(recipe) {
  // Update modal title
  modalTitle.textContent = recipe.title;
  
  // Create content HTML
  let contentHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <img 
          src="${recipe.image}" 
          alt="${recipe.title}" 
          class="w-full rounded-lg shadow-md"
        >
        
        <div class="mt-4 recipe-details-section">
          <h4 class="font-bold text-lg mb-2">Details</h4>
          <ul class="space-y-1">
            <li><span class="font-medium">Ready in:</span> ${recipe.readyInMinutes} minutes</li>
            <li><span class="font-medium">Servings:</span> ${recipe.servings}</li>
            <li>
              <span class="font-medium">Diets:</span> 
              ${recipe.diets.length > 0 ? recipe.diets.join(', ') : 'None specified'}
            </li>
          </ul>
        </div>
        
        <div class="mt-4 recipe-details-section">
          <h4 class="font-bold text-lg mb-2">Health Information</h4>
          <ul class="space-y-1">
            <li>
              <span class="font-medium">Vegetarian:</span> 
              <span class="${recipe.vegetarian ? 'text-green-600' : 'text-red-600'}">
                ${recipe.vegetarian ? 'Yes' : 'No'}
              </span>
            </li>
            <li>
              <span class="font-medium">Vegan:</span> 
              <span class="${recipe.vegan ? 'text-green-600' : 'text-red-600'}">
                ${recipe.vegan ? 'Yes' : 'No'}
              </span>
            </li>
            <li>
              <span class="font-medium">Gluten Free:</span> 
              <span class="${recipe.glutenFree ? 'text-green-600' : 'text-red-600'}">
                ${recipe.glutenFree ? 'Yes' : 'No'}
              </span>
            </li>
            <li>
              <span class="font-medium">Dairy Free:</span> 
              <span class="${recipe.dairyFree ? 'text-green-600' : 'text-red-600'}">
                ${recipe.dairyFree ? 'Yes' : 'No'}
              </span>
            </li>
          </ul>
        </div>
      </div>
      
      <div>
        <div class="recipe-details-section">
          <h4 class="font-bold text-lg mb-2">Ingredients</h4>
          <ul class="list-disc pl-5 space-y-1">
            ${recipe.extendedIngredients.map(ingredient => `
              <li>${ingredient.original}</li>
            `).join('')}
          </ul>
        </div>
        
        <div class="mt-6 recipe-details-section">
          <h4 class="font-bold text-lg mb-2">Instructions</h4>
          ${recipe.instructions ? `
            <div class="prose max-w-none">
              ${recipe.instructions}
            </div>
          ` : `
            <p>No instructions available. You can visit the original recipe for more details.</p>
          `}
        </div>
        
        ${recipe.sourceUrl ? `
          <div class="mt-6">
            <a 
              href="${recipe.sourceUrl}" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
            >
              <i class="fas fa-external-link-alt mr-2" aria-hidden="true"></i>
              View Original Recipe
            </a>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  // Update modal content
  modalContent.innerHTML = contentHTML;
}

/**
 * Show the recipe modal
 */
function showModal() {
  recipeModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  
  // Focus on close button for accessibility
  closeModal.focus();
  
  // Trap focus within modal
  trapFocus(recipeModal);
}

/**
 * Hide the recipe modal
 */
function hideModal() {
  recipeModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

/**
 * Trap focus within an element (for modals)
 * @param {HTMLElement} element - Element to trap focus within
 */
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];
  
  element.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      // Shift + Tab
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      // Tab
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }
  });
}

/**
 * Load initial recipe suggestions
 */
async function loadSuggestions() {
  try {
    // Fetch recipe suggestions
    const response = await fetch('/api/recipes/suggestions');
    const data = await response.json();
    
    if (!data.success || !data.data.results || data.data.results.length === 0) {
      suggestionsSection.classList.add('hidden');
      return;
    }
    
    // Clear previous suggestions
    suggestionsGrid.innerHTML = '';
    
    // Create suggestion cards
    data.data.results.forEach(recipe => {
      const recipeCard = createRecipeCard(recipe);
      suggestionsGrid.appendChild(recipeCard);
    });
    
    // Show suggestions section
    suggestionsSection.classList.remove('hidden');
    
  } catch (error) {
    console.error('Error loading suggestions:', error);
    suggestionsSection.classList.add('hidden');
  }
}
