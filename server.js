import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import recipeRoutes from './src/routes/recipeRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/recipes', recipeRoutes);

// Serve the main HTML file for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  // Check if it's an API error with response data
  const errorResponse = err.response && err.response.data 
    ? err.response.data 
    : { message: err.message || 'Unknown error' };
  
  // Send appropriate status code and error details
  const statusCode = err.response ? err.response.status : 500;
  
  res.status(statusCode).json({
    success: false,
    message: 'An error occurred while processing your request',
    error: process.env.NODE_ENV === 'development' ? errorResponse : undefined
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

export default app;
