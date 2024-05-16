FROM python:3.12.3-bookworm
RUN python -m pip install --upgrade pip

WORKDIR /app
COPY requirements.txt .
RUN mkdir output
RUN python -m pip install -r requirements.txt

COPY . .
