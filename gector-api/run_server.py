#!/usr/bin/env python

"""
you should run this script in the gector38 virtual environment:
conda activate gector38
python run_server.py
"""

import uvicorn

if __name__ == "__main__":
    print("Starting Grammar Correction API server at http://localhost:7860")
    uvicorn.run("main:app", host="0.0.0.0", port=7860, reload=True)
