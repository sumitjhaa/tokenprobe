FROM python:3.14-slim AS backend

WORKDIR /app

COPY pyproject.toml README.md ./
COPY tokenprobe/ tokenprobe/
COPY backend/ backend/

RUN pip install --no-cache-dir -e . && \
    pip install --no-cache-dir uvicorn

EXPOSE 8000

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
