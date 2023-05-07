import os
import sys
from io import BytesIO
from typing import Dict, List, Optional

import cv2
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from pydantic import BaseModel
from starlette.middleware.cors import CORSMiddleware
from tinydb import Query, TinyDB
from tqdm import tqdm

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
app.state.imgdir = "" # REPLACE ME

class ImageLabelBase(BaseModel):
    label: Optional[str] = None

class ImageLabelCreate(ImageLabelBase):
    path: str

class ImageLabelUpdate(ImageLabelBase):
    path: str

class ImageLabelInDB(ImageLabelBase):
    path: str
    
class ImageLabelRequest(ImageLabelBase):
    path: str
    

@app.on_event("startup")
def startup():
    if app.state.imgdir == "":
        raise SystemExit("Please set the image directory path in 'app.state.imgdir'")
    if is_file_initialized("database.json"):
        app.state.db = TinyDB("database.json")
    else:
        app.state.db = create_database("database.json", app.state.imgdir)

@app.on_event("shutdown")
def shutdown():
    app.state.db.close()
    
@app.get("/export-database/")
def export_database():
    return JSONResponse(app.state.db.all(), headers={"Content-Disposition": "attachment; filename=database.json"})


@app.get("/labels/", response_model=List[ImageLabelInDB])
def read_image_labels(skip: int = 0, limit: int = 10):
    image_labels = app.state.db.all()
    return image_labels[skip: skip + limit]

@app.put("/labels/", response_model=ImageLabelInDB)
def update_image_label(image_label_request: ImageLabelRequest):
    path = image_label_request.path
    if not app.state.db.contains(Query().path == path):
        raise HTTPException(status_code=404, detail="Image not found")
    app.state.db.update(image_label_request.dict(), Query().path == path)
    updated_image_label = app.state.db.get(Query().path == path)
    return updated_image_label

@app.get("/images/max")    
def get_number_of_images():
    if app.state.db is None:
        raise HTTPException(status_code=500, detail="Database not initialized")
    return len(app.state.db)

@app.get("/images/")
def get_image(path: str, size: Optional[int] = None):
    image_label = app.state.db.get(Query().path == path)
    if image_label is None:
        raise HTTPException(status_code=404, detail="Image not found")
    
    if not os.path.exists(image_label['path']):
        raise HTTPException(status_code=404, detail="Image file not found on server")
    
    if size is not None:
        img = cv2.imread(image_label['path'])
        img = cv2.resize(img, (size, size), interpolation=cv2.INTER_AREA)
        is_success, buffer = cv2.imencode(".png", img)
        if is_success:
            return StreamingResponse(BytesIO(buffer.tobytes()), media_type="image/png")
        else:
            raise HTTPException(status_code=500, detail="Failed to encode the resized image")
    else:
        return FileResponse(image_label['path'], media_type="image/png")
    
    
# ---

def is_file_initialized(fname: str) -> bool:
    return os.path.exists(fname) and os.path.getsize(fname) > 0

def is_valid_image(path: str) -> bool:
    return path.endswith(("png", "jpg", "jpeg"))

def create_database(dbname: str, imgdir: str):
    db = TinyDB(dbname)
    valid_images = [os.path.join(imgdir, imgpath) for imgpath in os.listdir(imgdir) if is_valid_image(imgpath)]
    for path in tqdm(valid_images, desc="Indexing db", colour="green", leave=False):
        # Check if path is already in the database
        existing_entry = db.search(Query().path == path)
        # If the path is not in the database, insert a new entry with an empty label
        if not existing_entry:
            db.insert({"path": path, "label": ""})
    return db