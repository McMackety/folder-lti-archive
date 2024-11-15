package db

import (
	"context"
	"fmt"

	"github.com/McMackety/oconnor-backend/graph/model"
	"github.com/McMackety/oconnor-backend/id"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/bwmarrin/snowflake"
)

func CreateSubmission(assignmentID snowflake.ID) (*model.Submission, error) {
	assignment, err := GetAssignment(assignmentID)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	item := model.Submission{
		Fid:   assignment.Fid,
		ID:    id.Generate().String(),
		Uid:   assignment.Uid,
		Pages: assignment.Pages,
		Name:  assignment.Name,
	}

	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	_, err = DynamoDatabase.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String("submissions"),
		Item:      av,
	})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &item, nil
}

func GetSubmission(id snowflake.ID) (*model.Submission, error) {
	result, err := DynamoDatabase.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String("submissions"),
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
		var item model.FatAssignment
		err := attributevalue.UnmarshalMap(result.Item, &item)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}

		pages := make([]*model.Page, 0)
		for _, fp := range item.Pages {
			components := make([]model.FolderComponent, 0)
			for _, fc := range fp.Components {
				if fc.Children != nil {
					components = append(components, model.OutlineComponent{
						ID:       fc.ID,
						Title:    fc.Title,
						Children: fc.Children,
					})
				} else if fc.Pictures != nil {
					components = append(components, model.PictureComponent{
						ID:       fc.ID,
						Title:    fc.Title,
						Pictures: fc.Pictures,
					})
				} else if fc.ListItems != nil {
					components = append(components, model.ListComponent{
						ID:        fc.ID,
						Title:     fc.Title,
						ListItems: fc.ListItems,
					})
				} else if fc.Rows != nil {
					components = append(components, model.TableComponent{
						ID:      fc.ID,
						Title:   fc.Title,
						Rows:    fc.Rows,
						Columns: fc.Columns,
						Cells:   fc.Cells,
					})
				}
			}
			pages = append(pages, &model.Page{
				ID:         fp.ID,
				Components: components,
			})
		}
		submission := model.Submission{
			Fid:   item.Fid,
			Uid:   item.Uid,
			ID:    item.ID,
			Pages: pages,
			Name:  item.Name,
		}
		return &submission, nil
	} else {
		return nil, nil
	}
}
