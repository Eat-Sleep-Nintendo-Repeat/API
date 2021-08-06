docker build -t dustin/esnr-api:v1 . 
docker rm --force  ESNR-API-v1
docker run -d --restart always --name ESNR-API-v1 --network=web -p 7871:7869 dustin/esnr-api:v1
