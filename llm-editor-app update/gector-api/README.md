# GECToR Grammar Correction API

This is a grammar correction API service based on [gotutiyan/gector](https://github.com/gotutiyan/gector) implementation, capable of detecting and correcting grammatical and spelling errors in text. The API is built using the FastAPI framework and can be easily deployed and used through Docker.

## Implementation Overview

This project is an API wrapper for the [GECToR model](https://aclanthology.org/2020.bea-1.16.pdf), using [gotutiyan/gector](https://github.com/gotutiyan/gector) as the underlying model implementation. The model is a sequence labeling-based grammatical error correction model developed by the Grammarly research team.

Pretrained model: `gotutiyan/gector-roberta-base-5k`

## Quick Start

### Using Docker (Recommended)

Simply run the following commands to start the service:

```bash
# Add execution permissions (if needed)
chmod +x docker-run.sh

# Run the Docker automation script
./docker-run.sh
```

The script will automatically build the Docker image and start the container. The service will be available at http://localhost:7860.

### Checking Service Status

```bash
# Check if the container is running properly
docker ps | grep gector-api

# View logs
docker logs -f gector-api
```

## Using the API

### API Endpoints

Once the service is started, the API will provide the following endpoints at http://localhost:7860:

- `GET /` - Check if the API is running properly
- `POST /correct` - Text correction service

### Text Correction Examples

**Using curl:**

```bash
curl -X POST "http://localhost:7860/correct" \
     -H "Content-Type: application/json" \
     -d '{"text": "This are a wrong sentences"}'
```

**Using JavaScript:**

```javascript
fetch('http://localhost:7860/correct', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ text: "This are a wrong sentences" }),
})
.then(response => response.json())
.then(data => console.log(data));
```

### API Response Format

```json
{
  "corrections": [
    {
      "id": 1,
      "type": "grammar",
      "original": "are",
      "corrected": "is",
      "startIndex": 5,
      "endIndex": 8,
      "message": "Suggested correction: 'are' → 'is'"
    },
    {
      "id": 2,
      "type": "grammar",
      "original": "sentences",
      "corrected": "sentence",
      "startIndex": 17,
      "endIndex": 26,
      "message": "Suggested correction: 'sentences' → 'sentence'"
    }
  ],
  "corrected": "This is a wrong sentence",
  "original": "This are a wrong sentences",
  "processing_time": "0.45s"
}
```

## Docker Management Commands

```bash
# Stop the container
docker stop gector-api

# Restart the container
docker start gector-api

# View logs
docker logs -f gector-api

# Remove the container
docker rm -f gector-api
```

## Advanced Configuration

### Using Docker Compose

If you need more control, you can use Docker Compose:

```bash
# Start the service
docker-compose up -d

# View logs
docker-compose logs -f

# Stop the service
docker-compose down
```

### Port Modification

If port 7860 is occupied, you can modify the port mapping:

```bash
docker run -d --name gector-api -p 8000:7860 gector-api
```

The service will be available at http://localhost:8000.

## Troubleshooting

### Common Issues

1. **Docker Build Failure**
   - Ensure network connection is normal for downloading the model
   - Check if there is sufficient disk space

2. **API Not Responding**
   - Check container status: `docker ps -a`
   - View logs: `docker logs gector-api`

## Citation

If you use this API in your research or project, please cite the original GECToR paper and implementation:

```bibtex
@inproceedings{omelianchuk-etal-2020-gector,
    title = "{GECT}o{R} {--} Grammatical Error Correction: Tag, Not Rewrite",
    author = "Omelianchuk, Kostiantyn  and
      Atrasevych, Vitaliy  and
      Chernodub, Artem  and
      Skurzhanskyi, Oleksandr",
    booktitle = "Proceedings of the Fifteenth Workshop on Innovative Use of NLP for Building Educational Applications",
    month = jul,
    year = "2020",
    address = "Seattle, WA, USA → Online",
    publisher = "Association for Computational Linguistics",
    url = "https://aclanthology.org/2020.bea-1.16",
    doi = "10.18653/v1/2020.bea-1.16",
    pages = "163--170"
}
```

Project implementation: [gotutiyan/gector](https://github.com/gotutiyan/gector)