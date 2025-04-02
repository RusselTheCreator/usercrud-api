// IMPORT LIBRARIES/DEPENDENCIES
const express = require('express'); // import the express framework
const router = express.Router(); // create a router instance // allows us to define routes for the users resource
const db = require('../database/db'); // import the database connection pool so it can be used in this file

// DEFINE ROUTES/API ENDPOINTS

// GET ALL USERS
// GET REQUEST: http://url/api/users
router.get('/', async (req, res) => {
    try 
    {
      // QUERY THE DATABASE TO GET ALL USERS
      const result = await db.query('SELECT * FROM users');

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

// GET A SINGLE USER BY ID
// GET REQUEST: http://url/api/users/:id
router.get('/:id', async (req, res) => {
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
         // The $1 is a placeholder for the id parameter, which helps prevent SQL injection attacks
         const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);

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

// CREATE A NEW USER
// POST REQUEST: http://url/api/users
router.post('/', async (req, res) => {
   try 
   {
      const { name, email } = req.body; // GET THE NAME AND EMAIL FROM THE BODY OF THE REQUEST
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

      // QUERY THE DATABASE TO CREATE A NEW USER   
      // The $1 and $2 are placeholders for the name and email parameters, which helps prevent SQL injection attacks
      // The RETURNING * clause is used to return the newly created user
      const result = await db.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);

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

// UPDATE A USER
// PUT REQUEST: http://url/api/users/:id
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
         const { name, email } = req.body; // GET THE NAME AND EMAIL FROM THE BODY OF THE REQUEST
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

         // QUERY THE DATABASE TO UPDATE THE USER WITH THE SPECIFIED ID
         // The $1, $2, and $3 are placeholders for the name, email, and id parameters, which helps prevent SQL injection attacks
         // The RETURNING * clause is used to return the updated user
         const result = await db.query('UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *', [name, email, id]);

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
// DELETE REQUEST: http://url/api/users/:id
router.delete('/:id', async (req, res) => {
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


// EXPORT THIS ROUTER TO BE USED IN THE MAIN APPLICATION OR OTHER PARTS OF THE APPLICATION
// USER ROUTE WILL HAVE DIFFERENT ENDPOINTS THAT CAN BE USED TO GET, CREATE, UPDATE, AND DELETE USERS
module.exports = router;


