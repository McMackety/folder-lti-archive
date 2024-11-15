package db

import (
	"context"
	"fmt"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/bwmarrin/snowflake"
)

type AssignmentToFolder struct {
	AID string
	FID string
}

func GetAssignmentToFolder(aid string) (*AssignmentToFolder, error) {
	result, err := DynamoDatabase.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String("assignment_to_folder"),
		Key: map[string]types.AttributeValue{
			"AID": &types.AttributeValueMemberS{
				Value: aid,
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

	var item AssignmentToFolder
	err = attributevalue.UnmarshalMap(result.Item, &item)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &item, nil
}

func SetAssignmentToFolder(aid string, fid snowflake.ID) error {
	item := AssignmentToFolder{
		AID: aid,
		FID: fid.String(),
	}
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		fmt.Println(err)
		return err
	}

	_, err = DynamoDatabase.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String("assignment_to_folder"),
		Item:      av,
	})
	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}
