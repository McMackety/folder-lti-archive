package db

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type SourcedIdMap struct {
	Uid           string
	ExternalLtiId string
	SourcedId     string
}

func GetSourcedId(uid string, externalLtiId string) (*string, error) {
	result, err := DynamoDatabase.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String("sourced_ids"),
		Key: map[string]types.AttributeValue{
			"Uid": &types.AttributeValueMemberS{
				Value: uid,
			},
			"ExternalLtiId": &types.AttributeValueMemberS{
				Value: externalLtiId,
			},
		},
	})

	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	if result.Item == nil {
		return nil, nil
	}

	var item SourcedIdMap
	err = attributevalue.UnmarshalMap(result.Item, &item)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &item.SourcedId, nil
}

func SetSourcedId(uid string, externalLtiId string, sourcedId string) error {
	item := SourcedIdMap{
		Uid:           uid,
		ExternalLtiId: externalLtiId,
		SourcedId:     sourcedId,
	}
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		fmt.Println(err)
		return err
	}

	_, err = DynamoDatabase.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String("sourced_ids"),
		Item:      av,
	})
	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}
