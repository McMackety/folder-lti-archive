package model

type Assignment struct {
	Fid   string  `json:"fid"`
	Uid   string  `json:"uid"`
	ID    string  `json:"id"`
	Pages []*Page `json:"pages"`
	Name  string  `json:"name"`
}
