package db

import (
	"github.com/McMackety/oconnor-backend/dev"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
)

var DynamoDatabase *dynamodb.Client

func Init(isDev bool) {
	config := dev.AWSConfig(isDev)
	DynamoDatabase = dynamodb.NewFromConfig(config)
}
