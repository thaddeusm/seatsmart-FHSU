![Seatsmart Icon](https://seatsmart.tech/img/logo.b38f8b88.svg)

# Seatsmart (FHSU)
Seatsmart offers a convenient way to implement classroom
participation guidance by the Department of English at Fort Hays State 
University for courses conducted at campuses in China.  

## Application Scope
*The application is under active development.  [Read the roadmap](https://github.com/thaddeusm/seatsmart-FHSU/wiki/Development-Roadmap-(Academic-Year-2019-2020)).*

Internet connection stability is a serious concern for faculty.  In addition, 
the application deals with student records related to participation, which 
should be stored securely.  Seatsmart is designed to be offline-first, with all 
data stored on the user's machine.  This storage is transparently located in the 
default OS documents folder, which is separate from application files.  This 
allows the user to update (replace) the application without impacting partication records.

When Internet access is available, instructors can use the 
[Remote](https://github.com/thaddeusm/seatsmart-remote) feature to 
access basic features from a mobile device.  They can also engage with students
in [Activities](https://github.com/thaddeusm/seatsmart-activities) for 
realtime formative assessments.  Data is encrypted during transport 
and this information is not stored in any cloud database.  This is powered by a 
[realtime server](https://github.com/thaddeusm/seatsmart-remote-server) on the backend.

Every attempt is made to ensure design and UX consistency for PC and Mac, the 
operating systems currently used by faculty.  However, desktop (larger) screen 
sizes are given less priority as faculty are provided or rely upon laptop computers.  An 
additional effort has been made to support OSX-specific APIs such as the touchbar, 
recognizing that faculty members who have chosen to purchase their own computers 
have sometimes selected more advanced Apple computers with this feature.

## Core Dependencies
### Electron JS
[repo](https://github.com/electron/electron)

Electron allows the application to be packaged and installed for offline use with a 
more native OS experience for Seatsmart users.  It essentially wraps a browser-based 
application within a basic browser environment (Chromium) with platform-specific 
APIs.  Both PC and Mac users can enjoy a similar application experience with a single 
codebase.  Electron was chosen over alternatives due to its maturity, solid support, 
and active community.

### Vue JS
[repo](https://github.com/vuejs/vue)

Vue is a growing JavaScript framework for user interfaces in the browser.  Seatsmart 
uses CLI tools such as .vue files to organize the application in terms of interface 
components.  State management (Vuex) and routing (Vue Router) help make the codebase 
readable and easy to build upon.  Localization is another strength of this framework, 
with its Chinese documentation and developer community of particular relevance given 
the context of Seatsmart users.

### SheetJS
[repo](https://github.com/SheetJS/js-xlsx)

SheetJS allows FHSU class rosters to be imported directly as a convenience for instructors.  
Presumably, other institutions provide rosters/course information in XLSX format. 
Though its implementation in this repo is specific to the format of FHSU's rosters, 
this could be refactored in forked projects for other institutional settings.

## Development Timeline
Seatsmart was designed and developed to enhance face-to-face (traditional) course delivery. As courses have moved online during the COVID-19 pandemic, features may be introduced to make Seatsmart useful in this new medium.

## Design Concepts and Inspiration
[mockups @Figma](https://www.figma.com/file/OxI3WKOFswThYuEfOR6UaV7V/Seatsmart)

At its core, Seatsmart is a simple implementation of instructor classroom management 
practices that are considered effective for courses conducted at FHSU satellite campuses 
in China.  Paper-based seating charts with spaces for annotation have been in use for 
some time and are still the preferred choice for many faculty members.  Seatsmart 
offers a digital alternative as a convenience, while striving to add features that are 
difficult to implement in analog (e.g. trend calculations, randomization, etc.).  The choice of colors and typography is meant to fit the university context (adult learners).

New York City Metro signs were of particular inspiration, which feature circular icons 
with solid colors.  The color palette is based upon FHSU branding colors, with the choice 
of red as a standard alert indicator.

Seatsmart strives to be [Humane by Design](https://humanebydesign.com).

## Running / Building on a Local Machine
### to install dependencies
```
$ npm install
```
or
```
$ yarn
```

### to serve the application during development
```
$ npm electron:serve
```
or
```
$ yarn electron:serve
```

### to build the application on your platform (PC/Mac)
```
$ npm electron:build
```
or
```
$ yarn electron:build
```
