FROM node:18-alpine

# Install Python and build dependencies for ChromaDB
RUN apk add --no-cache python3 py3-pip py3-venv build-base

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install Node.js dependencies
RUN npm ci --only=production

# Create Python virtual environment and install ChromaDB
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install --upgrade pip
RUN pip install chromadb

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p uploads logs chroma-data

# Expose ports (3000 for backend, 8000 for ChromaDB)
EXPOSE 3000 8000

# Create startup script that activates venv
RUN echo '#!/bin/sh' > start.sh && \
    echo 'export PATH="/opt/venv/bin:$PATH"' >> start.sh && \
    echo 'echo "Starting ChromaDB..."' >> start.sh && \
    echo 'chroma run --host 0.0.0.0 --port 8000 --path /app/chroma-data &' >> start.sh && \
    echo 'echo "Waiting for ChromaDB to start..."' >> start.sh && \
    echo 'sleep 10' >> start.sh && \
    echo 'echo "Starting Node.js backend..."' >> start.sh && \
    echo 'npm start' >> start.sh && \
    chmod +x start.sh

# Set PATH for runtime
ENV PATH="/opt/venv/bin:$PATH"

# Start both services
CMD ["./start.sh"]