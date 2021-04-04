Title: Pelican on Cloudflare - Generating a Python-based static blog with Cloudflare Pages
Date: 2021-04-04 11:10 PM
Category: Python
Status: published

## Problem

Deploy Pelican static site (Python-based static blog) to Cloudflare Pages

## Today I Learnt

[This blog](https://datadiaries.dev), built using Pelican (Python static site generator), used to be hosted on commons.host for free static site hosting. To my dismay, commons.host is no longer live and I needed a replacement static site hosting solution.

Since I am already using Cloudflare for HTTPS and DNS, I decided to give Cloudflare Pages (which is in beta at time of writing) a try.

### What is Cloudflare Pages?

[Cloudflare Pages](https://blog.cloudflare.com/cloudflare-pages/), released in December 2020, provides JAMstack hosting which allows you to run your site builds and deploy them on its network. To deploy a site to production, the general steps are:

1. Sign in with your Cloudflare account and go to Cloudflare Pages
2. Sign in with GitHub and select repositories/organizations that you'd like to connect to Cloudflare Pages
3. Select an existing GitHub repo that you would like to deploy on Cloudflare Pages
4. Set up your build configuration with your **project name**, **branch to deploy to production**, (for projects using static site generators or build tools) **build command**, **publish directory** and **environment variables**

While JAMstack is typically associated with static sites (which is my use-case), Cloudflare also offers a serverless platform called [Cloudflare Workers](https://workers.cloudflare.com/) which allows developers to write scalable backend code for their sites.

Cloudflare Pages support major static site generators such as Hugo, Jekyll and (most importantly for my case) Pelican.

### Deploying Pelican on Cloudflare Pages

For Pelican, the standard build command is:

::python

    pelican $content [-s settings.py]

and the build directory is `output`.

According to the [documentation for build configuration on Cloudflare Pages](https://developers.cloudflare.com/pages/platform/build-configuration), the default Python version included in the Cloudflare Workers environment is 2.7.

What if I want to use a different version? Support for Python 2.7 is already getting dropped, and I do want to use up-to-date packages and its related dependencies on my Pelican site build.

There are two options:

1. Specify `PYTHON_VERSION` in your build configuration
2. Set Python version and (sub-)dependencies in your source code (`runtime.txt` or `Pipfile`)

### Consistent site builds with Pipfile

To ensure **deterministic builds** for your Pelican site in case of updates to sub-dependencies, I prefer **using Pipenv** to generate `Pipfile`/`Pipfile.lock` for managing dependencies to deploy a reproducible Python environment in production.

Since I already have a `requirements.txt` file in my Pelican project, Pipenv automatically detects the `requirements.txt` file when running `pipenv install` on the local copy of my Pelican project and converts it into a `Pipfile`:

::

    requirements.txt found, instead of Pipfile! Converting…
    Warning: Your Pipfile now contains pinned versions, if your requirements.txt did.
    We recommend updating your Pipfile to specify the "*" version, instead.

### Build configurations for custom Python environments

While attempting to deploy my Pelican project on Cloudflare Pages, Cloudflare Pages was unable to detect Pelican when using the standard build command and I encountered the following in my system logs:

::

    WARNING: The scripts pelican, pelican-import, pelican-quickstart and pelican-themes are installed in '/opt/buildhome/.local/bin' which is not on PATH.

Since I am using a custom Python environment defined in a `Pipfile` instead of Cloudflare Workers' standard build environment to deploy my Pelican project, I updated my `PATH` environment variable with the directory for the installed packages in order to execute my build command using my custom Python environment:

::

    export PATH=/opt/buildhome/.local/bin && pelican $content -s publishconf.py

After a few hours of trial and error in debugging the build configuration, I successfully deployed my Pelican project (this blog) to production using Cloudflare Pages. It took less than a minute from committing changes to my repo to deploying the site to production - without paying a single cent!