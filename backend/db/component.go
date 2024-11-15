package db

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/McMackety/oconnor-backend/id"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/bwmarrin/snowflake"
)

type Component struct {
	ID        string
	IsResult  bool
	Type      ComponentType
	PageID    string
	Component json.RawMessage
}

type ComponentType string

const (
	ListComponent    ComponentType = "list"
	OutlineComponent ComponentType = "outline"
	PictureComponent ComponentType = "picture"
	TableComponent   ComponentType = "table"
)

func GetComponent(id snowflake.ID) (*Component, error) {
	result, err := DynamoDatabase.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String("components"),
		Key: map[string]types.AttributeValue{
			"ID": &types.AttributeValueMemberS{
				Value: id.String(),
			},
		},
	})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	if result.Item != nil {
		var item Component
		err := attributevalue.UnmarshalMap(result.Item, &item)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
		return &item, nil
	} else {
		return nil, nil
	}
}

func GetComponentByPageId(pageID snowflake.ID) (*Component, error) {
	filt1 := expression.Name("PageID").Equal(expression.Value(pageID.String()))
	expr, err := expression.NewBuilder().WithFilter(filt1).Build()
	if err != nil {
		fmt.Println(err)
		fmt.Println("Got error building expression:")
		fmt.Println(err.Error())
		return nil, err
	}

	input := &dynamodb.ScanInput{
		ExpressionAttributeNames:  expr.Names(),
		ExpressionAttributeValues: expr.Values(),
		FilterExpression:          expr.Filter(),
		ProjectionExpression:      expr.Projection(),
		TableName:                 aws.String("assignments"),
	}

	resp, err := DynamoDatabase.Scan(context.Background(), input)
	if err != nil {
		fmt.Println(err)
		fmt.Println(err.Error())
		return nil, err
	}
	items := []Component{}
	err = attributevalue.UnmarshalListOfMaps(resp.Items, &items)
	if err != nil {
		fmt.Println(err)
		fmt.Println(err.Error())
		return nil, err
	}

	if len(items) > 0 {
		return &items[0], nil
	} else {
		return nil, nil
	}
}

func CreateComponent(isResult bool, componentType ComponentType, pageID string, component json.RawMessage) error {
	item := Component{
		ID:        id.Generate().String(),
		IsResult:  isResult,
		Type:      componentType,
		PageID:    pageID,
		Component: component,
	}
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		fmt.Println(err)
		return err
	}

	_, err = DynamoDatabase.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String("components"),
		Item:      av,
	})
	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}

func UpdateComponent(id snowflake.ID, isResult bool, component json.RawMessage) error {
	item := Component{
		ID: id.String(),
	}
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		fmt.Println(err)
		return err
	}

	_, err = DynamoDatabase.UpdateItem(context.Background(), &dynamodb.UpdateItemInput{
		TableName: aws.String("components"),
		Key:       av,
		AttributeUpdates: map[string]types.AttributeValueUpdate{
			"IsResult": {
				Action: types.AttributeActionPut,
				Value: &types.AttributeValueMemberBOOL{
					Value: isResult,
				},
			},
			"Component": {
				Action: types.AttributeActionPut,
				Value: &types.AttributeValueMemberB{
					Value: component,
				},
			},
		},
	})
	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}
