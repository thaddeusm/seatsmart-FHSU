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
		case 'activities':
			return remote.getGlobal('activities')
			break
		case 'activitySessions':
			return remote.getGlobal('activitySessions')
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
	selected: Boolean,
	highlight: String,
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
	dateNoted: Object,
	comment: String,
	type: String
}

activities (high-level):
{
	name: String,
	activityType: String,
	content: Object,
	options: Object,
}

activity survey:
{
	name: String,
	activityType: 'survey',
	content: {
		prompt: String,
		choices: Array (of strings)
	},
	options: {
		timeLimit: {
			enabled: Boolean,
			(minutes): Number,
			(seconds): Number
		}
	}
}

activitySessions:
{
	date: Object,
	activity: Object,
	responses: [{
		respondent: String,
		response: String
	}],
	chart: String
}
*/

// reusable CRUD methods for NeDB
export default {
	createSomething(db, data) {
		return new Promise(function(resolve, reject) {
		    getDB(db).insert(data, function(error, insertedDocument) {
		    	if (error) {
		      		reject(error)
		    	} else {
		      		resolve(insertedDocument)
		    	}
		    })
	  })
	},
	readSomething(db, reference) {
		return new Promise(function(resolve, reject) {
			getDB(db).find(reference, function(error, foundDocs) {
				if (error) {
					reject(error)
				} else {
					resolve(foundDocs)
				}
			})
		})
	},
	updateSomething(db, query, update) {
		return new Promise(function(resolve, reject) {
			getDB(db).update(query, update, {}, function(error, numReplaced) {
				if (error) {
					reject(error)
				} else {
					resolve(numReplaced)
				}
			})
		})
	},
	deleteSomething(db, reference) {
		return new Promise(function(resolve, reject) {
			getDB(db).remove(reference, {}, function(error, numRemoved) {
				if (error) {
					reject(error)
				} else {
					resolve(numRemoved)
				}
			})
		})
	}
}
