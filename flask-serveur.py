from picamera2 import Picamera2
import cv2
import pytesseract
import requests  # Importation de requests pour envoyer les données au serveur Node.js

# Initialisation de la caméra
picam2 = Picamera2()
picam2.configure(picam2.create_preview_configuration({"format": 'RGB888', "size": (640, 480)}))
picam2.start()

# Chargement du classificateur Haar pour la détection des plaques d'immatriculation
plate_cascade = cv2.CascadeClassifier('/home/niassy/haarcascades/haarcascade_russian_plate_number.xml')

# Configuration de Tesseract OCR
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"  # Le chemin d'accès à l'exécutable tesseract

# URL de l'API Node.js à laquelle nous allons envoyer les données
node_server_url = "http://192.168.1.88:3000/receive-plate"

try:
    while True:
        # Capture de l'image depuis la caméra
        frame = picam2.capture_array()

        # Conversion de l'image en niveaux de gris pour la détection
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)

        # Détection des plaques d'immatriculation
        plates = plate_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=4)

        # Dessin des rectangles autour des plaques détectées
        for (x, y, w, h) in plates:
            # Dessiner un rectangle autour de la plaque détectée
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)  # rectangle vert pour la plaque

            # Extraire l'image de la plaque
            plate_region = frame[y:y + h, x:x + w]

            # Prétraitement de l'image avant OCR
            _, plate_region_bin = cv2.threshold(plate_region, 150, 255, cv2.THRESH_BINARY)
            plate_region_bin = cv2.GaussianBlur(plate_region_bin, (5, 5), 0)

            # Affichage de la plaque dans la console (convertie en format texte via OCR)
            print("Plaque détectée!")

            # Utilisation de Tesseract OCR pour lire la plaque
            plate_text = pytesseract.image_to_string(plate_region_bin, config='--psm 6').strip()
            plate_text = ''.join(e for e in plate_text if e.isalnum())  # Nettoyage du texte

            if plate_text:
                print(f"Plaque extraite : {plate_text}")

                # Envoi des informations de la plaque d'immatriculation au serveur Node.js
                data = {"plate": plate_text}
                try:
                    response = requests.post(node_server_url, json=data)
                    if response.status_code == 200:
                        print("Plaque envoyée avec succès au serveur Node.js")
                    else:
                        print(f"Erreur lors de l'envoi de la plaque au serveur : {response.status_code}")
                except requests.exceptions.RequestException as e:
                    print(f"Erreur de connexion au serveur : {e}")

        # Affichage de l'image avec les plaques détectées
        cv2.imshow("Camera", frame)

        # Quitter l'application si la touche 'q' est pressée
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
finally:
    picam2.stop()
    cv2.destroyAllWindows()
