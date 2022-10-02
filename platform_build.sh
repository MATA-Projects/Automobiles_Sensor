#! /bin/sh

echo "Creating Detector Docker Image...";
cd detector && docker build . -t detector:latest && cd ..;

echo "\n++++++++++++++++++++++++++++\n";

echo "Creating Visualizer Docker Image...";
cd visualizer && docker build . -t visualizer:latest && cd ..;

echo "\n++++++++++++++++++++++++++++\n";

echo "Starting the Project...";
docker-compose up -d;
echo "Both Containers Started and Can be Accessed by their link  \"http://localhost:<port>\"";