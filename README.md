# REST API - Setup Guide

## 1. Install Dependencies

⚠️ **Note:** To install the necessary dependencies for the REST API server, open a terminal and run:

```sh
cd RestAPI
npm install
```

## 2. Environment Variables Configuration

⚠️ **Note:** To run this server, create a `.env` file in the root directory and configure the following environment variables:

### Required Variables:

-   **JWT_SECRET**: A strong, random secret key for signing JSON Web Tokens (JWT).  
    _Example:_ `your_super_secret_key`

-   **CLOUD_DB_URL**: The connection string for a cloud database (e.g., MongoDB Atlas).  
    _Example:_ `mongodb+srv://username:password@cluster0.mongodb.net/dbname`

### Optional Variables:

-   **AWS_ACCESS_KEY** & **AWS_SECRET_ACCESS_KEY**: Required only if using AWS for file storage. Obtain these credentials from your AWS account.

### Steps to Set Up `.env`:

1. Create a file named `.env` in the root directory.
2. Add the required environment variables in the following format:

    ```sh
    JWT_SECRET=<your-jwt-secret>
    CLOUD_DB_URL=<your-cloud-database-url>
    AWS_ACCESS_KEY=<your-aws-access-key>
    AWS_SECRET_ACCESS_KEY=<your-aws-secret-access-key>
    ```

3. Save the file.

## 3. Start the REST API Server

⚠️ **Note:** Run the following command to start the server:

```sh
npm start
```

If everything is set up correctly, you should see output similar to:

```
Server running on http://localhost:3000
Successfully connected to the cloud DB!
```
