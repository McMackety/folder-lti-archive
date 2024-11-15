package db

import (
	"context"
	"fmt"

	"github.com/McMackety/oconnor-backend/graph/model"
	"github.com/McMackety/oconnor-backend/id"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/expression"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/bwmarrin/snowflake"
)

func GetAssignment(id snowflake.ID) (*model.Assignment, error) {
	result, err := DynamoDatabase.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String("assignments"),
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
		assignment := model.Assignment{
			Fid:   item.Fid,
			Uid:   item.Uid,
			ID:    item.ID,
			Pages: pages,
			Name:  item.Name,
		}
		return &assignment, nil
	} else {
		return nil, nil
	}
}

func GetAssignmentFromFolderAndUser(fid snowflake.ID, uid string) (*model.Assignment, error) {
	var items []model.FatAssignment
	var lek map[string]types.AttributeValue
	for len(items) == 0 {
		filt1 := expression.Name("Fid").Equal(expression.Value(fid.String()))
		filt2 := expression.Name("Uid").Equal(expression.Value(uid))

		expr, err := expression.NewBuilder().WithFilter(filt1.And(filt2)).Build()
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
			IndexName:                 aws.String("UID-Index"),
			ExclusiveStartKey:         lek,
			ReturnConsumedCapacity:    types.ReturnConsumedCapacityTotal,
		}

		resp, err := DynamoDatabase.Scan(context.Background(), input)
		if err != nil {
			fmt.Println(err)
			fmt.Println(err.Error())
			return nil, err
		}

		var newItems []model.FatAssignment

		err = attributevalue.UnmarshalListOfMaps(resp.Items, &newItems)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}

		items = append(items, newItems...)

		if len(resp.LastEvaluatedKey) == 0 {
			break
		}
		lek = resp.LastEvaluatedKey
	}

	if len(items) == 0 {
		return CreateAssignment(fid, uid)
	}
	sf, err := snowflake.ParseString(items[0].ID)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	assignment, err := GetAssignment(sf)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return assignment, nil

}

func CreateAssignment(folderID snowflake.ID, userID string) (*model.Assignment, error) {
	folder, err := GetFolder(folderID)
	if err != nil {
		fmt.Println(err)
		fmt.Println(err.Error())
		return nil, err
	}
	item := model.Assignment{
		ID:    id.Generate().String(),
		Fid:   folderID.String(),
		Pages: folder.Pages,
		Uid:   userID,
		Name:  folder.Name,
	}
	av, err := attributevalue.MarshalMap(item)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	_, err = DynamoDatabase.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String("assignments"),
		Item:      av,
	})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return &item, nil
}

func UpdateAssignment(id snowflake.ID, listComponents []*model.ListComponentInput, outlineComponents []*model.OutlineComponentInput, pictureComponents []*model.PictureComponentInput, tableComponents []*model.TableComponentInput) (outAssignment *model.Assignment, err error) {
	assignment, err := GetAssignment(id)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	for _, page := range assignment.Pages {
		for eci, existingComponent := range page.Components {
			for _, listComponentInput := range listComponents {
				if existingComponent.GetID() == listComponentInput.ID {
					ec := existingComponent.(model.ListComponent)
					for _, exli := range ec.ListItems {
						for _, liin := range listComponentInput.ListItems {
							if exli.ID == liin.ID {
								exli.Response = &liin.Response
							}
						}
					}
					page.Components[eci] = ec
				}
			}

			for _, outlineComponentInput := range outlineComponents {
				if existingComponent.GetID() == outlineComponentInput.ID {
					ec := existingComponent.(model.OutlineComponent)
					var traverseExisting func(child *model.OutlineChild)
					traverseExisting = func(child *model.OutlineChild) {
						for _, v := range outlineComponentInput.Responses {
							if child.ID == v.ID {
								child.Response = &v.Response
							}
						}
						for _, v := range child.Children {
							traverseExisting(v)
						}
					}
					for _, v := range ec.Children {
						traverseExisting(v)
					}
					page.Components[eci] = ec
				}
			}

			for _, tableComponentInput := range tableComponents {
				if existingComponent.GetID() == tableComponentInput.ID {
					ec := existingComponent.(model.TableComponent)
					ec.Cells = make([]*model.TableCell, 0)
					for _, v := range tableComponentInput.Cells {
						ec.Cells = append(ec.Cells, &model.TableCell{
							Row:      v.Row,
							Column:   v.Column,
							Response: v.Response,
						})
					}
					page.Components[eci] = ec
				}
			}

			for _, pictureComponentInput := range pictureComponents {
				if existingComponent.GetID() == pictureComponentInput.ID {
					ec := existingComponent.(model.PictureComponent)
					for _, expic := range ec.Pictures {
						for _, picin := range pictureComponentInput.Pictures {
							if expic.ID == picin.ID {
								expic.PictureResponseURL = picin.PictureResponseURL
								expic.TextResponse = picin.TextResponse
							}
						}
					}
					page.Components[eci] = ec
				}
			}
		}
	}

	av, err := attributevalue.MarshalMap(assignment)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	_, err = DynamoDatabase.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String("assignments"),
		Item:      av,
	})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return assignment, nil
}
