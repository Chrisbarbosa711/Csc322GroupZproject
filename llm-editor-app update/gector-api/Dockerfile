FROM python:3.8-slim

LABEL description="GECToR Grammar Correction API Docker Image"

# set the working directory
WORKDIR /app

# install system dependencies (gcc and g++ for compiling some Python packages)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# copy the dependency file
COPY requirements.txt .

# install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    # install gector (if not listed in requirements.txt)
    pip install --no-cache-dir --upgrade transformers torch

# create necessary directories
RUN mkdir -p /app/data /app/models

# copy the verb form vocabulary file (if exists)
COPY data/verb-form-vocab.txt /app/data/verb-form-vocab.txt

# ensure the verb form vocabulary file exists
RUN if [ ! -s /app/data/verb-form-vocab.txt ]; then \
    echo "Creating empty verb form vocabulary file..."; \
    touch /app/data/verb-form-vocab.txt; \
    fi

# download the model (download in advance to avoid downloading at runtime)
RUN echo "Downloading GECToR model..." && \
    python -c "from transformers import AutoTokenizer, AutoModelForMaskedLM; \
    print('Downloading tokenizer...'); \
    AutoTokenizer.from_pretrained('gotutiyan/gector-roberta-base-5k'); \
    print('Downloading model...'); \
    AutoModelForMaskedLM.from_pretrained('gotutiyan/gector-roberta-base-5k'); \
    print('Model download complete.')"

# copy the application code
COPY . .

# set the environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=7860

# expose the API port
EXPOSE 7860

# add health check
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:7860/ || exit 1

# set the startup command
CMD ["python", "run_server.py"] 