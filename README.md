### Team Treehouse Full Stack JavaScript Techdegree

## Unit 9 Project: REST API

**Summary:** This is a course manager and REST API built on express.  It uses the Sequelize ORM to interact between two associated models, Users and Courses.

There are two layers of validation to ensure that data is correctly formatted.  The first validation occurs before a route is processed and is handled by express-validator.  The second validation occurs when the data is inserted into the database and is handled by Sequelize.

Users are only able to access specific routes if they are authenticated.  Furthermore, appropriate HTTP status codes are returned upon each action/error.  

In summary, this project has helped me improve my expertise in REST APIs, data validation, and user authentication.


**How to use**:

1. Download the project files and extract the folder to your computer.
2. Open the terminal/command prompt and change directories to the project directory.
3. Run the command `npm install` to install the project's dependencies.
4. Run the command `npm run seed` to create the initial database.
5. Run the command `npm start` to start the app.    
6. Add the `RESTAPI.postman_collection.json` collection file to [Postman](https://www.postman.com/) and test each route.


**Extra Credit**

1. JS: Added custom email validation to ensure that duplicate emails are not allowed.
2. JS: Added authentication security so that users can only update/delete their own courses.
3. JS: Hid unnecessary info from GET routes such as password, createdAt,updatedAt
