package institution

type Institutions struct {
	ID         string `json:"id"`
	Name       string `json:"name"`
	Address    string `json:"address"`
	IPAddress  string `json:"ip_address"`
	PortNumber uint16 `json:"port_number"`
}

type findInstitutionByNameRequest struct {
	Name string `json:"name"`
}
