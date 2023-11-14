FROM eclipse-mosquitto:2.0.18

WORKDIR /mosquitto

COPY mosquitto.conf /mosquitto/config/

COPY pwfile /mosquitto/config/pwfile/
COPY certificates/ca /mosquitto/certificates/
COPY log /mosquitto/log/

EXPOSE 1883
EXPOSE 8883

CMD ["/usr/sbin/mosquitto", "-c", "/mosquitto/config/mosquitto.conf"]