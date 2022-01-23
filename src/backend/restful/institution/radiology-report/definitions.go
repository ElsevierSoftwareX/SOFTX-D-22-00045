package radiology_report

import (
	"backend/restful/institution/image"
	"time"
)

type RadiologyReport struct {
	ID               string    `json:"id"`
	Description      string    `json:"description"`
	Findings         string    `json:"findings"`
	Conclusion       string    `json:"conclusion"`
	Recommendation   string    `json:"recommendation"`
	DateAndTime      time.Time `json:"date_and_time"`
	Patient          string    `json:"patient"`
	DoctorOfMedicine string    `json:"doctor_of_medicine"`
}

type RadiologyReportImages struct {
	ID              string `json:"id"`
	RadiologyReport string `json:"radiology_report"`
	Institution     string `json:"institution"`
	Image           string `json:"image"`
}

type radiologyReportSearchResults struct {
	Institution     string          `json:"institution"`
	RadiologyReport RadiologyReport `json:"radiology_report"`
}

type radiologyReportImage struct {
	ID          string       `json:"id"`
	Institution string       `json:"institution"`
	ImageData   image.Images `json:"imageData"`
}
