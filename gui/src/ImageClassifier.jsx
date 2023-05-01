import React, { useState, useRef, useEffect } from "react";
import { Button, Typography } from "antd";
import "antd/dist/antd.css";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { updateImageLabel, loadImage } from "./Api";
import { Divider } from "antd";
import { Row, Col } from "antd";

const MAX_IMAGE = 3551;

const ImageClassifier = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentLabel, setCurrentLabel] = useState("");
  const [imageURL, setImageURL] = useState(null);

  // Loop, and find the first image without a label
  const goToFirst = () => {
    for (let i = 0; i < images.length; i++) {
      if (!images[i].label) {
        setCurrentIndex(i);
        break;
      }
    }
  };

  useEffect(() => {
    const fetchImage = async () => {
      const image = await loadImage(images[currentIndex].path, 512);
      setImageURL(image);
    };
    fetchImage();
  }, [currentIndex]);

  useEffect(() => {
    setCurrentLabel(images[currentIndex].label);
  }, [currentIndex]);

  useEffect(() => {
    setCurrentLabel(images[currentIndex].label);
  }, [images]);

  const handleSubmit = async (label) => {
    setCurrentLabel(label);
    images[currentIndex].label = label;

    try {
      const r = await updateImageLabel(images[currentIndex].path, label);
    } catch (error) {
      console.error("Error updating the label map file");
      console.error(error);
    }
    setCurrentIndex(currentIndex + 1);
  };

  // useEffect(() => {
  //   setCurrentLabel(images[currentIndex].label);
  // }, [currentIndex, images]);

  const buttonLabels = [
    "wooden boat",
    "kayak",
    "ship",
    "speedboat",
    "white boat",
    "ferry",
  ];

  const labelToColor = {
    "wooden boat": "#873800",
    kayak: "#d4b106",
    ship: "#91caff",
    speedboat: "#fa8c16",
    "white boat": "#f0f5ff",
    ferry: "#8c8c8c",
  };

  const valueToPreview = {
    "wooden boat": "wooden",
    kayak: "kayak",
    ship: "ship",
    speedboat: "speed",
    "white boat": "white",
    ferry: "ferry",
  };

  const buttonStyle = {
    flex: 1,
    margin: 4,
    // backgroundColor: "#4a4a4a",
    // borderColor: "#4a4a4a",
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
      }}
    >
      <Typography.Title
        style={{ textAlign: "center", color: "white", marginTop: 10 }}
      >
        Image Classification
      </Typography.Title>
      <Typography.Title
        level={4}
        style={{ textAlign: "center", color: "white" }}
      >
        Progress: {currentIndex + 1}/{MAX_IMAGE}
        <br />
        Percentage: {(((currentIndex + 1) / MAX_IMAGE) * 100).toFixed(2)}%
      </Typography.Title>
      <Typography.Title
        level={4}
        style={{ textAlign: "center", color: "white" }}
      >
        {currentLabel || "---"}
      </Typography.Title>
      <div>
        {imageURL ? (
          <img
            id="myImage"
            src={imageURL}
            alt="Loaded from API"
            style={{
              maxWidth: "100%",
              border: "1px solid white",
              maxHeight: "512px",
              objectFit: "contain",
            }}
          />
        ) : (
          <p>Loading image...</p>
        )}
      </div>
      <div
        style={{
          width: "100%",
          display: "flex",
          justifyContent: "center",
          marginTop: 10,
        }}
      >
        <Row gutter={[8, 8]}>
          {buttonLabels.map((label, index) => (
            <Col span={8}>
              <Button
                key={index}
                // type={currentLabel === label ? "primary" : "default"}
                onClick={() => handleSubmit(label)}
                style={{
                  flex: 1,
                  margin: 1,
                  width: "60%",
                  backgroundColor: labelToColor[label],
                  borderColor: labelToColor[label],
                }}
                size="large"
              >
                {valueToPreview[label]}
              </Button>
            </Col>
          ))}
        </Row>
      </div>
      <Divider />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 300,
        }}
      >
        <Button
          type="default"
          onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={{ ...buttonStyle, marginLeft: 10 }}
          icon={<LeftOutlined />}
          size="small"
        >
          Back
        </Button>
        <Button
          type="default"
          onClick={() =>
            currentIndex < images.length - 1 &&
            setCurrentIndex(currentIndex + 1)
          }
          disabled={currentIndex === images.length - 1}
          style={{ ...buttonStyle, marginRight: 10 }}
          size="small"
        >
          Forward
          <RightOutlined />
        </Button>
      </div>
      <div>
        <Button
          type="dashed"
          onClick={() => goToFirst()}
          style={{ ...buttonStyle, marginTop: 10 }}
          size="small"
        >
          GTF
        </Button>
      </div>
    </div>
  );
};

export default ImageClassifier;
