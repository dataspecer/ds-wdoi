# Cross-encoder reranker

The service, given a query and a list of sentences, returns a list of scores with the linked sentence ids.

## Model used

- We are using the [mixedbread-ai/mxbai-rerank-base-v1](https://huggingface.co/mixedbread-ai/mxbai-rerank-base-v1).
- Sentence-Transformers for the Cross-encoder library.
- It provides a reasonable performance with speed.
- Their large cross encoder is great, but takes a lot of time on four threads.

## Server

- The server abstractions are provided by the [FastAPI](https://fastapi.tiangolo.com/) for Python.
- Serialization is done using `orjson` for faster `numpy` array serialization. 
- It contains two routes with `cors` set up.
    - `POST` to route `/rerank`
    - `GET` to route `/docs` to obtain the OpenAPI specification. It is generated at start up.
- Hosts:
    - Defaults to `0.0.0.0`.
- Ports:
    - Defaults to `8000`.

## Running

It is preferable to use Python virtual enviroment.

    $> python -m venv venv

Then you can activate the enviroment.

    $> source venv/bin/activate

Installing requirements.

    $> python -m pip install fastapi orjson sentence-transformers

We are not using requirements.

### Environments

The application expects two environment variables:
    - `NUM_THREADS` - a number of threads to be used by the pytorch library.

### Running in development mode

- Using the `fastapi-cli`.

        $> fastapi dev ./app/main.py

- Using the `uvicorn` server.
    - It is the prefered way, since you can set up the port and run other services as well.
    - Otherwise, it would default to the FastAPI defaults mentioned above.
    - Assuming you are in the `/app` folder.

            $> uvicorn main:app --host 0.0.0.0 --port 8300

- Setting up environments:
    - Create `.env` file in the root forlder.
    - Entry the enviroments.
    - Note that the environments will be all strings.

### Containerizing and production

- The service has enclosed `Dockerfile` based on the FastAPI documentation.
- If the container is run with `docker run` it runs the `fastapi run app/main.py --port 8300` command.
    - Essentially running on port `8300`
- Based on the Wdoi services architecture, it is assumed that it will run with the defined external bridge network attached.
- Eventually, if adding into a Docker compose, using the `command` overrides the `Dockerfile` command.
    - Meaning you can set up ports in there.
- Do not forget to set up the HugginFace access token as an environment variables.
- And do not forget to add docker bridge `--network your_network`
    - In the set of the wdoi backend, you do not want to expose the ports.
    - The services will communicate via the internal bridge network, so the `docker run` or `docker compose` should not contain the exposition of ports.

> Example of running separately:

    $> docker build -t your_image_name .

    $> docker run --rm --network your_bridge_name -e NUM_THREADS="4" --name your_container_name your_image_name 
