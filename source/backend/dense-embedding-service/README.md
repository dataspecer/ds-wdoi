# Dense embedding service

The service embeds the query contained in the post JSON body into a dense embedding.

## Model used

- We are using the [mixedbread-ai/mxbai-embed-large-v1](https://huggingface.co/mixedbread-ai/mxbai-embed-large-v1).
- Sentence-Transformers for the embedding library.
- The maximum length of the model is 512 tokens.

## Server

- The server abstractions are provided by the [FastAPI](https://fastapi.tiangolo.com/) for Python.
- Serialization is done using `orjson` for faster `numpy` array serialization. 
- It contains two routes with `cors` set up.
    - `POST` to route `/embed`
    - `GET` to route `/docs` to obtain the OpenAPI specification. It is generated at start up.
- Hosts:
    - Defaults to `0.0.0.0`.
- Ports:
    - Defaults to `8000`.
    - But we assume the service runs on `8100` port, and will use it across the system.

## Running

It is preferable to use Python virtual enviroment.

    $> python -m venv venv

Then you can activate the enviroment.

    $> source venv/bin/activate

Installing requirements.

    $> python -m pip install fastapi orjson sentence-transformers

We are not using requirements.

### Environments

The application expects a one environment variable:
    - `NUM_THREADS` - a number of threads to be used by the `pytorch` library.

### Running in development mode

- Using the `fastapi-cli`.

        $> fastapi dev ./app/main.py --port 8100

- Using the `uvicorn` server.
    - Assuming you are in the `/app` folder.

            $> uvicorn main:app --host 0.0.0.0 --port 8100

- Setting up environments:
    - Create `.env` file in the root folder.
    - Entry the enviroments.
    - Note that the environments will be all strings.

### Containerization and running in production

- The service has enclosed `Dockerfile` based on the FastAPI documentation.
- If the container is run with `docker run` it runs the `fastapi run app/main.py --port 8100` command.
    - Essentially running on port `8100`
- Eventually, if adding into a Docker compose, using the `command` overrides the `Dockerfile` command.
    - Meaning you can set up ports in there.
- Based on the Wdoi services architecture, the service is not ment to be published to the outside, so you can choose if you want to publish ports (`-p` option).
- When running separately, you will want to connect the service to the rest of the application. To do that, create a docker bridge that will connect the services. The services are then available by their container names as hosts names.

> Example of running separately:

    $> docker build -t your_image_name .

    $> docker run --rm --network your_bridge -e NUM_THREADS="4" --name your_container_name your_image_name 

