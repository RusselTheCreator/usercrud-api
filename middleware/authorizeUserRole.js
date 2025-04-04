const authorizeRole = (role) => {
   return (req, res, next) => {
      // CHECK IF LOGGED IN USER IS AUTHORIZED TO ACCESS THE ROUTER ROUTE/ENDPOINT
      if(!req.user || req.user.role !== role) 
      {
         // IF NOT, RETURN A 403 FORBIDDEN RESPONSE
         return res.status(403).json({ error: 'Access denied. Insufficient privileges.' });
      }
      // IF AUTHORIZED, PASS THE API REQUEST TO THE NEXT MIDDLEWARE OR ROUTE HANDLER
      next();
   };
 };
 
 // EXPORT THE MIDDLEWARE FUNCTION SO IT CAN BE USED IN THE MAIN APPLICATION OR OTHER PARTS OF THE APPLICATION
 module.exports = authorizeRole;
 