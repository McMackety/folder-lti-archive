package model

type Submission struct {
	Fid   string  `json:"fid"`
	Uid   string  `json:"uid"`
	ID    string  `json:"id"`
	Pages []*Page `json:"pages"`
	Name  string  `json:"name"`
}
