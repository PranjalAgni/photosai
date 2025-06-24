"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMatchData } from "../../contexts/MatchDataContext";
import Image from "next/image";

interface Match {
  photoUrl: string;
  faceId: string;
  boundingBox: [number, number, number, number];
  confidence: number;
}

export default function Gallery() {
  const { matchData } = useMatchData();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sortedMatches, setSortedMatches] = useState<Match[]>([]);

  useEffect(() => {
    if (!matchData) {
      // Redirect to login if no match data
      router.push("/login");
      return;
    }

    // Sort matches by confidence (highest first)
    const sorted = [...matchData.matches].sort(
      (a, b) => b.confidence - a.confidence,
    );

    setSortedMatches(sorted);
  }, [matchData, router]);

  const openModal = (imageUrl: string) => {
    setSelectedImage(imageUrl);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (!matchData || sortedMatches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold mb-4">Gallery</h1>
        <p className="text-gray-500">Loading matches... 🐇🐇🐇</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Face Match Results 💖
      </h1>

      {/* Summary */}
      {matchData.summary && (
        <div className="bg-gray-100 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold mb-2">Match Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Total Photos:</span>{" "}
              {matchData.summary.totalMatchedPhotos}
            </div>
            <div>
              <span className="font-medium">Faces Considered:</span>{" "}
              {matchData.summary.totalFacesConsidered}
            </div>
            <div>
              <span className="font-medium">Threshold:</span>{" "}
              {matchData.summary.matchingThreshold}
            </div>
          </div>
        </div>
      )}

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {sortedMatches.map((match, index) => (
          <div
            key={match.faceId}
            className="relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => openModal(match.photoUrl)}
          >
            <div className="aspect-square relative">
              <Image
                src={match.photoUrl}
                alt={`Match ${index + 1}`}
                fill
                className="object-cover hover:scale-105 transition-transform"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            </div>
            {/* Confidence Badge */}
            <div className="absolute top-2 right-2">
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  match.confidence > 0.3
                    ? "bg-green-500 text-white"
                    : match.confidence > 0.1
                    ? "bg-yellow-500 text-black"
                    : "bg-red-500 text-white"
                }`}
              >
                {(match.confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal for full-size image */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
            >
              ×
            </button>
            <Image
              src={selectedImage}
              alt="Full size image"
              width={800}
              height={600}
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
