Node.js Mongoose Card Server
This is my final project for the backend portion of a full stack web development course. The project adheres to the course instructions and serves as the backend for business cards front end project.

IMPORTANT: 
- Please add the .env file in the attached zip to the main directory.
- Type 'nodemon app' in the command line to run locally and 'npm start' to run in Atlas (Atlas connection string can be found in the .env file).

Features

🔹 User Authentication & Authorization
Supports user registration, login, and authentication via JWT.
Implements role-based access control (e.g., admin vs. regular users).

🔹 Card Management
Users can create, edit, delete, and retrieve business cards.
Each card contains relevant business information and is stored in MongoDB.

🔹 MongoDB Database Integration
Uses Mongoose for schema-based object modeling.
Stores user data and business card details efficiently.

🔹 API Routes
User Routes: Handle user registration, login, and profile updates.
Card Routes: Manage CRUD operations for business cards.
Admin Routes: Allow admin users to manage system-wide data.

🔹 Input Validation
Utilizes Joi validation to ensure data integrity before inserting into the database.

🔹 Security Measures
Password hashing with bcrypt to secure user credentials.
JWT authentication for protected routes.
Error handling middleware to manage API response consistency.

🔹 Technologies Used
Node.js - Backend runtime
Express.js - API framework
MongoDB & Mongoose - Database & ORM
JWT & bcrypt - Authentication & security
Joi - Data validation