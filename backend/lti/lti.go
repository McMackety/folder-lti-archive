package lti

import (
	"bytes"
	"context"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"text/template"
	"time"

	"github.com/McMackety/oconnor-backend/db"
	"github.com/McMackety/oconnor-backend/dev"
	"github.com/gorilla/schema"
	"github.com/mrjones/oauth"
)

var consumerKey = "REDACTED"
var consumerSecret = "REDACTED"

var appURL = "https://oconnorfolder.nathankutzan.info"

const xmlTemplate = `<?xml version="1.0" encoding="UTF-8"?>
<cartridge_basiclti_link xmlns="http://www.imsglobal.org/xsd/imslticc_v1p0" xmlns:blti="http://www.imsglobal.org/xsd/imsbasiclti_v1p0" xmlns:lticm="http://www.imsglobal.org/xsd/imslticm_v1p0" xmlns:lticp="http://www.imsglobal.org/xsd/imslticp_v1p0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsglobal.org/xsd/imslticc_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticc_v1p0.xsd     http://www.imsglobal.org/xsd/imsbasiclti_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imsbasiclti_v1p0.xsd     http://www.imsglobal.org/xsd/imslticm_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticm_v1p0.xsd     http://www.imsglobal.org/xsd/imslticp_v1p0 http://www.imsglobal.org/xsd/lti/ltiv1p0/imslticp_v1p0.xsd">
	<blti:title>{{.Title}}</blti:title>
	<blti:description>{{.Description}}</blti:description>
	<blti:launch_url>{{.LaunchURL}}</blti:launch_url>
	<blti:extensions platform="canvas.instructure.com">
		<lticm:options name="assignment_selection">
			<lticm:property name="url">{{.LaunchURL}}</lticm:property>
			<lticm:property name="message_type">ContentItemSelectionRequest</lticm:property>
			<lticm:options name="custom_fields">
				<lticm:property name="course_id">$Canvas.course.id</lticm:property>
				<lticm:property name="assignment_id">$Canvas.assignment.id</lticm:property>
			</lticm:options>
		</lticm:options>
		<lticm:property name="domain">{{.Domain}}</lticm:property>
		<lticm:property name="privacy_level">public</lticm:property>
	</blti:extensions>
</cartridge_basiclti_link>`

type XMLConfigOptions struct {
	LaunchURL   string
	Domain      string
	Title       string
	Description string
}

var editorURL = "https://oconnorfolder.nathankutzan.info/app"

var configuration = XMLConfigOptions{
	LaunchURL:   "https://api.oconnorfolder.nathankutzan.info/lti",
	Domain:      "oconnorfolder.nathankutzan.info",
	Title:       "Digital Folder App",
	Description: "A Web App for O'Connor Folders.",
}

func XMLConfiguration(res http.ResponseWriter, req *http.Request) {
	tmpl, err := template.New("config.xml").Parse(xmlTemplate)
	if err != nil {
		fmt.Println(err)
		res.WriteHeader(500)
		return
	}
	tmpl.Execute(res, &configuration)
}

// LTI Handler

type LTIForm struct {
	ContextID string `form:"context_id"`

	ContextLabel string `form:"context_label"`

	ContextTitle string `form:"context_title"`

	CustomCanvasAPIDomain string `form:"custom_canvas_api_domain"`

	CustomCanvasAssignmentID string `form:"custom_canvas_assignment_id"`

	CustomCanvasAssignmentPointsPossible string `form:"custom_canvas_assignment_points_possible"`

	CustomCanvasAssignmentTitle string `form:"custom_canvas_assignment_title"`

	CustomCanvasCourseID string `form:"custom_canvas_course_id"`

	CustomCanvasEnrollmentState string `form:"custom_canvas_enrollment_state"`

	CustomCanvasUserID string `form:"custom_canvas_user_id"`

	CustomCanvasUserLoginID string `form:"custom_canvas_user_login_id"`

	CustomCanvasWorkflowState string `form:"custom_canvas_workflow_state"`

	ExternalIMSLISBasicOutcomeURL string `form:"ext_ims_lis_basic_outcome_url"`

	ExternalLTIAssignmentID string `form:"ext_lti_assignment_id"`

	ExternalOutcomeDataValuesAccepted string `form:"ext_outcome_data_values_accepted"`

	ExternalOutcomeResultTotalScoreAccepted string `form:"ext_outcome_result_total_score_accepted"`

	ExternalOutcomeSubmissionSubmittedAtAccepted string `form:"ext_outcome_submission_submitted_at_accepted"`

	ExternalOutcomesToolPlacementURL string `form:"ext_outcomes_tool_placement_url"`

	ExternalRoles string `form:"ext_roles"`

	LaunchPresentationDocumentTarget string `form:"launch_presentation_document_target"`

	LaunchPresentationLocale string `form:"launch_presentation_locale"`

	LaunchPresentationReturnURL string `form:"launch_presentation_return_url"`

	LISOutcomeServiceURL string `form:"lis_outcome_service_url"`

	LISPersonContactEmailPrimary string `form:"lis_person_contact_email_primary"`

	LISPersonNameFamily string `form:"lis_person_name_family"`

	LISPersonNameFull string `form:"lis_person_name_full"`

	LISPersonNameGiven string `form:"lis_person_name_given"`

	LTIMessageType string `form:"lti_message_type"`

	LTIVersion string `form:"lti_version"`

	OAuthCallback string `form:"oauth_callback"`

	ResourceLinkID string `form:"resource_link_id"`

	ResourceLinkTitle string `form:"resource_link_title"`

	Roles string `form:"roles"`

	ToolConsumerInfoProductFamilyCode string `form:"tool_consumer_info_product_family_code"`

	ToolConsumerInfoVersion string `form:"tool_consumer_info_version"`

	ToolConsumerInstanceContactEmail string `form:"tool_consumer_instance_contact_email"`

	ToolConsumerInstanceGUID string `form:"tool_consumer_instance_guid"`

	ToolConsumerInstanceName string `form:"tool_consumer_instance_name"`

	UserID string `form:"user_id"`

	UserImage string `form:"user_image"`

	SourceID string `form:"lis_result_sourcedid"`

	ContentItemReturnUrl string `form:"content_item_return_url"`
}

var decoder = schema.NewDecoder()

func HandleLTI(res http.ResponseWriter, req *http.Request) {
	provider := oauth.NewProvider(func(s string, h map[string]string) (*oauth.Consumer, error) {
		c := oauth.NewConsumer(consumerKey, consumerSecret, oauth.ServiceProvider{})
		return c, nil
	})

	_, err := provider.IsAuthorized(req)
	if err != nil {
		fmt.Println(err)
		res.WriteHeader(401)
		return
	}

	var form LTIForm
	decoder.IgnoreUnknownKeys(true)
	decoder.SetAliasTag("form")
	body, _ := ioutil.ReadAll(req.Body)
	postVals, err := url.ParseQuery(string(body))
	if err != nil {
		fmt.Println(err)
		res.WriteHeader(500)
		return
	}

	err = decoder.Decode(&form, postVals)
	if err != nil {
		fmt.Println(err)
		res.WriteHeader(500)
		return
	}

	user, err := db.GetUser(form.UserID)

	if err != nil {
		fmt.Println(err)
		res.WriteHeader(500)
		return
	}

	token := db.GenerateRandomToken()
	expiryTime := time.Now().Add(time.Hour * 24)

	if user == nil {
		user := db.User{
			OID:             form.UserID,
			Name:            form.LISPersonNameFull,
			Token:           token,
			TokenExpiryTime: expiryTime.Unix(),
			Role:            form.Roles,
			Email:           form.LISPersonContactEmailPrimary,
			CallbackURL:     form.LISOutcomeServiceURL,
		}
		err := db.CreateUser(&user)
		if err != nil {
			fmt.Println(err)
			res.WriteHeader(500)
			return
		}
	} else {
		err = db.UpdateUserToken(form.UserID, token, expiryTime, form.Roles, form.LISPersonContactEmailPrimary, form.LISOutcomeServiceURL)
		if err != nil {
			fmt.Println(err)
			res.WriteHeader(500)
			return
		}
	}
	db.SetSourcedId(form.UserID, form.ExternalLTIAssignmentID, form.SourceID)

	userCookie := new(http.Cookie)
	userCookie.Domain = "oconnorfolder.nathankutzan.info"
	userCookie.Secure = true
	userCookie.SameSite = http.SameSiteNoneMode
	userCookie.Name = "user"
	userCookie.Value = form.UserID
	userCookie.Expires = expiryTime
	http.SetCookie(res, userCookie)

	tokenCookie := new(http.Cookie)
	tokenCookie.Domain = "oconnorfolder.nathankutzan.info"
	tokenCookie.Secure = true
	tokenCookie.SameSite = http.SameSiteNoneMode
	tokenCookie.Name = "token"
	tokenCookie.Value = token
	tokenCookie.Expires = expiryTime
	http.SetCookie(res, tokenCookie)

	if viewsubmissionId := req.URL.Query().Get("viewsubmission"); len(viewsubmissionId) > 0 {
		http.Redirect(res, req, appURL+"/submission/"+viewsubmissionId, http.StatusSeeOther)
		return
	}

	if form.LTIMessageType == "ContentItemSelectionRequest" && len(form.ContentItemReturnUrl) > 0 {
		http.Redirect(res, req, appURL+"/selectassignment/"+form.ExternalLTIAssignmentID+"?return="+base64.URLEncoding.EncodeToString([]byte(form.ContentItemReturnUrl)), http.StatusSeeOther)
		return
	}

	http.Redirect(res, req, appURL+"/assignment/"+form.ExternalLTIAssignmentID, http.StatusSeeOther)

}

var UserCtxKey = &ContextKey{"user"}

type ContextKey struct {
	Name string
}

func AuthMiddleware() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			OID, err := r.Cookie("user")
			if OID == nil || err != nil {
				next.ServeHTTP(w, r)
				return
			}

			token, err := r.Cookie("token")

			if token == nil || err != nil {
				next.ServeHTTP(w, r)
				return
			}

			user, err := db.GetUser(OID.Value)

			if err != nil {
				fmt.Println(err)
				next.ServeHTTP(w, r)
				return
			}

			if user == nil {
				next.ServeHTTP(w, r)
				return
			}

			if user.Token != token.Value {
				next.ServeHTTP(w, r)
				return
			}

			if time.Now().Unix() > user.TokenExpiryTime {
				next.ServeHTTP(w, r)
				return
			}

			ctx := context.WithValue(r.Context(), UserCtxKey, user)

			r = r.WithContext(ctx)
			next.ServeHTTP(w, r)
		})
	}
}

func ForContext(ctx context.Context) *db.User {
	raw, _ := ctx.Value(UserCtxKey).(*db.User)
	return raw
}

const gradeXMLTemplateLtiLaunch = `<?xml version = "1.0" encoding = "UTF-8"?>
<imsx_POXEnvelopeRequest xmlns="http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">
  <imsx_POXHeader>
    <imsx_POXRequestHeaderInfo>
      <imsx_version>V1.0</imsx_version>
      <imsx_messageIdentifier>999999123</imsx_messageIdentifier>
    </imsx_POXRequestHeaderInfo>
  </imsx_POXHeader>
  <imsx_POXBody>
    <replaceResultRequest>
      <resultRecord>
        <sourcedGUID>
          <sourcedId>{{.SourceID}}</sourcedId>
        </sourcedGUID>
        <result>
          <resultData>
            <ltiLaunchUrl>{{.ResponseUrl}}</ltiLaunchUrl>
          </resultData>
        </result>
      </resultRecord>
    </replaceResultRequest>
  </imsx_POXBody>
</imsx_POXEnvelopeRequest>`

type GradeLtiLaunchConfig struct {
	SourceID    string
	ResponseUrl string
}

const gradeXMLTemplateFile = `<?xml version = "1.0" encoding = "UTF-8"?>
<imsx_POXEnvelopeRequest xmlns="http://www.imsglobal.org/services/ltiv1p1/xsd/imsoms_v1p0">
  <imsx_POXHeader>
    <imsx_POXRequestHeaderInfo>
      <imsx_version>V1.0</imsx_version>
      <imsx_messageIdentifier>999999123</imsx_messageIdentifier>
    </imsx_POXRequestHeaderInfo>
  </imsx_POXHeader>
  <imsx_POXBody>
    <replaceResultRequest>
      <resultRecord>
        <sourcedGUID>
          <sourcedId>{{.SourceID}}</sourcedId>
        </sourcedGUID>
        <result>
          <resultData>
            <downloadUrl>{{.FileURL}}</downloadUrl>
            <documentName>{{.FileName}}</documentName>
          </resultData>
        </result>
      </resultRecord>
    </replaceResultRequest>
  </imsx_POXBody>
</imsx_POXEnvelopeRequest>`

type GradeFileConfig struct {
	SourceID string
	FileURL  string
	FileName string
}

func PassbackGradeLtiLaunch(submissionId, url, sourceID string) error {
	consumer := oauth.NewConsumer(consumerKey, consumerSecret, oauth.ServiceProvider{})

	client, err := consumer.MakeHttpClient(&oauth.AccessToken{"", "", make(map[string]string)})

	if err != nil {
		fmt.Println(err)
		return err
	}

	gc := GradeLtiLaunchConfig{
		SourceID:    sourceID,
		ResponseUrl: configuration.LaunchURL + "?viewsubmission=" + submissionId,
	}

	writer := bytes.Buffer{}

	tmpl, err := template.New("post.xml").Parse(gradeXMLTemplateLtiLaunch)
	if err != nil {
		fmt.Println(err)
		return err
	}
	tmpl.Execute(&writer, &gc)

	_, err = client.Post(url, "application/xml", &writer)
	if err != nil {
		fmt.Println(err)
		return err
	}

	return nil
}

func PassbackGradeFile(submissionId, url, sourceID, userName string) error {
	consumer := oauth.NewConsumer(consumerKey, consumerSecret, oauth.ServiceProvider{})

	client, err := consumer.MakeHttpClient(&oauth.AccessToken{"", "", make(map[string]string)})

	if err != nil {
		fmt.Println(err)
		return err
	}

	cleanName := strings.Map(func(r rune) rune {
		for _, item := range db.LetterRunes {
			if item == r {
				return r
			}
		}
		return -1
	}, userName)

	pdfHost := "https://pdf.oconnorfolder.nathankutzan.info"
	if isDev {
		pdfHost = dev.DevPdfUrl
	}

	gc := GradeFileConfig{
		SourceID: sourceID,
		FileURL:  pdfHost + "/submission/" + submissionId,
		FileName: cleanName + "-" + submissionId + ".pdf",
	}

	writer := bytes.Buffer{}

	tmpl, err := template.New("post.xml").Parse(gradeXMLTemplateFile)
	if err != nil {
		fmt.Println(err)
		return err
	}
	tmpl.Execute(&writer, &gc)

	_, err = client.Post(url, "application/xml", &writer)
	if err != nil {
		fmt.Println(err)
		return err
	}

	return nil
}
