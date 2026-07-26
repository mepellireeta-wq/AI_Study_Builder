import os
import PIL.Image
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

def grade_sheet(image_path: str):
    try:
        img = PIL.Image.open(image_path)
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = 'Grade this handwritten sheet. Return score (0-100) and feedback in JSON.'
        response = model.generate_content([prompt, img])
        return response.text
    except Exception as e:
        print(f'Fallback to EasyOCR: {e}')
        import easyocr
        reader = easyocr.Reader(['en'])
        return reader.readtext(image_path)

print('ChronoSense CV Grading Engine & EasyOCR Fallback Ready!')
