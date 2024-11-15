package model

//This is an awful way of doing it but it gets the job done

type FatFolder struct {
	Fid   string     `json:"fid"`
	Pages []*FatPage `json:"pages"`
	Name  string     `json:"name"`
}

type FatAssignment struct {
	Fid   string     `json:"fid"`
	Uid   string     `json:"uid"`
	ID    string     `json:"id"`
	Pages []*FatPage `json:"pages"`
	Name  string     `json:"name"`
}

type FatPage struct {
	ID         string               `json:"id"`
	Components []FatFolderComponent `json:"components"`
}

type FatFolderComponent struct {
	ID    string `json:"id"`
	Title string `json:"title"`

	ListItems []*ListItem `json:"listItems"`

	Children []*OutlineChild `json:"children"`

	Pictures []*PictureItem `json:"pictures"`

	Rows    []string     `json:"rows"`
	Columns []string     `json:"columns"`
	Cells   []*TableCell `json:"cells"`
}
