FROM golang:1.20-alpine
WORKDIR /usr/src/rec
COPY  ./ ./
RUN mkdir inputdata
RUN go get .
RUN go build .
EXPOSE 8080