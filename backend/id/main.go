package id

import (
	"log"

	"github.com/bwmarrin/snowflake"
)

var idNode *snowflake.Node

func Init() {
	var err error
	idNode, err = snowflake.NewNode(0)
	if err != nil {
		log.Fatal(err)
	}
}

func Generate() snowflake.ID {
	return idNode.Generate()
}
