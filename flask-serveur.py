from picamera2 import Picamera2
import cv2
import pytesseract
import requests
import serial
import time

# Configuration de la caméra
picam2 = Picamera2()
config = picam2.create_preview_configuration({"format": 'RGB888', "size": (640, 480)})
picam2.configure(config)
picam2.start()

# Chargement du classificateur Haar
plate_cascade = cv2.CascadeClassifier('/home/niassy/haarcascades/haarcascade_russian_plate_number.xml')

# Configuration OCR
pytesseract.pytesseract.tesseract_cmd = "/usr/bin/tesseract"

# Configuration serveur
SERVER_URL = "http://192.168.1.88:3000/receive-plate"

# Configuration série Arduino
SERIAL_PORT = '/dev/ttyACM0'
BAUD_RATE = 9600
ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
time.sleep(2)  # Délai d'initialisation

def send_arduino_command(command):
    """Envoie une commande à l'Arduino avec vérification"""
    try:
        if ser.is_open:
            command_str = f"CMD{command}\n"  # Format de commande structuré
            ser.write(command_str.encode('utf-8'))
            print(f"Commande envoyée: {command_str.strip()}")
            ser.flush()  # Vide le buffer d'émission
            return True
        else:
            print("Port série fermé!")
            return False
    except (serial.SerialException, OSError) as e:
        print(f"Erreur série: {str(e)}")
        return False

def process_plate(plate_text):
    """Traite une plaque détectée et gère la réponse serveur"""
    try:
        response = requests.post(SERVER_URL, json={"plate": plate_text}, timeout=3)
        if response.status_code == 200:
            data = response.json()
            command = data.get("command", -1)
            print(f"Réponse serveur: Commande {command}")
            
            # Envoi de la commande à l'Arduino
            if command in {0, 1, 2, 3}:  # Commandes valides
                if send_arduino_command(command):
                    return True
            else:
                print("Commande invalide reçue")
        else:
            print(f"Erreur HTTP: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Erreur de connexion: {str(e)}")
    
    return False

try:
    last_processed = None  # Dernière plaque traitée
    cooldown = 1  # Délai anti-rebond en secondes

    while True:
        frame = picam2.capture_array()
        gray = cv2.cvtColor(frame, cv2.COLOR_RGB2GRAY)
        plates = plate_cascade.detectMultiScale(gray, scaleFactor=1.2, minNeighbors=4)

        for (x, y, w, h) in plates:
            cv2.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            plate_region = gray[y:y+h, x:x+w]  # Utiliser l'image en niveaux de gris

            # Prétraitement OCR amélioré
            plate_region = cv2.threshold(plate_region, 0, 255, cv2.THRESH_BINARY | cv2.THRESH_OTSU)[1]
            plate_region = cv2.medianBlur(plate_region, 3)

            # Reconnaissance OCR
            plate_text = pytesseract.image_to_string(
                plate_region, 
                config='--psm 8 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            ).strip().upper()

            if len(plate_text) >= 6:  # Longueur minimale plausible
                plate_text = ''.join([c for c in plate_text if c.isalnum()])
                print(f"Plaque détectée: {plate_text}")

                # Anti-rebond et vérification format
                if plate_text != last_processed and len(plate_text) in (7, 8):
                    last_processed = plate_text
                    process_plate(plate_text)
                    time.sleep(cooldown)  # Pause pour éviter les répétitions

        cv2.imshow("Camera", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

except KeyboardInterrupt:
    print("Arrêt demandé par l'utilisateur")

finally:
    picam2.stop()
    cv2.destroyAllWindows()
    if ser.is_open:
        ser.close()
    print("Nettoyage terminé")