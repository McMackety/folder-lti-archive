FROM golang:1.16.0-alpine3.13
WORKDIR /server
EXPOSE 8080

ADD . .
RUN go build -o server
RUN chmod +x ./server
ENTRYPOINT [ "./server" ]