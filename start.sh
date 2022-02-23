#!/usr/bin/bash
sudo sysctl -w net.core.rmem_max=2500000
/home/kreso/bin/cockroach start-single-node --insecure -s /home/kreso/sivr/databases/toplevel --listen-addr=sivr.info:9000 --http-addr=sivr.info:9001 &
/home/kreso/bin/cockroach start-single-node --insecure -s /home/kreso/sivr/databases/institution1/ --listen-addr=sivr.info:10000 --http-addr=sivr.info:10001 &
Xvfb :1 &
cd src/backend && go run main.go -config config/web.yaml &
cd src/backend && DISPLAY=:1 go run main.go -config config/institution1-node1.yaml &
cd src/backend && go run main.go -config config/institution1.yaml &
cd src/backend && go run main.go -config config/toplevel.yaml &
