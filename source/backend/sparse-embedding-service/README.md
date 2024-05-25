# Dense embedding service

The service embeds the query contained in the post JSON body into a sparse embedding.

## Model used

- We are using the [naver/splade-v3](https://huggingface.co/naver/splade-v3).
- The repository is a gated.
    - It requires a user to log in and accept terms and conditions.
    - After that, the user generates a [access token](https://huggingface.co/docs/hub/security-tokens) from the HugginFace: Settings -> Access Tokens 
    - Or there are other ways.
- The embedding service creates two lists:
    - `indices` contains indices of the values.
    - `values` contains values for the `indices`.
- The computation is done using `torch` and `transformers` python library.
 
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

## Running

It is preferable to use Python virtual enviroment.

    $> python -m venv venv

Then you can activate the enviroment.

    $> source venv/bin/activate

Installing requirements.

    $> python -m pip install fastapi orjson torch transformers

We are not using requirements.

### Environments

The application expects two environment variables:
    - `NUM_THREADS` - a number of threads to be used by the pytorch library.
    - `ACCESS_TOKEN` - an HugginFace access token for the gated `naver/splade-v3` model.

### Running in development mode

- Using the `fastapi-cli`.

        $> env HUGGIN_FACE_TOKEN="your_access_token" fastapi dev ./app/main.py

- Using the `uvicorn` server.
    - It is the prefered way, since you can set up the port and run other services as well.
    - Otherwise, it would default to the FastAPI defaults mentioned above.
    - Assuming you are in the `/app` folder.

            $> uvicorn main:app --host 0.0.0.0 --port 8200

- Setting up environments:
    - Create `.env` file in the root forlder.
    - Entry the enviroments.
    - Note that the environments will be all strings.

### Containerizing and production

- The service has enclosed `Dockerfile` based on the FastAPI documentation.
- If the container is run with `docker run` it runs the `fastapi run app/main.py --port 8200` command.
    - Essentially running on port `8200`
- Based on the Wdoi services architecture, it is assumed that it will run with the defined external bridge network attached.
- Eventually, if adding into a Docker compose, using the `command` overrides the `Dockerfile` command.
    - Meaning you can set up ports in there.
- Do not forget to set up the HugginFace access token as an environment variables.
- And do not forget to add docker bridge `--network your_network`
    - In the set of the wdoi backend, you do not want to expose the ports.
    - The services will communicate via the internal bridge network, so the `docker run` or `docker compose` should not contain the exposition of ports.

> Example of running separately:

    $> docker build -t your_image_name .

    $> docker run --rm --network your_bridge_name -e ACCESS_TOKEN="your_access_token" -e NUM_THREADS="2" --name your_container_name your_image_name 

