package env

import (
	"io/ioutil"

	"gopkg.in/yaml.v3"
)

type ServerConfig struct {
	Name         string `yaml:"name"`
	ServerType   string `yaml:"serverType"`
	Address      string `yaml:"address"`
	Port         uint16 `yaml:"port"`
	DatabasePort uint16 `yaml:"databasePort,omitempty"`
	JWTPassword  string `yaml:"JWTPassword"`
	Debug        bool   `yaml:"debug"`
	ImagesFolder string `yaml:"imagesFolder,omitempty"`
}

var ServerConfiguration *ServerConfig

func LoadConfigFile(fileName string) error {
	raw, err := ioutil.ReadFile(fileName)

	if err != nil {
		return err
	}

	ServerConfiguration = new(ServerConfig)

	return yaml.Unmarshal(raw, ServerConfiguration)
}
