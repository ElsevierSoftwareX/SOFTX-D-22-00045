GO_COMPILER = go
DOC_SERVER	= ~/go/bin/godoc
HOST		= 127.0.0.1
PORT 		= 6060
COCKROACH	= ~/bin/

#.PHONY: all build prepare update clean doc check run-toplevel-server run-institution-server run-node-server run-toplevel-database run-institution-database help

all: build

build:
	$(GO_COMPILER) build

prepare:
	$(GO_COMPILER) get -u github.com/gin-gonic/gin
	$(GO_COMPILER) get -u github.com/lib/pq
	$(GO_COMPILER) get -u github.com/jinzhu/gorm
	$(GO_COMPILER) get -u github.com/go-gl/glfw/v3.3/glfw
	$(GO_COMPILER) get -u github.com/go-gl/gl/v4.6-core/gl
	$(GO_COMPILER) get -u github.com/go-gl/mathgl/mgl32
	$(GO_COMPILER) get -u github.com/dgrijalva/jwt-go
	$(GO_COMPILER) get -u github.com/appleboy/gin-jwt/v2
	$(GO_COMPILER) get -u github.com/gin-contrib/cors
	$(GO_COMPILER) get -u gopkg.in/yaml.v3
	$(GO_COMPILER) get -u golang.org/x/tools/cmd/godoc
	$(GO_COMPILER) get -u github.com/suyashkumar/dicom
	$(GO_COMPILER) get -u github.com/kolesa-team/go-webp

update:
	$(GO_COMPILER) clean
	$(GO_COMPILER) get -u ./...
	$(GO_COMPILER) mod tidy

clean:
	$(GO_COMPILER) clean -cache
	$(GO_COMPILER) clean -modcache
	rm web/*
	rm teza-backend

doc:
	$(DOC_SERVER) -http $(HOST):$(PORT)

check:
	$(GO_COMPILER) vet

run-web-server:
	$(GO_COMPILER) run main.go -config config/web.yaml

run-toplevel-server:
	$(GO_COMPILER) run main.go -config config/toplevel.yaml

run-institution1-server:
	$(GO_COMPILER) run main.go -config config/institution1.yaml

run-institution1-node1-server:
	$(GO_COMPILER) run main.go -config config/institution1-node1.yaml

run-toplevel-database:
	$(COCKROACH)cockroach start-single-node --insecure -s /tank/teza/databases/toplevel/ --listen-addr=127.0.0.1:9000 --http-addr=127.0.0.1:9001

run-institution1-database:
	$(COCKROACH)cockroach start-single-node --insecure -s /tank/teza/databases/institution1/ --listen-addr=127.0.0.1:10000 --http-addr=127.0.0.1:10001

help:
	@echo 'make [target]'
	@echo '    (empty)         					- build project'
	@echo '    all             					- same as target (empty)'
	@echo '    prepare         					- fetch required libraries'
	@echo '    update          					- update libraries'
	@echo '    clean           					- delete all temporary files'
	@echo '    doc             					- run documentation server'
	@echo '    check           					- check code for errors'
	@echo '    run-web-server    				- start web server'
	@echo '    run-toplevel-server    			- start toplevel server'
	@echo '    run-institution1-server 			- start institution 1 server'
	@echo '    run-institution1-node1-server	- start node 1 server from institution 1'
	@echo '    run-toplevel-database    		- start toplevel server'
	@echo '    run-institution1-database 		- start institution 1 server'
