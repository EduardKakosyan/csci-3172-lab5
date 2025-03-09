import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import dotenv from 'dotenv';
import recipeRoutes from '../../src/routes/recipeRoutes.js';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/recipes', recipeRoutes);

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

// Export the serverless function
export const handler = serverless(app); 