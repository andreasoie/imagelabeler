import React, { useState, useEffect } from "react";
import ImageClassifier from "./ImageClassifier.jsx";
import { getImages, getMaxImages } from "./Api.jsx";
import { Layout, Spin, Typography } from "antd";

const { Content } = Layout;

const App = () => {
  const [maxImages, setMaxImages] = useState(0);
  const [images, setImages] = useState(null);

  useEffect(() => {
    const fetchAllImages = async () => {
      const maxImg = await getMaxImages();
      const imagesUrls = await getImages(0, maxImg);
      console.log("imagesUrls", imagesUrls);
      setMaxImages(maxImg);
      setImages(imagesUrls);
    };

    fetchAllImages();
  }, []);

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#2C3333" }}>
      <Content
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "1rem",
        }}
      >
        {images !== null ? (
          images.length > 0 ? (
            <ImageClassifier maxImages={maxImages} images={images} />
          ) : (
            <Typography.Text style={{ color: "#CBE4DE" }}>
              No images found ...
            </Typography.Text>
          )
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Spin size="large" />
            <Typography.Text style={{ color: "#CBE4DE", marginTop: "1rem" }}>
              Loading images...
            </Typography.Text>
          </div>
        )}
      </Content>
    </Layout>
  );
};

export default App;
