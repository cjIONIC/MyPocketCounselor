import * as functions from 'firebase-functions';

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

import * as admin from 'firebase-admin'; 

admin.initializeApp(functions.config().firebase);

    exports.addAppointmentNotificaton = functions.database
        .ref('/appointment/{appointmentID}')
        .onCreate((snapshot, context) => {
            const appointmentID = context.params.appointmentID;

            console.log(`New message ${appointmentID}`);
            let token, payload;

            const appointment = snapshot.val();

            if(appointment.aStatus === "Pending") {
                const student = fetchStudentName(appointment.sID);
                console.log("Student name: ", student);
                token = fetchDevice(appointment.cID);

                payload = {
                    notification: {
                        title: ` ${student} requested for an appointment`,
                        body: `${appointment.aDescription}`
                    }
                }
        
            }

            if(appointment.aStatus === "Accepted") {
                const counselor = fetchCounselorName(appointment.cID);
                console.log("Student name: ", counselor);
                token = fetchDevice(appointment.sID);

                payload = {
                    notification: {
                        title: ` ${counselor} made an appointment with you`,
                        body: `${appointment.aDescription}`
                    }
                }
        
            }
            

            //sends notification
            return admin.messaging().sendToDevice(token, payload);
        })

    exports.updateAppointmentNotification = functions.database
        .ref('/appointment/{appointmentID}')
        .onUpdate((change, context) => {
            const before = change.before.val();
            const after = change.after.val();
    
            let token, payload;
    
            if(before.aStatus === after.aStatus) {
                console.log("No changes");
                return null;
            }
    
            if(after.aStatus === "Accepted") {
                const counselor = fetchCounselorName(after.cID);
                console.log("Counselor name: ", counselor);
                token = fetchDevice(after.sID);
    
                payload = {
                    notification: {
                        title: ` ${counselor} accepted your request`,
                        body: `${after.aDescription}`
                    }
                }
        
            }
    
            if(after.aStatus === "Finished") {
                const counselor = fetchCounselorName(after.cID);
                console.log("Counselor name: ", counselor);
                token = fetchDevice(after.sID);
    
                payload = {
                    notification: {
                        title: ` ${counselor} has marked your appointment finished`,
                        body: `${after.aDescription}`
                    }
                }
        
            }
    
            //sends notification
            return admin.messaging().sendToDevice(token, payload);
        })

function fetchCounselorName(id) {
    return admin.database()
        .ref('/counselor/{counselorID}')
        .orderByChild("cID").equalTo(id)
        .once('value').then(function(snapshot) {
            return snapshot.val().cLastName + ", " + snapshot.val().cFirstName;
        })
}

function fetchStudentName(id) {
    return admin.database()
        .ref('/student/{studentID}')
        .orderByChild("sID").equalTo(id)
        .once('value').then(function(snapshot) {
            return snapshot.val().sLastName + ", " + snapshot.val().sFirstName;
        })
}

function fetchDevice(id) {
    return admin.database()
        .ref('/device/{deviceID}')
        .orderByChild("dUserID").equalTo(id)
        .once('value').then(function(snapshot) {
            return snapshot.val().dToken;
        })
}