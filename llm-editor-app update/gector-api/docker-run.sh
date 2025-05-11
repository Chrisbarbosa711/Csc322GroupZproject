#!/bin/bash

# check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "error: Docker is not installed. Please install Docker first: https://docs.docker.com/get-docker/"
    exit 1
fi

# check if curl is installed
if ! command -v curl &> /dev/null; then
    echo "warning: curl is not installed. health check may not run in the container"
fi

echo "=== start building the GECToR grammar correction API Docker image ==="

# clean the old log directory
mkdir -p logs

# build the Docker image
echo "building the Docker image..."
docker build -t gector-api:latest .

# check the build result
if [ $? -ne 0 ]; then
    echo "error: failed to build the Docker image"
    exit 1
fi

echo "Docker image built successfully!"

# run the container
echo "starting the GECToR API container..."
docker run -d \
    --name gector-api \
    -p 7860:7860 \
    -v "$(pwd)/data:/app/data" \
    -v "$(pwd)/logs:/app/logs" \
    --restart unless-stopped \
    gector-api:latest

# check the run result
if [ $? -ne 0 ]; then
    echo "error: failed to start the container"
    exit 1
fi

echo "container started successfully!"
echo "API service is running at: http://localhost:7860"
echo ""
echo "you can use the following command to view the logs:"
echo "docker logs -f gector-api"
echo ""
echo "stop the container:"
echo "docker stop gector-api"
echo ""
echo "restart the container:"
echo "docker start gector-api"
echo ""
echo "remove the container:"
echo "docker rm -f gector-api" 