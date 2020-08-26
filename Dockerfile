FROM node:alpine
MAINTAINER Michael Ruettgers <michael@ruettgers.eu>

ENV HOME /opt/vallox-mqtt-bridge

ENV CONFIG /config/vallox-mqtt-bridge.yml

COPY ./src/* $HOME/

WORKDIR $HOME

RUN npm install

CMD node index.js $CONFIG
