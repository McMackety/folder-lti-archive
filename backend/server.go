package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/99designs/gqlgen/graphql"
	"github.com/99designs/gqlgen/graphql/handler"
	"github.com/99designs/gqlgen/graphql/playground"
	"github.com/McMackety/oconnor-backend/db"
	"github.com/McMackety/oconnor-backend/graph"
	"github.com/McMackety/oconnor-backend/graph/generated"
	"github.com/McMackety/oconnor-backend/id"
	"github.com/McMackety/oconnor-backend/lti"
	"github.com/McMackety/oconnor-backend/media"
	"github.com/getsentry/sentry-go"
	"github.com/rs/cors"
	"github.com/vektah/gqlparser/v2/gqlerror"
)

const defaultPort = "8080"

func main() {
	/*	err := sentry.Init(sentry.ClientOptions{
			Dsn: "",
		})
		if err != nil {
			fmt.Println(err)
			log.Fatalf("sentry.Init: %s", err)
		}
		defer sentry.Flush(2 * time.Second)*/

	port := os.Getenv("PORT")
	if port == "" {
		port = defaultPort
	}
	isDev := os.Getenv("DEV") == "true"
	db.Init(isDev)
	id.Init()
	lti.Init(isDev)
	media.Init(isDev)

	srv := handler.NewDefaultServer(generated.NewExecutableSchema(generated.Config{Resolvers: &graph.Resolver{}}))

	srv.SetErrorPresenter(func(ctx context.Context, e error) *gqlerror.Error {
		err := graphql.DefaultErrorPresenter(ctx, e)

		puser := ctx.Value(lti.UserCtxKey)

		if ctx.Value(lti.UserCtxKey) != nil {
			user := puser.(*db.User)
			sentry.ConfigureScope(func(scope *sentry.Scope) {
				scope.SetUser(sentry.User{Email: user.Email, Username: user.Name, ID: user.OID})
			})
		}

		sentry.CaptureException(e)

		return err
	})

	gqlhandler := cors.New(cors.Options{
		AllowOriginFunc:  func(origin string) bool { return true },
		AllowCredentials: true,
	}).Handler(srv)

	http.Handle("/playground", playground.Handler("GraphQL playground", "/query"))
	http.Handle("/query", lti.AuthMiddleware()(gqlhandler))

	http.Handle("/lti", http.HandlerFunc(lti.HandleLTI))

	http.Handle("/lti/config", http.HandlerFunc(lti.XMLConfiguration))

	log.Printf("connect to http://localhost:%s/ for GraphQL playground", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}
