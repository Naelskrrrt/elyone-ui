#!/bin/bash
echo "Pulling the latest changes from the repository..."
git pull

echo "Installing dependencies..."
pnpm install

echo "Creating an optimized production build..."
pnpm run build

echo "Deploying the build to the server..."
scp -r dist/* root@137.74.220.203:/var/www/html/

echo "Send Modification to Github"
git add .
git commit -m "Deploy"
git push -u origin dev