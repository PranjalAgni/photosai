"use client";

import { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";

export default function Login() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
          }

          const result = await faceapi
            .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
            .withFaceLandmarks()
            .withFaceDescriptor();

          // console.log(result);

          const detection = await faceapi.detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions(),
          );

          if (detection) {
            console.log("✅ Face detected!");
            setIsFaceDetected(true);
          } else {
            console.log("❌ No face in frame");
            setIsFaceDetected(false);
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

  const handleLogin = () => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const imageDataURL = canvas.toDataURL("image/jpeg");
      console.log("Captured image data URL:", imageDataURL);
      // We will send this to the server later.
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Face Login</h1>
      <div style={{ position: "relative", width: "320px", height: "240px" }}>
        <video
          ref={videoRef}
          width="320"
          height="240"
          autoPlay
          muted
          style={{ position: "absolute", top: 0, left: 0, opacity: 0 }} // Hide the video element
        ></video>
        <canvas
          ref={canvasRef}
          width="320"
          height="240"
          style={{ position: "absolute", top: 0, left: 0 }}
        ></canvas>
      </div>
      <button
        onClick={handleLogin}
        disabled={!isFaceDetected}
        className={`mt-4 px-4 py-2 text-white rounded ${
          isFaceDetected
            ? "bg-blue-500 hover:bg-blue-600"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Login
      </button>
    </div>
  );
}
