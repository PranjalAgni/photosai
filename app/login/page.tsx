"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMatchData } from "../../contexts/MatchDataContext";
import * as faceapi from "face-api.js";

export default function Login() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const { setMatchData } = useMatchData();

  const [isFaceDetected, setIsFaceDetected] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = "/models";
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
      ]);
    };

    const startVideo = () => {
      navigator.mediaDevices
        .getUserMedia({ video: {} })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => console.error(err));
    };

    const handleVideoOnPlay = async () => {
      const drawFrame = async () => {
        if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          const context = canvas.getContext("2d");

          if (context) {
            // Draw video to canvas
            const displaySize = { width: canvas.width, height: canvas.height };
            faceapi.matchDimensions(canvas, displaySize);
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Detect face
            const detection = await faceapi.detectSingleFace(
              video,
              new faceapi.TinyFaceDetectorOptions(),
            );

            if (detection) {
              setIsFaceDetected(true);
            } else {
              setIsFaceDetected(false);
            }
          }
        }
        requestAnimationFrame(drawFrame);
      };
      drawFrame();
    };

    loadModels();
    startVideo();

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener("play", handleVideoOnPlay);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener("play", handleVideoOnPlay);
        const stream = videoElement.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }
      }
    };
  }, []);

  const handleLogin = async () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const imageDataURL = canvas.toDataURL("image/jpeg");

      const base64Data = imageDataURL.split(",")[1];

      try {
        const response = await fetch("http://localhost:8000/api/find-matches", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            image: `data:image/jpeg;base64,${base64Data}`,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (
            result.matches &&
            Array.isArray(result.matches) &&
            result.matches.length > 0
          ) {
            setMatchData(result);
            router.push("/gallery");
          } else {
            alert("No matches found!");
          }
        } else {
          console.error("API request failed:", response.statusText);
          alert("Failed to find matches. Please try again.");
        }
      } catch (error) {
        console.error("Error making API request:", error);
      }
    }
  };

  const getStatusMessage = () => {
    if (!isFaceDetected) {
      return "Position your face in the frame";
    }
    return "Face detected! Ready to capture";
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold mb-2">Face Login</h1>
      <p className="text-gray-600 mb-6">
        Show your face to the camera to enable login
      </p>

      <div
        className="relative border-2 border-gray-300 rounded-lg overflow-hidden shadow-lg"
        style={{ width: "320px", height: "240px" }}
      >
        <video
          ref={videoRef}
          width="320"
          height="240"
          autoPlay
          muted
          style={{
            position: "absolute",
            opacity: 0, // Hide video, show canvas instead
          }}
        />
        <canvas
          ref={canvasRef}
          width={320}
          height={240}
          className="absolute top-0 left-0"
        />
      </div>

      <div
        className={`mt-4 text-lg font-semibold ${
          isFaceDetected ? "text-green-500" : "text-red-500"
        }`}
      >
        {getStatusMessage()}
      </div>

      <button
        onClick={handleLogin}
        disabled={!isFaceDetected}
        className={`mt-6 px-8 py-3 text-white rounded-lg font-semibold transition-all ${
          isFaceDetected
            ? "bg-green-500 hover:bg-green-600 transform hover:scale-105"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        {isFaceDetected ? "✓ Login" : "Waiting for face..."}
      </button>

      <div className="mt-4 text-sm text-gray-500 text-center max-w-md">
        <p>• Make sure your entire face is visible</p>
        <p>• Avoid shadows and ensure good lighting</p>
      </div>
    </div>
  );
}
