import os
from io import BytesIO
from typing import Dict, List, Optional

import cv2
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, StreamingResponse
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from tinydb import Query, TinyDB

origins = [
    "http://127.0.0.1:8000",
    "http://127.0.0.1:8001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
]



app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class ImageLabelBase(BaseModel):
    label: Optional[str] = None

class ImageLabelCreate(ImageLabelBase):
    path: str

class ImageLabelUpdate(ImageLabelBase):
    pass

class ImageLabelInDB(ImageLabelBase):
    path: str
    

@app.on_event("startup")
def startup():
    app.state.db = TinyDB('database.json')
    def read_path(path: str) -> str: return os.path.join("images", path)
    app.state.loadimg = read_path

@app.on_event("shutdown")
def shutdown():
    app.state.db.close()

@app.get("/labels/", response_model=List[ImageLabelInDB])
def read_image_labels(skip: int = 0, limit: int = 10):
    image_labels = app.state.db.all()
    return image_labels[skip: skip + limit]

@app.get("/labels/{path}", response_model=ImageLabelInDB)
def read_image_label(path: str):
    image_label = app.state.db.get(Query().path == path)
    if image_label is None:
        raise HTTPException(status_code=404, detail="Image not found")
    return image_label

@app.put("/labels/{path}", response_model=ImageLabelInDB)
def update_image_label(path: str, image_label: ImageLabelUpdate):
    if not app.state.db.contains(Query().path == path):
        raise HTTPException(status_code=404, detail="Image not found")
    app.state.db.update(image_label.dict(), Query().path == path)
    updated_image_label = app.state.db.get(Query().path == path)
    return updated_image_label


@app.get("/images/")    
def get_number_of_images():
    if app.state.db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return len(app.state.db)

# get image by path
@app.get("/images/{path}")
def get_image(path: str, size: Optional[int] = None):
    image_label = app.state.db.get(Query().path == path)
    if image_label is None:
        raise HTTPException(status_code=404, detail="Image not found")
    
    relative_path = app.state.loadimg(image_label['path'])
    
    if not os.path.exists(relative_path):
        raise HTTPException(status_code=404, detail="Image file not found on server")
    
    if size is not None:
        img = cv2.imread(relative_path)
        img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)
        is_success, buffer = cv2.imencode(".png", img)
        if is_success:
            return StreamingResponse(BytesIO(buffer.tobytes()), media_type="image/png")
        else:
            raise HTTPException(status_code=500, detail="Failed to encode the resized image")
    else:
        return FileResponse(relative_path, media_type="image/png")