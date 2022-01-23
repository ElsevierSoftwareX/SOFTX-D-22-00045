package node

type Nodes struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	IPAddress  string `json:"ip_address"`
	PortNumber uint16 `json:"port_number"`
}
