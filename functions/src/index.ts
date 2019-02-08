import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

admin.initializeApp(functions.config().firebase);

exports.addAppointmentNotification = functions.database
    .ref('/appointment/{appointmentID}')
    .onCreate(async (snapshot, context) => {

        return;
    })
 