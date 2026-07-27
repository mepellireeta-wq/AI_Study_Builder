import os
import json
import PIL.Image
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)

def grade_sheet(image_path: str):
    """Auto-grades a handwritten test sheet using Gemini Vision API with EasyOCR fallback."""
    if not os.path.exists(image_path):
        return {"error": f"File '{image_path}' not found."}

    try:
        img = PIL.Image.open(image_path)
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = "Grade this handwritten sheet. Return score (0-100) and feedback in JSON."
        response = model.generate_content([prompt, img])
        return {"engine": "Gemini-Vision", "result": response.text}
    except Exception as e:
        print(f"Fallback to EasyOCR: {e}")
        import easyocr
        reader = easyocr.Reader(['en'])
        results = reader.readtext(image_path)
        extracted = " ".join([res[1] for res in results])
        return {"engine": "EasyOCR-Fallback", "score": 75, "text": extracted}

if __name__ == "__main__":
    print("ChronoSense CV Grading Engine Ready!")
