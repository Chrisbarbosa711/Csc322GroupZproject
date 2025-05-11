from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
from gector import GECToR, predict, load_verb_dict
from transformers import AutoTokenizer
import logging
import time

# configure the log
logging.basicConfig(
    filename='gector_api.log',
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Grammar Correction API")

    # add CORS middleware, allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins, please change to specific domain in production environment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# initialize the model once
try:
    logger.info("Loading model...")
    model_id = 'gotutiyan/gector-roberta-base-5k'
    model = GECToR.from_pretrained(model_id)
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    encode, decode = load_verb_dict('data/verb-form-vocab.txt')
    logger.info("Model loaded successfully")
except Exception as e:
    logger.error(f"Error loading model: {e}")
    raise

class SentenceInput(BaseModel):
    text: str

def compare_sentences(original: str, corrected: str) -> List[Dict[str, Any]]:
    """
    compare the original sentence and the corrected sentence, return a structured change list
    """
    corrections = []
    
    if original == corrected:
        return corrections
    
    # compare by word level
    orig_tokens = original.split()
    corr_tokens = corrected.split()
    
    # find the position of each word in the original sentence (startIndex and endIndex)
    word_positions = []
    start_idx = 0
    for word in orig_tokens:
        start_pos = original.find(word, start_idx)
        if start_pos != -1:
            end_pos = start_pos + len(word)
            word_positions.append((start_pos, end_pos))
            start_idx = end_pos
    
    # compare the words before and after correction
    for i, (o_token, c_token) in enumerate(zip(orig_tokens, corr_tokens)):
        if o_token != c_token:
            # if the word is different, add a correction
            correction_type = "spelling" if len(o_token) == len(c_token) else "grammar"
            start_pos, end_pos = word_positions[i] if i < len(word_positions) else (0, 0)
            
            corrections.append({
                "id": i + 1,
                "type": correction_type,
                "original": o_token,
                "corrected": c_token,
                "startIndex": start_pos,
                "endIndex": end_pos,
                "message": f"Suggested correction: '{o_token}' → '{c_token}'" 
            })
    
    # handle the case of different lengths
    if len(orig_tokens) < len(corr_tokens):
        # there are added words
        for i in range(len(orig_tokens), len(corr_tokens)):
            corrections.append({
                "id": i + 1,
                "type": "missing",
                "original": "",
                "corrected": corr_tokens[i],
                "startIndex": len(original) if i == len(orig_tokens) else word_positions[i-1][1],
                "endIndex": len(original) if i == len(orig_tokens) else word_positions[i-1][1],
                "message": f"Missing word: '{corr_tokens[i]}'"
            })
    elif len(orig_tokens) > len(corr_tokens):
        # there are deleted words
        for i in range(len(corr_tokens), len(orig_tokens)):
            corrections.append({
                "id": i + 1,
                "type": "redundant",
                "original": orig_tokens[i],
                "corrected": "",
                "startIndex": word_positions[i][0],
                "endIndex": word_positions[i][1],
                "message": f"Redundant word: '{orig_tokens[i]}'"
            })
    
    return corrections

@app.get("/")
async def root():
    return {"message": "GECToR Grammar Correction API is running"}

@app.post("/correct")
async def correct(input: SentenceInput):
    start_time = time.time()
    logger.info(f"Received correction request for text: {input.text[:50]}...")
    
    try:
        original = input.text
        corrected = predict(model, tokenizer, [original], encode, decode)[0]
        
        # use the improved comparison function to generate more accurate correction results
        corrections = compare_sentences(original, corrected)
        
        processing_time = time.time() - start_time
        logger.info(f"Processed in {processing_time:.2f}s with {len(corrections)} corrections")
        
        return {
            "corrections": corrections,
            "corrected": corrected,
            "original": original,
            "processing_time": f"{processing_time:.2f}s"
        }
    except Exception as e:
        logger.error(f"Error processing request: {str(e)}")
        return {"error": str(e), "corrections": [], "corrected": input.text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
