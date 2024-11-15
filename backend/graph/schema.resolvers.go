package graph

// This file will be automatically regenerated based on the schema, any resolver implementations
// will be copied through when generating and any unknown code will be moved to the end.

import (
	"context"
	"fmt"

	"github.com/McMackety/oconnor-backend/db"
	"github.com/McMackety/oconnor-backend/graph/generated"
	"github.com/McMackety/oconnor-backend/graph/model"
	"github.com/McMackety/oconnor-backend/lti"
	"github.com/McMackety/oconnor-backend/media"
	"github.com/bwmarrin/snowflake"
)

func (r *mutationResolver) SaveAssignment(ctx context.Context, externalLtiID string, data model.SaveAssignmentInput) (*model.Assignment, error) {
	if ctx.Value(lti.UserCtxKey) == nil {
		return nil, ErrNotAuthorized
	}
	user := ctx.Value(lti.UserCtxKey).(*db.User)
	fid, err := lti.GetFolderIDForAssignmentID(externalLtiID)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	if fid == nil {
		return nil, ErrNonExistentAssignment
	}
	assignment, err := db.GetAssignmentFromFolderAndUser(*fid, user.OID)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	aid, _ := snowflake.ParseString(assignment.ID)
	assignment, err = db.UpdateAssignment(aid, data.ListComponents, data.OutlineComponents, data.PictureComponents, data.TableComponents)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return assignment, nil
}

func (r *mutationResolver) PickFolderForAssignment(ctx context.Context, externalLtiID string, folderID string) (*string, error) {
	if ctx.Value(lti.UserCtxKey) == nil {
		return nil, ErrNotAuthorized
	}
	user := ctx.Value(lti.UserCtxKey).(*db.User)
	if user.Role != "Instructor" {
		return nil, ErrNotAuthorized
	}
	fid, err := snowflake.ParseString(folderID)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	err = lti.SetFolderIDForAssignmentID(externalLtiID, fid)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	suc := "success"
	return &suc, nil
}

func (r *mutationResolver) SubmitAssignment(ctx context.Context, externalLtiID string) (string, error) {
	if ctx.Value(lti.UserCtxKey) == nil {
		return "failure", ErrNotAuthorized
	}
	user := ctx.Value(lti.UserCtxKey).(*db.User)
	fid, err := lti.GetFolderIDForAssignmentID(externalLtiID)
	if err != nil {
		fmt.Println(err)
		return "failure", err
	}
	if fid == nil {
		return "failure", ErrNonExistentAssignment
	}
	assignment, err := db.GetAssignmentFromFolderAndUser(*fid, user.OID)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	asid, err := snowflake.ParseString(assignment.ID)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	submission, err := db.CreateSubmission(asid)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	sourcedId, err := db.GetSourcedId(user.OID, externalLtiID)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	if sourcedId == nil {
		return "", ErrNoSourcedId
	}
	lti.PassbackGradeLtiLaunch(submission.ID, user.CallbackURL, *sourcedId)
	return "success", nil
}

func (r *mutationResolver) UploadImage(ctx context.Context, base64data string, filename string) (string, error) {
	if ctx.Value(lti.UserCtxKey) == nil {
		return "", ErrNotAuthorized
	}
	user := ctx.Value(lti.UserCtxKey).(*db.User)
	return media.UploadImageB64(user.OID, filename, base64data)
}

func (r *queryResolver) MyAssignment(ctx context.Context, externalLtiID string) (*model.Assignment, error) {
	if ctx.Value(lti.UserCtxKey) == nil {
		return nil, ErrNotAuthorized
	}
	user := ctx.Value(lti.UserCtxKey).(*db.User)
	fid, err := lti.GetFolderIDForAssignmentID(externalLtiID)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	if fid == nil {
		return nil, ErrNonExistentAssignment
	}
	return db.GetAssignmentFromFolderAndUser(*fid, user.OID)
}

func (r *queryResolver) Assignment(ctx context.Context, id string) (*model.Assignment, error) {
	if ctx.Value(lti.UserCtxKey) == nil {
		return nil, ErrNotAuthorized
	}
	sid, err := snowflake.ParseString(id)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return db.GetAssignment(sid)
}

func (r *queryResolver) Submission(ctx context.Context, id string) (*model.Submission, error) {
	sid, err := snowflake.ParseString(id)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return db.GetSubmission(sid)
}

func (r *queryResolver) Folders(ctx context.Context) ([]*model.Folder, error) {
	if ctx.Value(lti.UserCtxKey) == nil {
		return nil, ErrNotAuthorized
	}
	user := ctx.Value(lti.UserCtxKey).(*db.User)
	if user.Role != "Instructor" {
		return nil, ErrNotAuthorized
	}
	folders, err := db.ListFolders()
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	return folders, nil
}

func (r *queryResolver) CurrentFolderID(ctx context.Context, externalLtiID string) (*string, error) {
	if ctx.Value(lti.UserCtxKey) == nil {
		return nil, ErrNotAuthorized
	}
	id, err := lti.GetFolderIDForAssignmentID(externalLtiID)
	if err != nil {
		fmt.Println(err)
		return nil, err
	}
	if id == nil {
		return nil, nil
	}
	sid := id.String()
	return &sid, nil
}

func (r *queryResolver) Me(ctx context.Context) (*model.User, error) {
	if ctx.Value(lti.UserCtxKey) == nil {
		return nil, ErrNotAuthorized
	}
	user := ctx.Value(lti.UserCtxKey).(*db.User)
	return &model.User{
		Oid:   user.OID,
		Name:  user.Name,
		Role:  user.Role,
		Email: user.Email,
	}, nil
}

// Mutation returns generated.MutationResolver implementation.
func (r *Resolver) Mutation() generated.MutationResolver { return &mutationResolver{r} }

// Query returns generated.QueryResolver implementation.
func (r *Resolver) Query() generated.QueryResolver { return &queryResolver{r} }

type mutationResolver struct{ *Resolver }
type queryResolver struct{ *Resolver }
