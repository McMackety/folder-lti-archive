package dev

import (
	"context"
	"fmt"
	"log"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/s3"
)

var DevDynamoUrl = "http://dev-dynamo:8000"
var DevS3Url = "https://cdn.oconnorfolder.nathankutzan.info"
var DevSelfUrl = "https://oconnorfolder.nathankutzan.info"
var DevPdfUrl = "https://dev.pdf.oconnorfolder.nathankutzan.info"

var ProdDynamoUrl = "http://db:8000"
var ProdS3Url = "https://cdn.oconnorfolder.nathankutzan.info"
var ProdSelfUrl = "https://oconnorfolder.nathankutzan.info"
var ProdPdfUrl = "https://pdf.oconnorfolder.nathankutzan.info"

var DevEndpointResolver = aws.EndpointResolverFunc(func(service, region string) (aws.Endpoint, error) {
	if service == dynamodb.ServiceID {
		return aws.Endpoint{
			PartitionID:   "aws",
			URL:           DevDynamoUrl,
			SigningRegion: "us-east-2",
		}, nil
	}
	if service == s3.ServiceID {
		return aws.Endpoint{
			PartitionID:       "aws",
			URL:               DevS3Url,
			SigningRegion:     "us-east-2",
			HostnameImmutable: true,
		}, nil
	}
	return aws.Endpoint{}, fmt.Errorf("unknown endpoint requested")
})

var ProdEndpointResolver = aws.EndpointResolverFunc(func(service, region string) (aws.Endpoint, error) {
	if service == dynamodb.ServiceID {
		return aws.Endpoint{
			PartitionID:   "aws",
			URL:           ProdDynamoUrl,
			SigningRegion: "us-east-2",
		}, nil
	}
	if service == s3.ServiceID {
		return aws.Endpoint{
			PartitionID:       "aws",
			URL:               ProdS3Url,
			SigningRegion:     "us-east-2",
			HostnameImmutable: true,
		}, nil
	}
	return aws.Endpoint{}, fmt.Errorf("unknown endpoint requested")
})

func AWSConfig(isDev bool) aws.Config {
	var cfg aws.Config
	var err error
	if isDev {
		cfg, err = config.LoadDefaultConfig(context.Background(), config.WithEndpointResolver(DevEndpointResolver))
	} else {
		cfg, err = config.LoadDefaultConfig(context.Background(), config.WithEndpointResolver(ProdEndpointResolver))
	}

	if err != nil {
		fmt.Println(err)
		log.Fatalf("unable to load SDK config, %v", err)
	}
	return cfg
}
