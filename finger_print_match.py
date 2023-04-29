import cv2
from flask import Flask, request
from flask_cors import CORS, cross_origin
import numpy as np
import base64

app = Flask(__name__)
CORS(app)

def compare_fingerprints(img1, img2):
    sift = cv2.SIFT_create()
    keypoints_1, des1 = sift.detectAndCompute(img1, None)
    keypoints_2, des2 = sift.detectAndCompute(img2, None)
    
    bf = cv2.FlannBasedMatcher({"algorithm": 1, "trees": 10}, {})
    # matches = cv2.FlannBasedMatcher({"algorithm": 1, "trees": 10}, {}).knnMatch(des1, des2, k=2)
    matches = bf.knnMatch(des1, des2, k=2)
    match_points = []
    for p, q in matches:
        if p.distance < 0.5 * q.distance:
            match_points.append(p)
    
    keypoints  = 0
    if len(keypoints_1) <= len(keypoints_2):
        keypoints = len(keypoints_1)
    else:
        keypoints = len(keypoints_2)
        
    print(len(keypoints_1), len(keypoints_2), len(match_points), len(match_points) / keypoints * 100)
    
    if len(match_points) / keypoints * 100 >  2:
        return True
    return False

def convert_image(image):
    image = image.split(",")[1]
    image = np.frombuffer(base64.b64decode(image), np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_GRAYSCALE)
    return image

@cross_origin
@app.route('/compare_fingerprints', methods=['POST'])
def handle_route():
    data = request.json
    img1 = data['img1']
    images = data['images']
    
    img1 = convert_image(img1)
    images = list(map( lambda image: convert_image(image),  images))
   
    
    return {"isSame": any(map( lambda image: compare_fingerprints(img1, image),  images))}


app.run(port=9000, host='0.0.0.0', debug=True)