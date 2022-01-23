/*
Package env is used to open and close the database and provide access to it.
*/
package env

import (
	"strconv"

	"github.com/jinzhu/gorm"
	_ "github.com/jinzhu/gorm/dialects/postgres"
)

var db *gorm.DB

//OpenDatabase is used to open the database which is located in the program's root directory (where the executable is located).
func OpenDatabase() {
	var err error
	db, err = gorm.Open("postgres", "host="+ServerConfiguration.Address+" port="+strconv.Itoa(int(ServerConfiguration.DatabasePort))+" user=root dbname=postgres sslmode=disable connect_timeout=5")
	if err != nil {
		panic("Error opening database.")
	}

	db.SingularTable(true)
}

//CloseDatabase is used to close the database.
func CloseDatabase() {
	if db != nil {
		db.Close()
	}
}

//Db returns a pointer of the database.
func Db() *gorm.DB {
	return db
}
