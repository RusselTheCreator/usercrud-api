// IMPORT LIBRARIES/DEPENDENCIES
const express = require('express'); // IMPORT THE EXPRESS FRAMEWORK
const router = express.Router(); // CREATE A ROUTER INSTANCE // ALLOWS US TO DEFINE ROUTES FOR THE USERS RESOURCE
const db = require('../database/db'); // IMPORT THE DATABASE CONNECTION POOL SO IT CAN BE USED IN THIS FILE
const bcryptjs = require('bcryptjs'); // IMPORT THE BCRYPTJS LIBRARY TO HASH AND SALT THE PASSWORD
const authorizeRole = require('../middleware/authorizeUserRole'); // IMPORT THE AUTHORIZE USER ROLE MIDDLEWARE

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         name:
 *           type: string
 *           description: The name of the user
 *         email:
 *           type: string
 *           description: The email of the user
 *         role:
 *           type: string
 *           enum: [Admin, User]
 *           description: The role of the user
 *       example:
 *         name: John Doe
 *         email: john@example.com
 *         password: password123
 *         role: User
 */

// DEFINE ROUTES/API ENDPOINTS

// CREATE A NEW USER
// ONLY ADMIN CAN CREATE A NEW USER
// POST REQUEST: HTTP://URL/API/USERS
/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User created successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post('/', authorizeRole('Admin'), async (req, res) => {
   try 
   {
      const { name, email, password, role } = req.body; // GET THE NAME AND EMAIL FROM THE BODY OF THE REQUEST
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      // VALIDATION CHECKS
      if(!name || typeof name !== 'string' || name.length < 2)
      {
         return res.status(400).json({ error: 'Name must be atleast 2 characters' });
      }
      if(!email || typeof email !== 'string' || !email.match(emailRegex))
      {
         return res.status(400).json({ error: 'Invalid email address' });
      }
      else
      {
         // CHECK IF EMAIL ALREADY EXISTS
         const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
         
         if(existingUser.rows.length > 0)
         {
            return res.status(400).json({ error: 'Email already exists' });
         }
      }
      if(!password || typeof password !== 'string' || password.length < 8)
      {
         return res.status(400).json({ error: 'Password must be atleast 8 characters' });
      }
      
      // HASH AND SALT THE PASSWORD
      const hashedPassword = await bcryptjs.hash(password, 10);
      
      // QUERY THE DATABASE TO CREATE A NEW USER   
      // THE $1, $2, $3 ARE PLACEHOLDERS FOR THE NAME, EMAIL, AND PASSWORD PARAMETERS, WHICH HELPS PREVENT SQL INJECTION ATTACKS
      // The RETURNING * clause is used to return the newly created user
      const result = await db.query('INSERT INTO users (name, email) VALUES ($1, $2, $3) RETURNING name, email, role', [name, email, hashedPassword, role]);

      // CHECK IF THE USER WAS CREATED SUCCESSFULLY
      if(result.rows.length === 0)
      {
         // SEND A 400 BAD REQUEST RESPONSE TO THE CLIENT AS A JSON RESPONSE
         return res.status(400).json({ error: 'Failed to create user' });
      }
      else  
      {
         // SEND THE RESULT BACK TO THE CLIENT AS A JSON RESPONSE
         res.status(200).json({ message: "User created successfully", user: result.rows[0]});
      }
   }
   catch (error)
   {
      // IF AN ERROR OCCURS, LOG THE ERROR AND SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT
      console.error('Error creating user:', error);

      // SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT AS A JSON RESPONSE
      res.status(500).json({ error: 'Internal server error' });
   }
});

// GET ALL USERS
// ONLY ADMIN CAN GET ALL USERS
// GET REQUEST: HTTP://URL/API/USERS
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/', authorizeRole('Admin'), async (req, res) => {
    try 
    {
      // QUERY THE DATABASE TO GET ALL USERS
      const result = await db.query('SELECT id,name, email, role, created_at FROM users');

      // SEND THE RESULT BACK TO THE CLIENT AS A JSON RESPONSE
      res.status(200).json({ message: "Users fetched successfully", users: result.rows});
    } 
    catch (error) 
    {
      // IF AN ERROR OCCURS, LOG THE ERROR AND SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT
      console.error('Error fetching users:', error);

      // SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT AS A JSON RESPONSE
      res.status(500).json({ error: 'Internal server error' });
    }
});

// GET USER METRICS
// ONLY ADMIN CAN GET USER METRICS
// GET REQUEST: HTTP://URL/API/USERS/METRICS
/**
 * @swagger
 * /api/users/metrics:
 *   get:
 *     summary: Get user metrics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User metrics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalUsersCount:
 *                   type: integer
 *                 adminsCount:
 *                   type: integer
 *                 normalUsersCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get('/metrics', authorizeRole('Admin'), async (req, res) => {
   try
   {
      // QUERY THE DATABASE TO GET THE NUMBER OF USERS, ADMINS, AND TOTAL USERS
      const resultUsersCount = await db.query('SELECT COUNT(*) FROM users');

      if(resultUsersCount.rows.length === 0)
      {
         // SEND A 404 NOT FOUND RESPONSE TO THE CLIENT AS A JSON RESPONSE
         return res.status(404).json({ error: 'No users found' });
      }
      
      // GET THE NUMBER OF USERS, ADMINS, AND TOTAL USERS
      const resultTotalUsersCount = resultUsersCount.rows[0].count;
      const resultAdminsCount = await db.query('SELECT COUNT(*) FROM users WHERE role = $1', ["Admin"]);
      const resultNormalUsersCount = await db.query('SELECT COUNT(*) FROM users WHERE role = $1', ["User"]);

      // SEND THE RESULT BACK TO THE CLIENT AS A JSON RESPONSE
      res.status(200).json({ 
         message: "User metrics fetched successfully", 
         metrics: { 
            totalUsersCount: parseInt(resultTotalUsersCount), 
            adminsCount: parseInt(resultAdminsCount.rows[0].count), 
            normalUsersCount: parseInt(resultNormalUsersCount.rows[0].count)
         }
      });
   }
   catch(err)
   {
      // IF AN ERROR OCCURS, LOG THE ERROR AND SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT
      console.error('Error fetching metrics:', err);

      // SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT AS A JSON RESPONSE
      res.status(500).json({ error: 'Internal server error' });
   }
});

// GET A SINGLE USER BY ID
// ADMIN CAN GET A SINGLE USER BY ID
// USER CAN GET THEIR OWN USER INFORMATION
// GET REQUEST: HTTP://URL/API/USERS/:ID
/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get('/:id', authorizeRole('Admin'),async (req, res) => {
    try 
    {
      const { id } = req.params; // GET THE ID FROM THE URL PARAMETERS

      // CHECK IF ID WAS PROVIDED
      if(!id)
      {
         // SEND A 400 BAD REQUEST RESPONSE TO THE CLIENT AS A JSON RESPONSE
        return res.status(400).json({ error: 'User ID is required' });
      }
      else
      {
         // QUERY THE DATABASE TO GET THE USER WITH THE SPECIFIED ID
         // THE $1 IS A PLACEHOLDER FOR THE ID PARAMETER, WHICH HELPS PREVENT SQL INJECTION ATTACKS
         const result = await db.query('SELECT id,name, email, role, created_at FROM users WHERE id = $1', [id]);

         // CHECK IF THE USER EXISTS
         if(result.rows.length === 0)
         {
            // SEND A 404 NOT FOUND RESPONSE TO THE CLIENT AS A JSON RESPONSE
            return res.status(404).json({ error: 'User not found' });
         }
         else
         {
            // SEND THE RESULT BACK TO THE CLIENT AS A JSON RESPONSE
            res.status(200).json({ message: "User fetched successfully", user: result.rows[0]});
         }
      }
    }
    catch (error)
    {
      // IF AN ERROR OCCURS, LOG THE ERROR AND SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT
      console.error('Error fetching user:', error);

      // SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT AS A JSON RESPONSE
      res.status(500).json({ error: 'Internal server error' });
    }
});   

// UPDATE A USER
// ADMIN CAN UPDATE A USER
// USER CAN UPDATE THEIR OWN USER INFORMATION
// PUT REQUEST: HTTP://URL/API/USERS/:ID
/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update a user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.put('/:id', async (req, res) => {
   try
   {
      const { id } = req.params; // GET THE ID FROM THE URL PARAMETERS
      
      if(!id)
      {
         // SEND A 400 BAD REQUEST RESPONSE TO THE CLIENT AS A JSON RESPONSE
         res.status(400).json({ error: 'User ID is required' });
      }
      else
      {
         const { name, email, password, role } = req.body; // GET THE NAME AND EMAIL FROM THE BODY OF THE REQUEST
         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

         // VALIDATION CHECKS
         if(!name || typeof name !== 'string' || name.length < 2)
         {
            return res.status(400).json({ error: 'Name must be atleast 2 characters' });
         }
         if(!email || typeof email !== 'string' || !email.match(emailRegex))
         {
            return res.status(400).json({ error: 'Invalid email address' });
         }
         else
         {
            // CHECK IF EMAIL ALREADY EXISTS
            const existingUser = await db.query('SELECT * FROM users WHERE email = $1 AND id != $2', [email, id]);
            
            if(existingUser.rows.length > 0)
            {
               return res.status(400).json({ error: 'Email already exists' });
            }
         }
         if(!password || typeof password !== 'string' || password.length < 8)
         {
            return res.status(400).json({ error: 'Password must be atleast 8 characters' });
         }

         // HASH AND SALT THE PASSWORD
         const hashedPassword = await bcryptjs.hash(password, 10);

         // QUERY THE DATABASE TO UPDATE THE USER WITH THE SPECIFIED ID
         // The $1, $2, and $3 are placeholders for the name, email, and id parameters, which helps prevent SQL injection attacks
         // The RETURNING * clause is used to return the updated user
         const result = await db.query('UPDATE users SET name = $1, email = $2, password = $3, role = $4 WHERE id = $5 RETURNING *', [name, email, id, role, hashedPassword]);

         if(result.rows.length === 0)
         {
            // SEND A 404 NOT FOUND RESPONSE TO THE CLIENT AS A JSON RESPONSE
            return res.status(404).json({ error: 'User not found' });
         }
         else
         {
            // SEND THE RESULT BACK TO THE CLIENT AS A JSON RESPONSE
            res.status(200).json({ message: "User updated successfully", user: result.rows[0]});
         }
      }
   }
   catch (err)
   {
      // IF AN ERROR OCCURS, LOG THE ERROR AND SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT
      console.error('Error updating user:', err);

      // SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT AS A JSON RESPONSE
      res.status(500).json({ error: 'Internal server error' });
   }
})

// DELETE A USER
// ONLY ADMIN CAN DELETE A USER
// DELETE REQUEST: HTTP://URL/API/USERS/:ID
router.delete('/:id', authorizeRole('Admin'), async (req, res) => {
   try
   {
      const { id } = req.params; // GET THE ID FROM THE URL PARAMETERS
      
      if(!id)
      {
         // SEND A 400 BAD REQUEST RESPONSE TO THE CLIENT AS A JSON RESPONSE
         res.status(400).json({ error: 'User ID is required' });
      }
      else
      {
         // QUERY THE DATABASE TO DELETE THE USER WITH THE SPECIFIED ID
         // The $1 is a placeholder for the id parameter, which helps prevent SQL injection attacks
         // The RETURNING * clause is used to return the deleted user
         const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

         if(result.rows.length === 0)
         {
            // SEND A 404 NOT FOUND RESPONSE TO THE CLIENT AS A JSON RESPONSE
            return res.status(404).json({ error: 'User not found' });
         }
         else
         {
            // SEND THE RESULT BACK TO THE CLIENT AS A JSON RESPONSE
            res.status(200).json({ message: "User deleted successfully", user: result.rows[0]});
         }
      }
   }
   catch (err)
   {
      // IF AN ERROR OCCURS, LOG THE ERROR AND SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT
      console.error('Error deleting user:', err);

      // SEND A 500 INTERNAL SERVER ERROR RESPONSE TO THE CLIENT AS A JSON RESPONSE
      res.status(500).json({ error: 'Internal server error' });
   }
})

// EXPORT THE ROUTER SO IT CAN BE USED IN THE MAIN APPLICATION OR OTHER PARTS OF THE APPLICATION
// USER ROUTE WILL HAVE DIFFERENT ENDPOINTS THAT CAN BE USED TO GET, CREATE, UPDATE, AND DELETE USERS
module.exports = router;


