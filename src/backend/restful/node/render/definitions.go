package render

type frameNumber struct {
	MD5sum string `json:"md5sum"`
	Frame  int    `json:"frame"`
}

type resolutionAndFormat struct {
	MD5sum string `json:"md5sum"`
	Width  int    `json:"width"`
	Height int    `json:"height"`
	Format string `json:"format"`
}
