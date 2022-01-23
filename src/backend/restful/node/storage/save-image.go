package storage

import (
	"bufio"
	"crypto/md5"
	"encoding/hex"
	"github.com/suyashkumar/dicom"
	"github.com/suyashkumar/dicom/pkg/tag"
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strconv"
	"backend/env"

	"github.com/gin-gonic/gin"
)

//SaveImage is used to save image to disk. It is exported as RESTful endpoint via URL /restful/storage/save-image.
func SaveImage(c *gin.Context) {
	tmpfile, err := ioutil.TempFile(env.GetImagesFolder()+string(os.PathSeparator), "tmp")

	if err != nil {
		c.String(http.StatusInternalServerError, "storage/save-image: Error while opening temp file.")
		return
	}

	tmpfilename := tmpfile.Name()
	form, err := c.MultipartForm()

	if err != nil {
		c.String(http.StatusInternalServerError, "storage/save-image: Error while receiving multipart form data.")
		return
	}

	formFile := form.File["file"][0]
	fileSize := formFile.Size
	fileData, err := formFile.Open()

	if err != nil {
		c.String(http.StatusInternalServerError, "storage/save-image: Error while receiving file.")
		return
	}

	fileReader := bufio.NewReader(fileData)
	hash := md5.New()
	pipeReader, pipeWriter := io.Pipe()
	multiWriter := io.MultiWriter(hash, tmpfile, pipeWriter)
	channel := make(chan interface{})
	var rows, cols int
	var frames = 1
	var rescaleSlope, rescaleIntercept float32 = 1.0, 0.0
	var windowCenter, windowWidth float32
	var samplesPerPixel, bitsAllocated, windowCenterCount, windowWidthCount, rescaleSlopeCount, rescaleInterceptCount int
	var isPhotometricInterpretationCorrect bool

	go func() {
		parser, err := dicom.Parse(pipeReader, fileSize, nil)

		if err != nil {
			return
		}

		for el := parser.FlatStatefulIterator(); el.HasNext(); {
			val := el.Next()

			if val.Tag.Compare(tag.SamplesPerPixel) == 0 {
				samplesPerPixel = val.Value.GetValue().([]int)[0]
			}

			if val.Tag.Compare(tag.PhotometricInterpretation) == 0 {
				tmp := val.Value.GetValue().([]string)[0]

				if tmp == "MONOCHROME1" || tmp == "MONOCHROME2" {
					isPhotometricInterpretationCorrect = true
				}
			}

			if val.Tag.Compare(tag.NumberOfFrames) == 0 {
				frames, _ = strconv.Atoi(val.Value.GetValue().([]string)[0])
			}

			if val.Tag.Compare(tag.Rows) == 0 {
				rows = val.Value.GetValue().([]int)[0]
			}

			if val.Tag.Compare(tag.Columns) == 0 {
				cols = val.Value.GetValue().([]int)[0]
			}

			if val.Tag.Compare(tag.BitsAllocated) == 0 {
				bitsAllocated = val.Value.GetValue().([]int)[0]
			}

			if val.Tag.Compare(tag.RescaleSlope) == 0 {
				f64, err := strconv.ParseFloat(val.Value.GetValue().([]string)[0], 32)

				rescaleSlopeCount++

				if err == nil {
					rescaleSlope = float32(f64)
				}
			}

			if val.Tag.Compare(tag.RescaleIntercept) == 0 {
				f64, err := strconv.ParseFloat(val.Value.GetValue().([]string)[0], 32)

				rescaleInterceptCount++

				if err == nil {
					rescaleIntercept = float32(f64)
				}
			}

			if val.Tag.Compare(tag.WindowCenter) == 0 {
				f64, err := strconv.ParseFloat(val.Value.GetValue().([]string)[0], 32)

				windowCenterCount++

				if err == nil {
					windowCenter = float32(f64)
				}
			}

			if val.Tag.Compare(tag.WindowWidth) == 0 {
				f64, err := strconv.ParseFloat(val.Value.GetValue().([]string)[0], 32)

				windowWidthCount++

				if err == nil {
					windowWidth = float32(f64)
				}
			}
		}

		close(channel)
	}()

	if _, err := io.Copy(multiWriter, fileReader); err != nil {
		c.String(http.StatusInternalServerError, "storage/save-image: Error while calculating hash value of a file.")
		return
	}

	<-channel

	fileData.Close()
	pipeWriter.Close()
	err = tmpfile.Close()

	if err != nil {
		c.String(http.StatusInternalServerError, "storage/save-image: Error while closing temp file.")
		return
	}

	missingData := false

	if samplesPerPixel != 1 {
		missingData = true
	}

	if isPhotometricInterpretationCorrect == false {
		missingData = true
	}

	if rows == 0 {
		missingData = true
	}

	if cols == 0 {
		missingData = true
	}

	if bitsAllocated != 16 {
		missingData = true
	}

	if windowCenterCount != 1 {
		missingData = true
	}

	if windowWidthCount != 1 {
		missingData = true
	}

	if rescaleSlopeCount > 1 {
		missingData = true
	}

	if rescaleInterceptCount > 1 {
		missingData = true
	}

	if missingData == true {
		os.Remove(tmpfilename)
		c.String(http.StatusInternalServerError, "storage/save-image: Could not get all necessary data from DICOM.")
		return
	}

	err = os.Rename(tmpfilename, env.GetImagesFolder()+string(os.PathSeparator)+hex.EncodeToString(hash.Sum(nil)))

	if err != nil {
		c.String(http.StatusInternalServerError, "storage/save-image: Error while renaming temp file.")
		return
	}

	imgInfo := &ImageInfo{
		MD5sum:           hex.EncodeToString(hash.Sum(nil)),
		Rows:             rows,
		Cols:             cols,
		Frames:           frames,
		RescaleSlope:     rescaleSlope,
		RescaleIntercept: rescaleIntercept,
		WindowCenter:     windowCenter,
		WindowWidth:      windowWidth,
	}

	c.JSON(http.StatusOK, imgInfo)
}
