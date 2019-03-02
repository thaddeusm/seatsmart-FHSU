const { app } = require('electron').remote
const fs = require('fs')

// get path to native documents folder
const userData = app.getPath('userData')
const preferencesFile = userData + '/preferences.json'

export default {
	getPreferences() {
		return new Promise((resolve, reject) => {
				fs.readFile(preferencesFile, 'utf8', (err, data) => {
					if (data === 'undefined' || err) {
						let obj = {
							progress: [],
							calculation: 'balanced',
							positiveBehaviors: [
								{
									Abbreviation: 'A',
									Description: 'Answered a Question',
									Weight: 'medium'
								},
								{
									Abbreviation: 'H',
									Description: 'Helped a Classmate',
									Weight: 'medium'
								}
							],
							negativeBehaviors: [
								{
									Abbreviation: 'A',
									Description: 'Absent',
									Weight: 'strong'
								},
								{
									Abbreviation: 'L',
									Description: 'Arrived to Class Late',
									Weight: 'medium'
								},
								{
									Abbreviation: 'C',
									Description: 'Distracted by Cellphone',
									Weight: 'medium'
								}
							],
							behaviorToTally: '(-) Absent'
						}

						this.setPreferences(obj)
						resolve(obj)
					} else {
						resolve(JSON.parse(data))
					}
			})
		})
	},
	setPreferences(newPreferences) {
		let jsonObj = JSON.stringify(newPreferences)

		return new Promise((resolve, reject) => {
			fs.writeFile(preferencesFile, jsonObj, 'utf8', this.getPreferences)
		})
	}
}
