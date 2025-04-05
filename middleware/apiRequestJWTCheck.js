// THIS FILE CONTAINS THE AUTHENTICATION MIDDLEWARE FOR THE API
// IT IS USED TO VERIFY THE JWT TOKEN PROVIDED IN THE API REQUEST HEADER
// IF THE JWT TOKEN IS VALID, THE API REQUEST WILL BE PROCESSED BY THE NEXT MIDDLEWARE OR ROUTE HANDLER
// IF THE JWT TOKEN IS INVALID, THE API REQUEST WILL BE DENIED AND A 403 FORBIDDEN RESPONSE WILL BE SENT

// IMPORT LIBRARIES AND FILES
const jwt = require('jsonwebtoken'); // IMPORT THE JSONWEBTOKEN LIBRARY TO HANDLE JWT TOKENS
const dotenv = require('dotenv'); // IMPORT THE DOTENV LIBRARY TO LOAD ENVIRONMENT VARIABLES FROM THE .ENV FILE
dotenv.config(); // LOAD THE ENVIRONMENT VARIABLES FROM THE .ENV FILE

const JWT_SECRET = process.env.JWT_SECRET; // GET THE JWT SECRET KEY FROM THE ENVIRONMENT VARIABLES

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   responses:
 *     UnauthorizedError:
 *       description: Access denied. No JWT token provided
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: Access denied. No JWT token provided.
 *     ForbiddenError:
 *       description: Invalid or expired JWT token
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: Invalid or expired JWT token.
 */

// DEFINE THE AUTHENTICATE TOKEN MIDDLEWARE FUNCTION
const authenticateToken = (req, res, next) => {

   // GET THE AUTHORIZATION HEADER FROM THE REQUEST
   const authorizationHeader = req.headers.authorization; // e.g of how it looks: "Bearer <token>"

   // EXPECTED FORMAT: "Bearer <token>"
   if(authorizationHeader)
   {
      // EXTRACT THE TOKEN FROM THE AUTHORIZATION HEADER
      const clientJWTToken  = authorizationHeader.split(' ')[1]; 

      if(!clientJWTToken)
      {
         // IF NO JWT TOKEN IS PROVIDED, RETURN A 401 UNAUTHORIZED RESPONSE
         return res.status(401).json({ error: 'Access denied. No JWT token provided.' });
      }
      else
      {
         try 
         {
            const decoded = jwt.verify(clientJWTToken, JWT_SECRET); //COMPARE THE JWT TOKEN FROM THE API REQUEST WITH THE JWT SECRET KEY
            req.user = decoded; // ATTACH THE DECODED PAYLOAD TO THE API REQUEST OBJECT (e.g. userId, email)
            next(); // PASS THE API REQUEST TO THE NEXT MIDDLEWARE OR ROUTE HANDLER
         } 
         catch (err) 
         {
            // IF THE JWT TOKEN IS INVALID OR EXPIRED, RETURN A 403 FORBIDDEN RESPONSE
            return res.status(403).json({ error: 'Invalid or expired JWT token.' });
         }
      }
   }
   else
   {
      // IF NO JWT TOKEN IS PROVIDED, RETURN A 401 UNAUTHORIZED RESPONSE
     return res.status(401).json({ error: 'Access denied. No JWT token provided.' });
   }
};

// EXPORT THE AUTHENTICATE JWT TOKEN MIDDLEWARE FUNCTION TO BE USED IN THE API
module.exports = authenticateToken;
