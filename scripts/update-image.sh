#!/bin/bash

set -e

IMAGE="vivek200420/node-cicd-app"
TAG="${BUILD_NUMBER}"

echo "Updating image to ${IMAGE}:${TAG}"

sed -i "s|image: .*|image: ${IMAGE}:${TAG}|" deployment.yaml

git config user.name "jenkins"
git config user.email "jenkins@local"

git add deployment.yaml

git commit -m "Update Node.js image to ${TAG}" || true

git push origin main