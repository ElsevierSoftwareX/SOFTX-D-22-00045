package storage

type ImageInfo struct {
	MD5sum           string  `json:"md5sum"`
	Rows             int     `json:"rows"`
	Cols             int     `json:"columns"`
	Frames           int     `json:"frames"`
	RescaleSlope     float32 `json:"rescale_slope"`
	RescaleIntercept float32 `json:"rescale_intercept"`
	WindowCenter     float32 `json:"window_center"`
	WindowWidth      float32 `json:"window_width"`
}

type Checksum struct {
	MD5sum string `json:"md5sum"`
}
