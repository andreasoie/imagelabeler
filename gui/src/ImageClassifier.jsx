import React, { useState, useRef, useEffect } from "react";
import "antd/dist/antd.css";
import { updateImageLabel, loadImage, exportDatabase } from "./Api";
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
import {
  LeftOutlined,
  RightOutlined,
  FastForwardOutlined,
  DownloadOutlined,
} from "@ant-design/icons";

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

  const handleExportDatabase = async () => {
    const data = await exportDatabase();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "database.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const buttonLabels = [
    "wooden boat",
    "kayak",
    "ship",
    "speedboat",
    "white boat",
    "ferry",
  ];

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
      <Typography.Title
        style={{
          color: "#CBE4DE",
          fontWeight: "bold",
          fontSize: "48px",
          letterSpacing: "1px",
          marginBottom: "16px",
        }}
      >
        ImageLabeler
      </Typography.Title>

      <Space direction="vertical" size="middle" style={{ maxWidth: "100%" }}>
        <div style={{ width: "100%", textAlign: "center" }}>
          <Space
            direction="vertical"
            style={{ width: "100%", textAlign: "center" }}
          >
            <div>
              <Typography.Text style={{ color: "white", fontSize: "18px" }}>
                Labled:{" "}
                {`${currentIndex + 1} / ${maxImages} (${(
                  ((currentIndex + 1) / maxImages) *
                  100
                ).toFixed(2)}%)`}
              </Typography.Text>
              <Button
                onClick={handleExportDatabase}
                icon={<DownloadOutlined />}
                size="middle"
                style={{
                  marginLeft: "1rem",
                  backgroundColor: "#2C3333",
                  color: "#CBE4DE",
                }}
              />
            </div>
            <Progress
              percent={(((currentIndex + 1) / maxImages) * 100).toFixed(2)}
              showInfo={false}
              style={{ maxWidth: "100%" }}
            />
          </Space>
          <Typography.Title
            level={4}
            style={{
              color: "#CBE4DE",
              fontWeight: "600",
              letterSpacing: "0.5px",
              fontSize: "24px",
              marginBottom: "16px",
            }}
          >
            {currentLabel || "---"}
          </Typography.Title>
        </div>
        {imageURL ? (
          <Image
            src={imageURL}
            alt="Loaded from API"
            width="100%"
            height={512}
            style={{
              objectFit: "contain",
              position: "relative",
              "::after": {
                content: `'${currentLabel || "---"}'`,
                position: "absolute",
                top: "16px",
                left: "16px",
                color: "#CBE4DE",
                fontWeight: "600",
                letterSpacing: "0.5px",
                fontSize: "24px",
                backgroundColor: "rgba(46, 79, 79, 0.8)",
                borderRadius: "4px",
                padding: "4px 8px",
              },
            }}
          />
        ) : (
          <Typography.Text>Loading image...</Typography.Text>
        )}
        <Row gutter={[16, 16]} style={{ marginBottom: "16px" }}>
          {buttonLabels.slice(0, 3).map((label, index) => (
            <Col span={8} key={index}>
              <Button
                key={index}
                onClick={() => handleSubmit(label)}
                style={{
                  width: "100%",
                  borderColor: currentLabel === label ? "#0E8388" : "#2E4F4F",
                  background: currentLabel === label ? "#CBE4DE" : "#2E4F4F",
                  color: currentLabel === label ? "#2E4F4F" : "#CBE4DE",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
                size="large"
                block
                type={currentLabel === label ? "primary" : "default"}
                ghost={currentLabel !== label}
              >
                {label}
              </Button>
            </Col>
          ))}
        </Row>
        <Row gutter={[16, 16]}>
          {buttonLabels.slice(3).map((label, index) => (
            <Col span={8} key={index}>
              <Button
                key={index}
                onClick={() => handleSubmit(label)}
                style={{
                  width: "100%",
                  borderColor: currentLabel === label ? "#0E8388" : "#2E4F4F",
                  background: currentLabel === label ? "#CBE4DE" : "#2E4F4F",
                  color: currentLabel === label ? "#2E4F4F" : "#CBE4DE",
                  borderRadius: "6px",
                  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                }}
                size="large"
                block
                type={currentLabel === label ? "primary" : "default"}
                ghost={currentLabel !== label}
              >
                {label}
              </Button>
            </Col>
          ))}
        </Row>
        <Divider />
        <Row>
          <Col span={8}>
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
          <Col span={8}>
            <Button
              onClick={() => goToFirst()}
              icon={<FastForwardOutlined />}
              size="large"
              block
            >
              GTF
            </Button>
          </Col>
          <Col span={8}>
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
      </Space>
    </div>
  );
};

export default ImageClassifier;
