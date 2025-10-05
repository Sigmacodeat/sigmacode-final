#!/bin/bash

# Scannt das Killbill-Image mit Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image --exit-code 1 --no-progress killbill/killbill

# Optional: Andere Images scannen
# docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 1 --no-progress <image-name>
