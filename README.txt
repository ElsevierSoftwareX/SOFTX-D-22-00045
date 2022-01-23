# Introduction

SIVR stand for Seamless Image and Volume Rendering

Project consists of two parts: backend and frontend.

## Installation

Frontned does not require installation. It is enought to install NodeJS, and pull repository.
After that just run command `npm install` to download required libraries.

For backend following Go libraries must be installed:

- go get -u github.com/gin-gonic/gin
- go get -u github.com/lib/pq
- go get -u github.com/jinzhu/gorm
- go get -u github.com/go-gl/glfw/v3.3/glfw
- go get -u github.com/go-gl/gl/v4.6-core/gl
- go get -u github.com/go-gl/mathgl/mgl32
- go get -u github.com/dgrijalva/jwt-go
- go get -u github.com/appleboy/gin-jwt/v2
- go get -u github.com/gin-contrib/cors
- go get -u gopkg.in/yaml.v3
- go get -u github.com/suyashkumar/dicom
- go get -u github.com/kolesa-team/go-webp 

Additionally, following libraries from underlying OS (Linux) are required by GLFW:

- libx11-dev
- libxcursor-dev
- libxrandr-dev
- libxinerama-dev
- mesa-common-dev
- libxi-dev
- libxxf86vm-dev
- libglvnd-dev
- libglvnd-core-dev
- libegl1-mesa-dev
- pkgconf
- libwebp-dev

**Note:** If you are using Ubuntu or similar Linux distribution, first install `libegl1-mesa-dev` because it will install most of other dependencies.

Last step is to install CockroachDB database:

```bash
wget -qO- https://binaries.cockroachdb.com/cockroach-v21.2.4.linux-amd64.tgz | tar xvz
cp -i cockroach-v21.2.4.linux-amd64/cockroach /usr/local/bin/
```

or build it from source:

```bash
wget -qO- https://binaries.cockroachdb.com/cockroach-v21.2.4.src.tgz | tar xvz
cd cockroach-v21.2.4
make build #make on Linux, gmake on FreeBSD
```

## Handle driver errors

Some drivers don't implement all functions. For example, some AMD drivers don't implement following functions:

- glGetnCompressedTexImage
- glGetnTexImage
- glGetnUniformdv

To bypass error checking on the init, generate OpenGL binding packages in the following way:

```bash
./glow generate -api=gl -version=4.6 -profile=core -lenientInit
```

Don't forget to check if the function exist before using it.


## Update

Regularly update libraries by running following commands:

```bash
go clean
go get -u ./...
go mod tidy
```

## Documentation

Documentation of Go code you can access over integrated documentation server `godoc -http=:port`.  
For example: `godoc -http=:6060`.

RESTful API documenation you can access by opening files `openapi/*.yaml` in [Swagger Editor](https://editor.swagger.io/) 
or [Swagger UI](http://swagger.io/swagger-ui/).

**Note:** If you want to validate *.yaml files, you can use swagger-cli utility (`npm -g install swagger-cli`).

## Building

This project uses make utility. If you don't have it on your system, please install it first.

Execute `make [target]` in terminal, where target is desired action descibed in following table.

|        [target]        |              Description               |
| ---------------------- | -------------------------------------- |
| (empty)                | Build project                          |
| all                    | Same as target (empty)                 |
| prepare                | Fetch required libraries               |
| update                 | Update libraries                       |
| clean                  | Delete all temporary files             |
| doc                    | Run documentation server               |
| check                  | Check code for errors                  |
| run-toplevel           | Start toplevel server                  |
| run-institution1       | Start institution 1 server             |
| run-institution1-node1 | Start node 1 server from institution 1 |

## General description of hierarchy

Application is structured in a way that it can serve different purposes (configured in config file).

Hierarchy is following:

1. Toplevel server - used for management of users, patients and institutions; proxy queries to main server in institution
2. Main server in institution - used to store list or records which are kept in institution; list of nodes; proxy queries to nodes
3. Node - used to render data to an image and sent it to users

Application can be started in several ways by using command line arguments:

- type - toplevel, institution and node
- debug - true, false

Example:

```bash
go run main.go -config config_file_name.yaml
```

If go complains about missing header filer or libraries (common problem on FreeBSD) prepend following `CGO_CFLAGS="-I/usr/local/include" CGO_LDFLAGS="-L/usr/local/lib"` to go command.

Examples:

```bash
CGO_CFLAGS="-I/usr/local/include" CGO_LDFLAGS="-L/usr/local/lib"; go run main.go -config config_file_name.yaml
CGO_CFLAGS="-I/usr/include" go get -u github.com/go-gl/gl/v3.1/gles2
```

**Note:** Load balancing and replication mechanisms are not yet implemented.

## Database startup

```bash
cockroach start-single-node --insecure -s database/toplevel/ --listen-addr=127.0.0.1:9000 --http-addr=127.0.0.1:9001
```

## Application startup

To start front run command `npx ng serve`.

On backend, if using HTTP/3 protocol please ensure that UDP buffer size is at least 2.5 MB.

```bash
#Example for FreeBSD
sysctl kern.ipc.maxsockbuf=2500000
```

To have usable solution, user must start all backend servers (minimum of 1 toplevel. 1 institution, and 1 node).

## Signals

Backend application is able to catch a SIGUSR1 signal.

```bash
kill -10 PID
```

## References

1. HTTP web framework [Gin](https://gin-gonic.github.io/gin/)
2. Object relational mapping library [GORM](http://jinzhu.me/gorm/)
3. Go bindings for [OpenGL](https://github.com/go-gl/gl)
4. Go bindings for [GLFW](https://github.com/go-gl/glfw)
5. OpenGL binding [generator](https://github.com/go-gl/glow) for Go
6. [3D math](https://github.com/go-gl/mathgl) library for Go
7. [Swagger](http://swagger.io) API tooling
8. [Make](http://pubs.opengroup.org/onlinepubs/9699919799/utilities/make.html) build automation utility
9. [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) - Cross-origin resource sharing
10. [CockroachDB](https://www.cockroachlabs.com) - cloud-native SQL database for building global, scalable cloud services that survive disasters
