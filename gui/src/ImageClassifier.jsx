import React, { useState, useRef, useEffect } from "react";
import "antd/dist/antd.css";
import { updateImageLabel, loadImage } from "./Api";
import {
  Typography,
  Button,
  Row,
  Col,
  Divider,
  Space,
  Image,
  Progress,
} from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const ImageClassifier = ({ maxImages, images }) => {
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

  const buttonLabels = [
    "wooden boat",
    "kayak",
    "ship",
    "speedboat",
    "white boat",
    "ferry",
  ];

  const valueToPreview = {
    "wooden boat": "wooden",
    kayak: "kayak",
    ship: "ship",
    speedboat: "speed",
    "white boat": "white",
    ferry: "ferry",
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#F0F0F0",
      }}
    >
      <Typography.Title style={{ color: "white" }}>
        ImageLabeler
      </Typography.Title>
      <Space direction="vertical" size="middle" style={{ maxWidth: "100%" }}>
        <div style={{ width: "100%", textAlign: "center" }}>
          <Typography.Text style={{ color: "white", textAlign: "center" }}>
            {`${currentIndex + 1} / ${maxImages} (${(
              ((currentIndex + 1) / maxImages) *
              100
            ).toFixed(2)}%)`}
          </Typography.Text>
          <Progress
            percent={(((currentIndex + 1) / maxImages) * 100).toFixed(2)}
            showInfo={false}
            style={{ maxWidth: "100%" }}
          />
          <Typography.Title level={4} style={{ color: "white" }}>
            {currentLabel || "---"}
          </Typography.Title>
        </div>
        {imageURL ? (
          <Image
            src={imageURL}
            alt="Loaded from API"
            width="100%"
            height={512}
            style={{ objectFit: "contain", border: "1px solid white" }}
          />
        ) : (
          <Typography.Text>Loading image...</Typography.Text>
        )}
        <Row gutter={[16, 16]}>
          {buttonLabels.map((label, index) => (
            <Col span={8} key={index}>
              <Button
                key={index}
                onClick={() => handleSubmit(label)}
                style={{
                  width: "100%",
                  backgroundColor:
                    currentLabel === label ? "#1890ff" : "#4a4a4a",
                  borderColor: currentLabel === label ? "#1890ff" : "#4a4a4a",
                }}
                size="large"
                block
              >
                {valueToPreview[label]}
              </Button>
            </Col>
          ))}
        </Row>
        <Divider />
        <Row>
          <Col span={12}>
            <Button
              onClick={() =>
                currentIndex > 0 && setCurrentIndex(currentIndex - 1)
              }
              disabled={currentIndex === 0}
              icon={<LeftOutlined />}
              size="large"
              block
            >
              Back
            </Button>
          </Col>
          <Col span={12}>
            <Button
              onClick={() =>
                currentIndex < images.length - 1 &&
                setCurrentIndex(currentIndex + 1)
              }
              disabled={currentIndex === images.length - 1}
              size="large"
              block
            >
              Forward
              <RightOutlined />
            </Button>
          </Col>
        </Row>
        <Button
          type="dashed"
          onClick={() => goToFirst()}
          style={{ marginTop: "1rem" }}
          size="large"
          block
        >
          Find unlabeled
        </Button>
      </Space>
    </div>
  );
};

export default ImageClassifier;
