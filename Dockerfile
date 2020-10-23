FROM registry.cerebralfix.com/cerebralfix/nginx-resolve:latest

COPY build/ $WWWROOT
