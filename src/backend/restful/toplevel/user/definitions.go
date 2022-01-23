package user

import "backend/restful/toplevel/institution"

type Users struct {
	ID               string `json:"id"`
	Username         string `json:"username"`
	Password         string `json:"password"`
	Administrator    bool   `json:"administrator"`
	Superuser        bool   `json:"superuser"`
	FirstName        string `json:"first_name"`
	LastName         string `json:"last_name"`
	DoctorOfMedicine bool   `json:"doctor_of_medicine"`
	Active           bool   `json:"active"`
	Institution      string `json:"institution"`
	Address          string `json:"address"`
	Email            string `json:"email"`
	Phone            string `json:"phone"`
}

type changePasswordRequest struct {
	OldPassword string `json:"old_password"`
	NewPassword string `json:"new_password"`
}

type myUserData struct {
	InstitutionData institution.Institutions `json:"institution_data"`
	UserData        Users                    `json:"user_data"`
}
