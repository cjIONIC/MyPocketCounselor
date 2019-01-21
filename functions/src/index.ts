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
        .onCreate(async (snapshot, context) => {
            const appointmentID = context.params.appointmentID;

            console.log(`New message ${appointmentID}`);
            let token, payload;

            const appointment = snapshot.val();

            if(appointment.aStatus === "Pending") {
                const student = await fetchStudentName(appointment.sID);
                console.log("Student name: ", student);
                token = await fetchDevice(appointment.cID);

                payload = {
                    notification: {
                        title: ` ${student} requested for an appointment`,
                        body: `${appointment.aDescription}`
                    }
                }
        
            }

            if(appointment.aStatus === "Accepted") {
                const counselor = await fetchCounselorName(appointment.cID);
                console.log("Student name: ", counselor);
                token = await fetchDevice(appointment.sID);

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
        .onUpdate(async(change, context) => {
            const before = change.before.val();
            const after = change.after.val();
    
            let token, payload;
    
            if(before.aStatus === after.aStatus) {
                console.log("No changes");
                return null;
            }
    
            if(after.aStatus === "Accepted") {
                const counselor = await fetchCounselorName(after.cID);
                console.log("Counselor name: ", counselor);
                token = await fetchDevice(after.sID);
    
                payload = {
                    notification: {
                        title: ` ${counselor} accepted your request`,
                        body: `${after.aDescription}`
                    }
                }
        
            }
    
            if(after.aStatus === "Finished") {
                const counselor = await fetchCounselorName(after.cID);
                console.log("Counselor name: ", counselor);
                token = await fetchDevice(after.sID);
    
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

        exports.newMessageNotification = functions.database
                .ref('/message/{messageID}')
                .onCreate(async(snapshot, context) => {
                    const messageID = context.params.messageID;
        
                    console.log(`New message ${messageID}`);
                    let token, payload;
        
                    const message = snapshot.val();

                    if(message.mType === "Student") {
                        const student = await fetchStudentName(message.sID);
                        console.log("Student name: ", student);
                        token = await fetchDevice(message.cID);
        
                        payload = {
                            notification: {
                                title: `${student}`,
                                body: `${message.mDescription}`
                            }
                        }
                    } else {
                        const counselor = await fetchCounselorName(message.cID);
                        console.log("Student name: ", counselor);
                        token = await fetchDevice(message.sID);
        
                        payload = {
                            notification: {
                                title: ` ${counselor}`,
                                body: `${message.mDescription}`
                            }
                        }
                    }
        
                    //sends notification
                    return admin.messaging().sendToDevice(token, payload);
                })

exports.newRegistrationNotificationForCounselor = functions.database
        .ref('/registration/{registrationID}')
        .onCreate(async(snapshot, context) => {
            const registrationID = context.params.registrationID;

            console.log(`New message ${registrationID}`);
            let token, payload;

            const registration = snapshot.val();

            const student = registration.rLastName + ", " + registration.rFirstName;
            const counselorID = await fetchAcademicUnitCounselor(registration.acID);
            token = await fetchDevice(counselorID);
        
            payload = {
                notification: {
                    title: ` New registration request`,
                    body: `${student} request for registration.`
                }
            }

            //sends notification
            return admin.messaging().sendToDevice(token, payload);
        })

exports.newRegistrationNotificationForGTDHead = functions.database
        .ref('/registration/{registrationID}')
        .onCreate(async(snapshot, context) => {
            const registrationID = context.params.registrationID;

            console.log(`New message ${registrationID}`);
            let token, payload;

            const registration = snapshot.val();

            const student = registration.rLastName + ", " + registration.rFirstName;
            const counselorID = await fetchGTDHead();
            token = await fetchDevice(counselorID);
        
            payload = {
                notification: {
                    title: ` New registration request`,
                    body: `${student} request for registration.`
                }
            }

            //sends notification
            return admin.messaging().sendToDevice(token, payload);
        })

function fetchCounselorName(id) {
    return admin.database()
        .ref('/counselor')
        .orderByChild("cID").equalTo(id)
        .once('value').then(async snapshot => {
            return snapshot.val().cLastName + ", " + snapshot.val().cFirstName;
        })
}

function fetchStudentName(id) {
    return admin.database()
        .ref('/student')
        .orderByChild("sID").equalTo(id)
        .once('value').then(async snapshot => {
            return snapshot.val().sLastName + ", " + snapshot.val().sFirstName;
        })
}

function fetchAcademicUnitCounselor(id) {
    return admin.database()
        .ref('/academic')
        .orderByChild("acID").equalTo(id)
        .once('value').then(async snapshot => {
            return snapshot.val().cID;
        })
}

function fetchGTDHead() {
    return admin.database()
        .ref('/academic')
        .orderByChild("acCode").equalTo("Guidance Center")
        .once('value').then(async snapshot => {
            return snapshot.val().cID;
        })
}

function fetchDevice(id) {
    return admin.database()
        .ref('/device')
        .orderByChild("dUserID").equalTo(id)
        .once('value').then(function(snapshot) {
            return snapshot.val().dToken;
        })
}
