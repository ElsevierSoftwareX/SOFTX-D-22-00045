package restful

type RecordID struct {
	ID string `json:"id"`
}

type FindByPatient struct {
	Institution string `json:"institution"`
	Patient     string `json:"patient"`
}

type VolumeParameters struct {
	MD5sum        string  `json:"md5sum"`
	ViewX         float32 `json:"viewX"`
	ViewY         float32 `json:"viewY"`
	ViewZ         float32 `json:"viewZ"`
	TranslateX    float32 `json:"translateX"`
	TranslateY    float32 `json:"translateY"`
	TranslateZ    float32 `json:"translateZ"`
	RotateX       float32 `json:"rotateX"`
	RotateY       float32 `json:"rotateY"`
	RotateZ       float32 `json:"rotateZ"`
	RotateAngle   float32 `json:"rotateAngle"`
	Gamma         float32 `json:"gamma"`
	RenderingMode int32   `json:"renderingMode"`
}
