// MIDDLEWARE FUNCTION TO LOG THE REQUEST METHOD AND URL

// EXPORT THE MIDDLEWARE FUNCTION
const logger = (req, res, next) => {
   const now = new Date().toISOString();
   console.log(`[${now}] ${req.method} ${req.originalUrl}`);
   next(); // call the next middleware function in the chain
};

// EXPORT THE MIDDLEWARE FUNCTION TO BE USED IN THE APP
module.exports = logger;