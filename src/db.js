const { remote } = require('electron')
import Datastore from 'nedb'

// returns the correct datastore from a keyword
function getDB(name) {
	switch(name) {
		case 'classes':
			return remote.getGlobal('classes')
			break
		case 'students':
			return remote.getGlobal('students')
			break
		case 'notes':
			return remote.getGlobal('notes')
			break
	}
}

/*
data structures

classes:
{
	columns: Integer,
	rows: Integer,
	name: String,
	semester: String,
	year: Integer,
	archived: Boolean
}

students:
{
	firstName: String,
	lastName: String,
	tigerID: String,
	class: String,
	selected: Boolean
	seat: {
		row: Integer,
		column: Integer
	}
}

notes:
{
	behavior: {
		Abbreviation: String,
		Description: String,
		Weight: String
	},
	student: String,
	dateNoted: {},
	comment: String,
	type: String
}
*/

// reusable CRUD methods for NeDB
export default {
	createSomething(db, data) {
		return new Promise(function(resolve, reject) {
		    getDB(db).insert(data, function(error, insertedDocument) {
		      if (error) {
		        console.log(error)
		        reject(error)
		      } else {
		        console.log(insertedDocument)
		        resolve(insertedDocument)
		      }
		    })
	  })
	},
	readSomething(db, reference, sortQuery) {
		if (sortQuery) {
			return new Promise(function(resolve, reject) {
				getDB(db).find(reference).sort({sortQuery: -1}).exec(function(error, foundDocs) {
					if (error) {
						console.log(error)
						reject(error)
					} else {
						console.log(foundDocs)
						resolve(foundDocs)
					}
				})
			})
		} else {
			return new Promise(function(resolve, reject) {
				getDB(db).find(reference, function(error, foundDocs) {
					if (error) {
						console.log(error)
						reject(error)
					} else {
						console.log(foundDocs)
						resolve(foundDocs)
					}
				})
			})
		}
	},
	updateSomething(db, query, update) {
		return new Promise(function(resolve, reject) {
			getDB(db).update(query, update, {}, function(error, numReplaced) {
				if (error) {
					console.log(error)
					reject(error)
				} else {
					console.log(numReplaced)
					resolve(numReplaced)
				}
			})
		})
	},
	deleteSomething(db, reference) {
		return new Promise(function(resolve, reject) {
			getDB(db).remove(reference, {}, function(error, numRemoved) {
				if (error) {
					console.log(error)
					reject(error)
				} else {
					console.log(numRemoved)
					resolve(numRemoved)
				}
			})
		})
	}
}
