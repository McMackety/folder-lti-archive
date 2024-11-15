package lti

import (
	"fmt"

	"github.com/McMackety/oconnor-backend/db"
	"github.com/bwmarrin/snowflake"
)

func GetFolderIDForAssignmentID(externalLTIAssignmentID string) (id *snowflake.ID, err error) {
	atf, err := db.GetAssignmentToFolder(externalLTIAssignmentID)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	if atf == nil {
		return nil, nil
	}
	sid, err := snowflake.ParseString(atf.FID)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}

	return &sid, nil
}

func SetFolderIDForAssignmentID(externalLTIAssignmentID string, fid snowflake.ID) error {
	err := db.SetAssignmentToFolder(externalLTIAssignmentID, fid)
	if err != nil {
		fmt.Println(err)
		return err
	}

	return nil
}
