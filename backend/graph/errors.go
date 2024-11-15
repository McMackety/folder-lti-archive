package graph

import "errors"

var ErrNotAuthorized = errors.New("Not Authorized")
var ErrNonExistentAssignment = errors.New("Assignment does not exist")
var ErrNoSourcedId = errors.New("A successful link with canvas could not be established")
