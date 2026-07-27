import os
import sys
import json
import argparse
import PIL.Image
from dotenv import load_dotenv

# Ensure stdout handles UTF-8 formatting safely on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

def clean_json_response(text: str) -> dict:
    """
    Cleans markdown formatting (e.g. ```json ... ```) and parses string into JSON dictionary.
    """
    cleaned = text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.splitlines()
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].startswith("```"):
            lines = lines[:-1]
        cleaned = "\n".join(lines).strip()
    
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as err:
        return {
            "error": "Failed to parse JSON response from AI model",
            "raw_response": text,
            "details": str(err)
        }

def grade_handwritten_sheet(image_path: str) -> dict:
    """
    Auto-grades a handwritten test sheet using Gemini Vision API.
    Fallback to local EasyOCR if API is unavailable or encounters an error.
    """
    if not os.path.exists(image_path):
        error_msg = f"Image file '{image_path}' not found."
        print(f"[!] {error_msg}")
        return {"error": error_msg}

    print(f"[*] Reading handwritten sheet: {image_path}")
    
    try:
        img = PIL.Image.open(image_path)
    except Exception as e:
        error_msg = f"Failed to open image '{image_path}': {e}"
        print(f"[X] {error_msg}")
        return {"error": error_msg}

    if api_key:
        prompt = """
        You are an automated grading assistant for ChronoSense.
        Examine this handwritten test/study sheet image.
        Return a JSON object containing:
        1. "score": Estimated grade from 0 to 100 (integer).
        2. "topics_mastered": List of strings for topics demonstrated well.
        3. "topics_needing_review": List of strings for weak topics or mistakes.
        4. "feedback": A 2-sentence constructive feedback summary for the student.
        """

        # Try Google GenAI SDK (google-genai)
        try:
            from google import genai
            from google.genai import types
            
            print("[*] Analyzing image with Gemini Vision AI (google.genai)...")
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model='gemini-2.5-flash',
                contents=[prompt, img],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json"
                )
            )
            result_data = clean_json_response(response.text)
            print("[+] Analysis Complete Result:\n")
            print(json.dumps(result_data, indent=2))
            return result_data

        except ImportError:
            # Fallback to legacy google-generativeai package if new SDK is not installed yet
            try:
                import google.generativeai as legacy_genai
                print("[*] Analyzing image with Gemini Vision AI (google.generativeai)...")
                legacy_genai.configure(api_key=api_key)
                model = legacy_genai.GenerativeModel(
                    'gemini-1.5-flash',
                    generation_config={"response_mime_type": "application/json"}
                )
                response = model.generate_content([prompt, img])
                result_data = clean_json_response(response.text)
                print("[+] Analysis Complete Result:\n")
                print(json.dumps(result_data, indent=2))
                return result_data
            except Exception as legacy_err:
                print(f"[!] Legacy API Error: {legacy_err}")
        except Exception as e:
            print(f"[!] Gemini API Error: {e}")
    else:
        print("[!] GEMINI_API_KEY not found in environment. Skipping AI Vision request.")

    # Fallback to local OCR if API failed or key missing
    print("[*] Switching to EasyOCR local fallback...")
    try:
        import easyocr
        reader = easyocr.Reader(['en'])
        ocr_results = reader.readtext(image_path)
        extracted_text = " ".join([item[1] for item in ocr_results])
        print(f"[*] Extracted Text via EasyOCR:\n{extracted_text}")
        return {
            "fallback": True,
            "extracted_text": extracted_text,
            "message": "Grading unavailable via local OCR. Gemini API required for full auto-grading."
        }
    except ImportError:
        print("[X] EasyOCR is not installed. Please install easyocr or set GEMINI_API_KEY in .env.")
        return {"error": "Gemini API failed and easyocr package is not installed."}
    except Exception as e:
        print(f"[X] EasyOCR Processing Error: {e}")
        return {"error": f"EasyOCR error: {e}"}

def main():
    parser = argparse.ArgumentParser(description="ChronoSense CV Grading Engine - Handwritten Sheet Analyzer")
    parser.add_argument("image", nargs="?", help="Path to the handwritten test sheet image file")
    args = parser.parse_args()

    print("ChronoSense CV Grading Engine")
    print("==============================")
    
    if args.image:
        grade_handwritten_sheet(args.image)
    else:
        print("Usage: python grader.py <path_to_handwritten_image>")
        print("Example: python grader.py sample_test.jpg\n")
        print("Note: Ensure GEMINI_API_KEY is defined in a .env file or environment variable.")

if __name__ == "__main__":
    main()
