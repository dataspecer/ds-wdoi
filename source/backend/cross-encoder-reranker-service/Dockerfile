FROM python:3.12.3-bookworm

WORKDIR /code

RUN pip install --no-cache-dir --upgrade fastapi orjson sentence-transformers

COPY ./app /code/app

CMD ["fastapi", "run", "app/main.py", "--port", "8003"]