# -*- mode: dockerfile; -*- vim: set ft=dockerfile:
FROM fdean/trip-server:1.6.1
LABEL uk.co.fdsd.tripweb.version="1.6.1"

#RUN cd /app && rm -rf app
USER root

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    ca-certificates \
    git \
    vim \
    zip

RUN apt-get install -y --no-install-recommends \
    locales \
    chromium chromium-l10n \
    firefox-esr-l10n-en-gb

ENV CHROME_BIN=/usr/bin/chromium

# https://bugs.debian.org/cgi-bin/bugreport.cgi?bug=863199#23
RUN mkdir -p /usr/share/man/man1
RUN apt-get install -y --no-install-recommends \
    openjdk-11-jre-headless \
    && rm -rf /var/lib/apt/lists/*

RUN sed -i -e 's/# en_GB.UTF-8 UTF-8/en_GB.UTF-8 UTF-8/' /etc/locale.gen \
    && locale-gen \
    && localedef -i en_GB -c -f UTF-8 -A /usr/share/locale/locale.alias en_GB.UTF-8 \
    && update-locale LANG=en_GB.UTF-8 LANGUAGE

ADD --chown=node:node . /webapp

WORKDIR /webapp

RUN rm -f config.json && touch config.json && chown node:node config.json && chmod 0640 config.json
RUN cd /app && rm -rf app && ln -s /webapp/app

USER node

RUN yarn

RUN yarn update-webdriver

WORKDIR /app
