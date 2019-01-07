const { app } = require('electron').remote;

import Datastore from 'nedb'

const userDocs = app.getPath('documents');

const courses = new Datastore({
	filename: `${userDocs}/courses.db`,
	autoload: true
});

const students = new Datastore({
	filename: `${userDocs}/students.db`,
	autoload: true
});

const seats = new Datastore({
	filename: `${userDocs}/seats.db`,
	autoload: true
});

const notes = new Datastore({
	filename: `${userDocs}/notes.db`,
	autoload: true
});

function getDB(name) {
	switch(name) {
		case 'courses':
			return courses;
			break;
		case 'students':
			return students;
			break;
		case 'seats':
			return seats;
			break;
		case 'notes':
			return notes;
			break;
	}
}

export default {
	createSomething(db, data) {
		return new Promise(function(resolve, reject) {
		    getDB(db).insert(data, function(error, insertedDocument) {
		      if (error) {
		        console.log(error);
		        reject(error);
		      } else {
		        console.log(insertedDocument);
		        resolve(insertedDocument);
		      }
		    });
	  });
	},
	readSomething(db, reference) {
		return new Promise(function(resolve, reject) {
			getDB(db).find(reference, function(error, foundDocs) {
				if (error) {
					console.log(error);
					reject(error);
				} else {
					console.log(foundDocs);
					resolve(foundDocs);
				}
			})
		})
	},
	updateSomething(db, update) {
		return new Promise(function(resolve, reject) {
			getDB(db).update(original, update, {}, function(error, numReplaced) {
				if (error) {
					console.log(error);
					reject(error);
				} else {
					console.log(numReplaced);
					resolve(numReplaced);
				}
			})
		});
	},
	deleteSomething(db, reference) {
		return new Promise(function(resolve, reject) {
			getDB(db).remove(reference, {}, function(error, numRemoved) {
				if (error) {
					console.log(error);
					reject(error);
				} else {
					console.log(numRemoved);
					resolve(numRemoved);
				}
			})
		});
	}
}
