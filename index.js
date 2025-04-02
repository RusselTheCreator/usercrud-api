// IMPORT LIBRARIES/DEPENDENCIES
const express = require('express'); // import the express framework
const cors = require('cors'); // import the cors lirary enabling cross-origin resource sharing
const dotenv = require('dotenv'); // import the dotenv library to load environment variables from the .env file

dotenv.config(); // loads the environment variables from the .env file

// IMPORT ROUTES
const users = require('./routes/users'); // import the users router
const logger = require('./middleware/logger'); // import the logger middleware

// create an instance of the express application
// creats a new express app (This application)
const app = express(); 

app.use(cors()); // enable cross-origin resource sharing for this application // so frontend and this API can communicate with each other
app.use(express.json()); // parse incoming requests with JSON payloads // allows the API to read JSON data from the request body

// MIDDLEWARE
app.use(logger); // log the request method and url

// DEFINE ROUTES/ API ENDPOINTS
app.use('/api/users', users); // when a request is made to the /api/users endpoint, the users router will handle it

// START THE SERVER
const PORT = process.env.PORT;

// Allows this API application to listen for incoming API requests on the specified port
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
