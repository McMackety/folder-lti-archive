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

func ListFolders() ([]*model.Folder, error) {
	result, err := DynamoDatabase.Scan(context.Background(), &dynamodb.ScanInput{
		TableName: aws.String("folders"),
	})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	var folders []*model.Folder

	for _, rawItem := range result.Items {
		var item model.FatFolder
		err := attributevalue.UnmarshalMap(rawItem, &item)
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
		folder := model.Folder{
			Fid:   item.Fid,
			Pages: pages,
			Name:  item.Name,
		}
		folders = append(folders, &folder)
	}
	return folders, nil
}

func GetFolder(fid snowflake.ID) (*model.Folder, error) {
	result, err := DynamoDatabase.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String("folders"),
		Key: map[string]types.AttributeValue{
			"Fid": &types.AttributeValueMemberS{
				Value: fid.String(),
			},
		},
	})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	if result.Item != nil {
		var item model.FatFolder
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
		folder := model.Folder{
			Fid:   item.Fid,
			Pages: pages,
			Name:  item.Name,
		}
		return &folder, nil
	} else {
		return nil, nil
	}
}

func CreateFolder(pages []*model.Page, name string) error {
	item := model.Folder{
		Fid:   id.Generate().String(),
		Pages: pages,
		Name:  name,
	}
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		fmt.Println(err)
		return err
	}

	_, err = DynamoDatabase.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String("folders"),
		Item:      av,
	})
	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}

func UpdateFolder(id snowflake.ID, pages []*model.Page) error {
	item := Component{
		ID: id.String(),
	}
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		fmt.Println(err)
		return err
	}

	pgav, err := attributevalue.Marshal(pages)
	if err != nil {
		fmt.Println(err)
		return err
	}

	_, err = DynamoDatabase.UpdateItem(context.Background(), &dynamodb.UpdateItemInput{
		TableName: aws.String("components"),
		Key:       av,
		AttributeUpdates: map[string]types.AttributeValueUpdate{
			"Pages": {
				Action: types.AttributeActionPut,
				Value:  pgav,
			},
		},
	})
	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}
