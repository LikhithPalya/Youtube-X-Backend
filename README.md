# Youtube-X-Backend 

***Have you ever thought of Youtube x X(twitter) models with an advance backend integration with professional models and MongoDB Aggregation pipelines? Welcome to YoutubeX!***

## Project Overview

Youtube-X-Backend is a robust and scalable backend application designed to power a YouTube-like video sharing platform. It provides core functionalities for video uploading, processing, storage, and retrieval, as well as user management and social media features like X (twitter) for users to share their opinions or discuss about thier topics of interest in a twitter like environment.

## Features

- **Video Uploading:** Users can upload videos in various formats and resolutions.
- **Video Processing:** The backend automatically processes uploaded videos for storage and streaming, including transcoding to different formats and resolutions.
- **Video Storage:** Videos are stored securely and efficiently in cloudinary, optimized for streaming and retrieval.
- **User Management:** Users can create accounts, manage their profiles, and upload/view videos.
- **Social Features:** Users can like, comment, and subscribe to other users and videos.
- **Analytics:** The backend provides analytics on video views, likes, comments, and other metrics.

## Installation

To install and set up Youtube-X-Backend, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/LikhithPalya/Youtube-X-Backend.git

2. **Install dependencies**
    ```bash
    cd Youtube-X-Backend
    npm install

3. **Configure Environment Variables**
   ```bash
    PORT = 8000
    MONGODB_URI = 
    CORS_ORIGIN =   
    ACCESS_TOKEN_SECRET = 
    ACCESS_TOKEN_EXPIRY = 
    REFRESH_TOKEN_SECRET = 
    REFRESH_TOKEN_EXPIRY = 

    CLOUDINARY_CLOUD_NAME = 
    CLOUDINARY_API_KEY = 
    CLOUDINARY_API_SECRET = 

4. ***Add to you package.json file***
     ```bash
     add = "type": "module", 

     "scripts": {
        "dev": "nodemon -r dotenv/config src/index.js"
      },


5. **Start the server:**
    ``` bash
    npm run dev


### Data Modeling for the backend!
![DataModelPlan](https://github.com/user-attachments/assets/e10a871d-a56b-4529-b0f6-c6b502339234)
