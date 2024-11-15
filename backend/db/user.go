package db

import (
	"context"
	"fmt"
	"math/rand"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
)

type User struct {
	OID             string
	Name            string
	Token           string
	TokenExpiryTime int64
	Role            string
	Email           string
	CallbackURL     string
}

func GetUser(OID string) (*User, error) {
	result, err := DynamoDatabase.GetItem(context.Background(), &dynamodb.GetItemInput{
		TableName: aws.String("users"),
		Key: map[string]types.AttributeValue{
			"OID": &types.AttributeValueMemberS{
				Value: OID,
			},
		},
	})
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	if result.Item != nil {
		var user User
		err := attributevalue.UnmarshalMap(result.Item, &user)
		if err != nil {
			fmt.Println(err)
			return nil, err
		}
		return &user, nil
	} else {
		return nil, nil
	}
}

func CreateUser(user *User) error {
	av, err := attributevalue.MarshalMap(user)
	if err != nil {
		fmt.Println(err)
		return err
	}

	_, err = DynamoDatabase.PutItem(context.Background(), &dynamodb.PutItemInput{
		TableName: aws.String("users"),
		Item:      av,
	})
	if err != nil {
		fmt.Println(err)
		return err
	}
	return nil
}

func UpdateUserToken(OID, token string, expiryTime time.Time, role, email, callbackURL string) error {
	_, err := DynamoDatabase.UpdateItem(context.Background(), &dynamodb.UpdateItemInput{
		TableName: aws.String("users"),
		Key: map[string]types.AttributeValue{
			"OID": &types.AttributeValueMemberS{
				Value: OID,
			},
		},
		AttributeUpdates: map[string]types.AttributeValueUpdate{
			"Token": {
				Action: types.AttributeActionPut,
				Value: &types.AttributeValueMemberS{
					Value: token,
				},
			},
			"TokenExpiryTime": {
				Action: types.AttributeActionPut,
				Value: &types.AttributeValueMemberN{
					Value: fmt.Sprint(expiryTime.Unix()),
				},
			},
			"Role": {
				Action: types.AttributeActionPut,
				Value: &types.AttributeValueMemberS{
					Value: role,
				},
			},
			"Email": {
				Action: types.AttributeActionPut,
				Value: &types.AttributeValueMemberS{
					Value: email,
				},
			},
			"CallbackURL": {
				Action: types.AttributeActionPut,
				Value: &types.AttributeValueMemberS{
					Value: callbackURL,
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

func GenerateRandomToken() string {
	return randStringRunes(64)
}

var LetterRunes = []rune("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789")

func randStringRunes(n int) string {
	b := make([]rune, n)
	for i := range b {
		b[i] = LetterRunes[rand.Intn(len(LetterRunes))]
	}
	return string(b)
}
