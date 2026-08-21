# UrbanSweep - Google Colab YOLOv8 Backend
# -------------------------------------------------------------
# INSTRUCTIONS FOR HACKATHON DEMO:
# 1. Open Google Colab (colab.research.google.com) and create a New Notebook.
# 2. Go to Runtime -> Change runtime type -> Select "T4 GPU" (Important for speed).
# 3. Create a Code Cell and paste the pip installs from STEP 1 below. Run it.
# 4. Get a FREE ngrok authtoken from: https://dashboard.ngrok.com/get-started/your-authtoken
# 5. Create a second Code Cell, paste STEP 2 below, insert your authtoken, and run it.
# 6. Copy the public ngrok URL it prints out, and paste it into your UrbanSweep /debug dashboard!

# ==========================================
# STEP 1: RUN THIS IN THE FIRST CELL
# ==========================================
# !pip install ultralytics fastapi uvicorn pyngrok nest-asyncio python-multipart opencv-python-headless

# ==========================================
# STEP 2: RUN THIS IN THE SECOND CELL
# ==========================================
from ultralytics import YOLO
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from pyngrok import ngrok
import nest_asyncio
import cv2
import numpy as np

# 1. Initialize FastAPI
app = FastAPI(title="UrbanSweep AI Backend")

# Allow CORS so your Next.js dashboard can communicate with it
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 2. Load YOLO Model (downloads the ultra-fast yolov8n nano model automatically)
print("Loading YOLOv8 Model...")
model = YOLO('yolov8n.pt') 
print("Model loaded successfully!")

@app.post("/analyze-image")
async def analyze_image(file: UploadFile = File(...)):
    """
    Receives an image from the dashboard, runs YOLOv8 object detection, 
    and returns bounding boxes and calculated severity score.
    """
    # Read the image bytes from the request
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # Run YOLO inference
    results = model(img)
    
    detections = []
    waste_count = 0
    
    # Parse the raw YOLO results
    for r in results:
        boxes = r.boxes
        for box in boxes:
            # Extract data
            cls_id = int(box.cls[0])
            cls_name = model.names[cls_id]
            conf = float(box.conf[0])
            coords = box.xyxy[0].tolist() # [x1, y1, x2, y2]
            
            detections.append({
                "class": cls_name,
                "confidence": round(conf, 2),
                "bbox": [round(c, 1) for c in coords]
            })
            
            # For hackathon purposes, we count common objects as "trash items" 
            waste_count += 1
            
    # Calculate proprietary "Severity Score" based on volume/count
    severity_score = min(100, waste_count * 15) # Example logic: 15% severity per item
    
    return {
        "status": "success",
        "model_used": "YOLOv8n",
        "total_items_detected": waste_count,
        "calculated_severity": severity_score,
        "recommendation": "CRITICAL: DISPATCH TRUCK" if severity_score > 70 else "MONITOR",
        "raw_detections": detections
    }

@app.get("/")
def health_check():
    return {"status": "online", "message": "UrbanSweep AI Backend is listening!"}

# 3. Setup Ngrok Tunnel (REPLACE THIS TOKEN!)
# Get your token at https://dashboard.ngrok.com/
NGROK_AUTH_TOKEN = "YOUR_NGROK_AUTHTOKEN_HERE" 
ngrok.set_auth_token(NGROK_AUTH_TOKEN)

# Open a tunnel on port 8000
public_url = ngrok.connect(8000).public_url
print("\n" + "="*50)
print(f"🚀 YOUR PUBLIC API URL IS: {public_url}")
print(f"👉 PASTE THIS URL INTO YOUR NEXT.JS DEBUG DASHBOARD")
print("="*50 + "\n")

# 4. Start the server (using the async Server object to prevent Colab event loop errors)
import asyncio
nest_asyncio.apply()
config = uvicorn.Config(app, host="0.0.0.0", port=8000)
server = uvicorn.Server(config)
await server.serve()
