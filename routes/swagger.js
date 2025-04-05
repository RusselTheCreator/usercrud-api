const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'User CRUD API Documentation',
      version: '1.0.0',
      description: 'API documentation for User CRUD operations',
    },
    servers: [
      {
        url: 'http://localhost:' + process.env.PORT,
        description: 'Development server',
      },
      {
        url: 'https://usercrud-api-ef8r.onrender.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [{
      bearerAuth: [],
    }],
  },
  apis: ['./routes/*.js', './middleware/*.js'], // Include both routes and middleware
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
}; 