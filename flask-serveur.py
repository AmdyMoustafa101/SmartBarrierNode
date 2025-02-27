from flask import Flask, request, jsonify
import cv2
import numpy as np
import pytesseract
import requests

app = Flask(__name__)

# Configuration
NODEJS_API_URL = "http://votre-serveur-nodejs:3000/api/plates"
TESSERACT_CONFIG = r'--oem 3 --psm 6 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

@app.route('/upload', methods=['POST'])
def handle_upload():
    # Vérifier le type de contenu
    if request.content_type != 'image/jpeg':
        return "Unsupported Media Type", 415

    try:
        # Lire les données de l'image
        image_data = request.get_data()

        # Traitement de l'image
        plate_text = process_image(image_data)

        if plate_text:
            # Envoi à l'API Node.js
            response = requests.post(
                NODEJS_API_URL,
                json={'plate': plate_text},
                timeout=5
            )
            return jsonify({"message": f"Plaque détectée: {plate_text}"}), 200
        return jsonify({"message": "Aucune plaque trouvée"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def process_image(image_data):
    try:
        # Conversion des données en image OpenCV
        nparr = np.frombuffer(image_data, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # Prétraitement de l'image
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        thresh = cv2.adaptiveThreshold(blur, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, 11, 2)

        # Recherche des contours
        contours, _ = cv2.findContours(thresh,
            cv2.RETR_TREE,
            cv2.CHAIN_APPROX_SIMPLE)

        # Filtrage des contours pour trouver la plaque
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            aspect_ratio = w / float(h)
            area = cv2.contourArea(cnt)

            if 3 < aspect_ratio < 5 and area > 1000:
                # Extraction de la ROI
                roi = img[y:y+h, x:x+w]

                # OCR avec Tesseract
                text = pytesseract.image_to_string(roi, config=TESSERACT_CONFIG)

                # Nettoyage du texte
                clean_text = ''.join(c for c in text if c.isalnum()).upper()

                if len(clean_text) >= 6:
                    return clean_text

        return None

    except Exception as e:
        print(f"Error processing image: {e}")
        return None

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
