import React, { useState, useEffect } from "react";
import ImageClassifier from "./ImageClassifier.jsx";
import { getImages } from "./Api.jsx";

const App = () => {
  const [images, setImages] = useState(null);

  useEffect(() => {
    const fetchAllImages = async () => {
      const data = await getImages(0, 5000);
      setImages(data);
    };

    fetchAllImages();
  }, []);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#2f2f2f",
      }}
    >
      {images !== null ? (
        <ImageClassifier images={images} />
      ) : (
        <div>
          <h1>Labeling Finished</h1>
        </div>
      )}
    </div>
  );
};

export default App;
