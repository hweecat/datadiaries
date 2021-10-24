Title: Running Python 3.10 and Jupyter Notebook on a Docker container
Date: 2021-10-24 11:30 PM
Category: Python
Status: published

## Problem

Run Python 3.10 code on Jupyter Notebook in a reproducible Docker container environment

## Today I Learnt

At the time of writing, there is no Jupyter Docker stack that officially supports Python 3.10 - considering that Python 3.10 was officially released on 4th October 2021.

I checked the image tags for `jupyter/base-notebook` Docker image and confirmed that [there is no image tag associated with Python 3.10 yet](https://hub.docker.com/r/jupyter/base-notebook/tags/), before deciding on building my own Jupyter Docker stack for Python 3.10.

## Objective

Why do I need to run Python 3.10 and Jupyter Notebook in Docker - and why now?

My objective is to create a reproducible Python environment that allows users to explore structural pattern matching - a new feature of Python 3.10.

As I would also like to include code snippets that are intended to throw exceptions to highlight the concept of immutable data structures, an interactive notebook interface such as Jupyter Notebook / JupyterLab is suitable for the purpose of such explorations.

## Creating the Docker container

Since there is no official Jupyter Docker image for Python 3.10, I started with the official Python 3.10 Docker image as the base image (specifically the `python:3.10-slim-buster` image).

::Dockerfile

    FROM python:3.10-slim-buster

Next, I created a `requirements.txt` file to include the Python packages needed to run the Jupyter Notebook file and added instructions in the Dockerfile to `COPY` and install the dependencies:

::requirements.txt

    Faker==9.5.2
    ipykernel==6.4.2
    jupyter==1.0.0
    mypy==0.910
    numpy==1.21.3
    pandas==1.3.4

::Dockerfile

    # Install dependencies
    COPY requirements.txt requirements.txt
    RUN pip3 install -r requirements.txt

After adding the commands to set working directory and start a Jupyter instance, my Dockerfile looked something like this:

::Dockerfile

    # syntax=docker/dockerfile:1

    FROM python:3.10-slim-buster

    WORKDIR .

    # Install dependencies
    COPY requirements.txt requirements.txt
    RUN pip3 install -r requirements.txt

    COPY . .

    ENTRYPOINT ["python3", "-m"]
    CMD ["jupyter", "lab", "--port=8888", "--no-browser", "--ip=0.0.0.0", "--allow-root"]   

While trying to set up the Dockerfile to work with Binder, I noticed the following requirement:

    It must set up a user whose uid is {}1000. It is bad practice to run processes in containers as root, and on binder we do not allow root container processes.

Wait, am I running the command as root in the container?

Based on these requirements, I modified my Dockerfile to set up a non-root user and change permissions in order to run the container as a non-root user:

::Dockerfile

    # syntax=docker/dockerfile:1

    FROM python:3.10-slim-buster

    # Set non-root user for binder
    ARG NB_USER=jovyan
    ARG NB_UID=1000
    ENV USER ${NB_USER}
    ENV NB_UID ${NB_UID}
    ENV HOME /home/${NB_USER}

    RUN adduser --disabled-password \
        --gecos "Default user" \
        --uid ${NB_UID} \
        ${NB_USER}

    # Set working directory
    WORKDIR ${HOME}

    # Install dependencies
    COPY requirements.txt requirements.txt
    RUN pip3 install -r requirements.txt

    # Make sure the contents of our repo are in ${HOME}
    COPY . ${HOME}
    USER root
    RUN chown -R ${NB_UID} ${HOME}
    USER ${NB_USER}

    ENTRYPOINT ["python3", "-m"]
    CMD ["jupyter", "lab", "--port=8888", "--no-browser", "--ip=0.0.0.0"]


While the Binder is currently not working due to dependency issues, we can use the Dockerfile to build the image and run Python 3.10 and Jupyter Notebook/Lab on a containerized environment - anywhere.

## Referencees

- [Use a Dockerfile for your Binder repository](https://mybinder.readthedocs.io/en/latest/tutorials/dockerfile.html)