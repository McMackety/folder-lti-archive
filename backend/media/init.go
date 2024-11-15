package media

import (
	"github.com/aws/aws-sdk-go-v2/service/s3"

	"github.com/McMackety/oconnor-backend/dev"
)

var S3 *s3.Client
var isDev bool

func Init(isDevL bool) {
	isDev = isDevL
	config := dev.AWSConfig(isDev)
	S3 = s3.NewFromConfig(config)
}
