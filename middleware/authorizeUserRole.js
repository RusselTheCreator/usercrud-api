/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: string
 *       enum: [Admin, User]
 *   responses:
 *     ForbiddenRoleError:
 *       description: Access denied due to insufficient privileges
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               error:
 *                 type: string
 *                 example: Access denied. Insufficient privileges.
 */

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
 