package render

import (
	"backend/env"
	opengl "backend/graphics"
	"backend/restful/node/storage"
	"fmt"
	"net/http"
	"os"
	"runtime/debug"
	"sync"
	"time"

	"github.com/suyashkumar/dicom"

	"github.com/gin-gonic/gin"
	"github.com/suyashkumar/dicom/pkg/frame"
)

//LoadImage is used to load image from disk. It is exported as RESTful endpoint via URL /restful/render/load-image.
func LoadImage(c *gin.Context) {
	var json storage.ImageInfo

	if c.BindJSON(&json) != nil {
		c.String(http.StatusBadRequest, "render/load-image: Error while parsing request data.")
		return
	}

	if opengl.ContextExists(json.MD5sum) {
		c.String(http.StatusBadRequest, "render/load-image: Image is already loaded.")
		return
	}

	var err error

	err = opengl.CreateTextures(&json)

	if err != nil {
		c.String(http.StatusInternalServerError, "render/load-image: Error creating texture.")
		return
	}

	go parseFile(&json)

	c.String(http.StatusOK, "render/load-image: Image was successfully opened.")
}

func parseFile(info *storage.ImageInfo) {
	var err error
	var cnt int32 = 0
	var loadError = false
	var start time.Time
	ch := make(chan *frame.Frame, 1)

	if env.ServerConfiguration.Debug == true {
		start = time.Now()
	}

	var wg sync.WaitGroup

	wg.Add(1)

	go func() {
		for frameChannel := range ch {
			cnt++

			frm, err := frameChannel.GetImage()

			if err != nil {
				loadError = true
				continue
			}

			err = opengl.SetFrame(info, &frm, cnt-1)

			if err != nil {
				loadError = true
			}
		}

		wg.Done()
	}()

	_, err = dicom.ParseFile(env.GetImagesFolder()+string(os.PathSeparator)+info.MD5sum, ch)

	wg.Wait()

	if err != nil {
		loadError = true
	}

	if env.ServerConfiguration.Debug == true {
		elapsed := time.Since(start)
		fmt.Printf("DICOM %s loading took %s\n", info.MD5sum, elapsed)
	}

	err = opengl.GenerateMipmap(info.MD5sum)

	if err != nil {
		loadError = true
	}

	if loadError == true {
		opengl.SetLoaded(info.MD5sum, true)
	} else {
		opengl.SetLoaded(info.MD5sum, false)
	}

	debug.FreeOSMemory()
}
