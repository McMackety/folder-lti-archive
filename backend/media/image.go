package media

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"

	"github.com/McMackety/oconnor-backend/dev"
	"github.com/McMackety/oconnor-backend/id"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/vincent-petithory/dataurl"
)

func UploadImage(userID string, originalFileName string, imageReader io.Reader, contentType string) (string, error) {
	bucket := "data"

	path := "media/" + userID + "/" + id.Generate().String() + "/" + originalFileName
	params := &s3.PutObjectInput{
		Bucket:      aws.String(bucket),
		Key:         aws.String(path),
		Body:        imageReader,
		ContentType: aws.String(contentType),
	}

	_, err := S3.PutObject(context.Background(), params)
	if err != nil {
		fmt.Println(err)
		return "", err
	}

	var url string
	if isDev {
		url = dev.DevS3Url + "/" + bucket + "/" + path
	} else {
		url = dev.ProdS3Url + "/" + bucket + "/" + path
	}
	return url, nil
}

func UploadImageB64(userID string, originalFileName string, b64data string) (string, error) {
	dataURL, err := dataurl.DecodeString(b64data)
	if err != nil {
		fmt.Println(err)
		return "", errors.New("Invalid data url")
	}
	if len(dataURL.Data) > 5000000 {
		return "", errors.New("File is larger than 5MB")
	}
	return UploadImage(userID, originalFileName, bytes.NewReader(dataURL.Data), dataURL.ContentType())
}
