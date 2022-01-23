package env

//GetImagesFolder return path of a folder which is used to store medical images.
func GetImagesFolder() string {
	return ServerConfiguration.ImagesFolder
}
