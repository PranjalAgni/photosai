# PhotosAI - Face Recognition Login

This is a web application that demonstrates a unique login experience using face detection. Instead of a traditional username and password, it uses the user's camera to detect a face before allowing them to proceed.

## How it Works

The application accesses the user's webcam and streams the video feed to a canvas element. It uses `face-api.js` to perform real-time face detection on the video stream.

1.  **Initialization**: When the login page loads, it requests camera access and loads the necessary face detection models.
2.  **Face Detection**: The application continuously scans the video feed for a face.
3.  **Login Activation**: Once a face is clearly detected in the frame, the "Login" button becomes enabled.
4.  **Image Capture**: When the user clicks the "Login" button, the current frame from the video feed is captured from the canvas.
5.  We match the face vector with the embeddings stored in server and send back matching photos

This project serves as a foundation for building more complex face recognition and authentication systems.

## Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **UI Library**: [React](https://reactjs.org/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Face Detection**: [face-api.js](https://github.com/justadudewhohacks/face-api.js)

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js (v18.x or later)
*   npm

### Installation

1.  **Clone the repository:**
    ```sh
    git clone <repository-url>
    cd photosai
    ```

2.  **Install NPM packages:**
    ```sh
    npm install
    ```

3.  **Download Face-API Models:**

    The face detection functionality relies on pre-trained models from `face-api.js`. You need to download them and place them in the `public/models` directory.

    *   Download the model files from the [`weights` folder of the `face-api.js` repository](https://github.com/justadudewhohacks/face-api.js/tree/master/weights).
    *   Create a `models` directory inside the `public` folder of this project.
    *   Copy the downloaded model files into `public/models`.

### Running the Application

Once the setup is complete, you can run the development server:

```sh
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
.
├── app/
│   └── login/
│       └── page.tsx      # The main component for the face login page.
├── public/
│   └── models/           # Directory for face-api.js models.
├── package.json
└── README.md
``` 
