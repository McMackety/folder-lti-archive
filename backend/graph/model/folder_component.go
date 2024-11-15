package model

type FolderComponent interface {
	IsFolderComponent()
	GetID() string
}

func (l ListComponent) GetID() string    { return l.ID }
func (l PictureComponent) GetID() string { return l.ID }
func (l TableComponent) GetID() string   { return l.ID }
func (l OutlineComponent) GetID() string { return l.ID }
