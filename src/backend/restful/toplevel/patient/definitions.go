package patient

import (
	"time"
)

type Patients struct {
	ID              string    `json:"id"`
	FirstName       string    `json:"first_name"`
	LastName        string    `json:"last_name"`
	Gender          string    `json:"gender"`
	DateOfBirth     time.Time `json:"date_of_birth"`
	InsuranceNumber uint64    `json:"insurance_number"`
	Address         string    `json:"address"`
	Email           string    `json:"email"`
	Phone           string    `json:"phone"`
}

type findByInsuranceNumberRequest struct {
	InsuranceNumber uint64 `json:"insurance_number"`
}
