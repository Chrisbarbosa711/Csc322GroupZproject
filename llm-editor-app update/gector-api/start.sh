#!/bin/bash

# switch to the directory of the script
cd "$(dirname "$0")"

# activate the gector38 virtual environment
echo "Activating gector38 environment..."
source ~/miniconda3/etc/profile.d/conda.sh
conda activate gector38

# start the server
echo "Starting Grammar Correction API server..."
python run_server.py 