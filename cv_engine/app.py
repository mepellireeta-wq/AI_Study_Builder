from fastapi import FastAPI, UploadFile, File
import shutil, os
from grader import grade_sheet

app = FastAPI(title='ChronoSense CV API')

@app.get('/')
def home(): return {'service': 'ChronoSense CV Engine API', 'status': 'online'}

@app.post('/grade-sheet')
async def grade(file: UploadFile = File(...)):
    path = f'temp_{file.filename}'
    with open(path, 'wb') as buffer:
        shutil.copyfileobj(file.file, buffer)
    result = grade_sheet(path)
    if os.path.exists(path): os.remove(path)
    return {'status': 'success', 'result': result}
