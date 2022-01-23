package image

import (
	"time"
)

type Images struct {
	ID               string    `json:"id"`
	DateAndTime      time.Time `json:"date_and_time"`
	ImageType        string    `json:"image_type"`
	Node             string    `json:"node"`
	Patient          string    `json:"patient"`
	Description      string    `json:"description"`
	Checksum         string    `json:"checksum"`
	Rows             int       `json:"rows"`
	Columns          int       `json:"columns"`
	Frames           int       `json:"frames"`
	RescaleSlope     float32   `json:"rescale_slope"`
	RescaleIntercept float32   `json:"rescale_intercept"`
	WindowCenter     float32   `json:"window_center"`
	WindowWidth      float32   `json:"window_width"`
}

type imageSearchResults struct {
	Institution string `json:"institution"`
	Image       Images `json:"imageData"`
}
