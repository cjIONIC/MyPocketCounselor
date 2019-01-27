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
            console.log("Appointment values: ", appointment);

            if(appointment.aStatus === "Pending") {
                const student = await fetchStudentName(appointment.sID);

                return Promise.all([student]).then(async function(studentName) {
                    console.log("Retrieved data: ", studentName);
                    token = await fetchDevice(appointment.cID);

                    return Promise.all([token]).then(function(deviceToken) {
                        console.log("Fetched device: ", deviceToken);

                        const name = studentName[0];
                        const device = deviceToken[0];

                        payload = {
                            notification: {
                                title: `${name} requested for an appointment`,
                                body: `${appointment.aDescription}`
                            }
                        }

                        console.log(device, " ? ", payload);

                        return admin.messaging().sendToDevice(device, payload);
                    }, (error) => console.log("Error"))
    
                }, (error) => console.log("Error"))
        
            }

            if(appointment.aStatus === "Accepted") {

                const counselor = await fetchCounselorName(appointment.cID);

                return Promise.all([counselor]).then(async function(counselorName) {
                    console.log("Retrieved data: ", counselorName);
                    token = await fetchDevice(appointment.sID);

                    return Promise.all([token]).then(function(deviceToken) {
                        console.log("Fetched device: ", deviceToken);

                        const name = counselorName[0];
                        const device = deviceToken[0];

                        payload = {
                            notification: {
                                title: `${name} made an appointment with you`,
                                body: `${appointment.aDescription}`
                            }
                        }

                        console.log(device, " ? ", payload);

                        return admin.messaging().sendToDevice(device, payload);
                    }, (error) => console.log("Error"))
    
                }, (error) => console.log("Error"));
        
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

                return Promise.all([counselor]).then(async function(counselorName) {
                    console.log("Retrieved data: ", counselorName);
                    token = await fetchDevice(after.sID);

                    return Promise.all([token]).then(function(deviceToken) {
                        console.log("Fetched device: ", deviceToken);

                        const name = counselorName[0];
                        const device = deviceToken[0];

                        payload = {
                            notification: {
                                title: `${name} accepted your request`,
                                body: `${after.aDescription}`
                            }
                        }

                        console.log(device, " ? ", payload);

                        return admin.messaging().sendToDevice(device, payload);
                    }, (error) => console.log("Error"))
    
                }, (error) => console.log("Error"))
        
            }
    
            if(after.aStatus === "Finished") {
                const counselor = await fetchCounselorName(after.cID);
                console.log("Counselor name: ", counselor);

                token = await fetchDevice(after.sID);
                return Promise.all([counselor]).then(async function(counselorName) {
                    console.log("Retrieved data: ", counselorName);
                    token = await fetchDevice(after.sID);

                    return Promise.all([token]).then(function(deviceToken) {
                        console.log("Fetched device: ", deviceToken);

                        const name = counselorName[0];
                        const device = deviceToken[0];

                        payload = {
                            notification: {
                                title: `${name} has marked your appointment finished`,
                                body: `${after.aDescription}`
                            }
                        }

                        console.log(device, " ? ", payload);

                        return admin.messaging().sendToDevice(device, payload);
                    }, (error) => console.log("Error"))
    
                }, (error) => console.log("Error"))
        
            }
    
            if(after.aStatus === "Reschedule") {
                const counselor = await fetchCounselorName(after.cID);
                console.log("Counselor name: ", counselor);

                token = await fetchDevice(after.sID);
                return Promise.all([counselor]).then(async function(counselorName) {
                    console.log("Retrieved data: ", counselorName);
                    token = await fetchDevice(after.sID);

                    return Promise.all([token]).then(function(deviceToken) {
                        console.log("Fetched device: ", deviceToken);

                        const name = counselorName[0];
                        const device = deviceToken[0];

                        payload = {
                            notification: {
                                title: `${name} has rescheduled your appointment`,
                                body: `${after.aDescription}`
                            }
                        }

                        console.log(device, " ? ", payload);

                        return admin.messaging().sendToDevice(device, payload);
                    }, (error) => console.log("Error"))
    
                }, (error) => console.log("Error"))
        
            }
    
            //sends notification
            return admin.messaging().sendToDevice(token, payload);
        })

        
exports.newMessageNotification = functions.database
        .ref('/message/{messageID}')
        .onCreate(async(snapshot, context) => {
            const messageID = context.params.messageID;

            console.log(`New message ${messageID}`);
            let payload;

            const message = snapshot.val();
            console.log("Message values: ", message);

            if(message.mType === "Student") {
                const students = await fetchStudentName(message.sID);
                console.log("Student name: ", students);

                return Promise.all([students]).then(async function(studentName) {
                    console.log("Fetched student name: ", studentName);

                    let name, device;

                    const token = await fetchDevice(message.cID);

                    return Promise.all([token]).then(function(deviceToken) {
                        console.log("Fetched device: ", deviceToken);
                        name = studentName[0];
                        device = deviceToken[0];
                        
                        payload = {
                            notification: {
                                title: `${name}`,
                                body: `${message.mDescription}`
                            }
                        }

                        //sends notification
                        return admin.messaging().sendToDevice(device, payload);
                    }, (error) => console.log("Error"))

                }, (error) => console.log("Error"))
                
            } else {
                const counselors = await fetchCounselorName(message.cID);
                console.log("Counselor name: ", counselors);

                return Promise.all([counselors]).then(async function(counselorName) {
                    console.log("Fetched student name: ", counselorName);

                    let name, device;

                    const token = await fetchDevice(message.sID);

                    return Promise.all([token]).then(function(deviceToken) {
                        console.log("Fetched device: ", deviceToken);
                        name = counselorName[0];
                        device = deviceToken[0];
                        
                        payload = {
                            notification: {
                                title: `${name}`,
                                body: `${message.mDescription}`
                            }
                        }

                        //sends notification
                        return admin.messaging().sendToDevice(device, payload);
                    }, (error) => console.log("Error"))

                }, (error) => console.log("Error"))
            }

        })


exports.newRegistrationNotificationForCounselor = functions.database
        .ref('/registration/{registrationID}')
        .onCreate(async(snapshot, context) => {
            const registrationID = context.params.registrationID;

            console.log(`New message ${registrationID}`);
            let payload;

            const registration = snapshot.val();
            console.log("Registration for COUNSELOR values: ", registration);

            const student = registration.rLastName + ", " + registration.rFirstName;
            const counselorID = await fetchAcademicUnitCounselor(registration.acID);

            return Promise.all([counselorID]).then(async function(id) {
                console.log("Fetched ID: ", id);

                let counselor = id[0], device;
                const token = await fetchDevice(counselor);

                return Promise.all([token]).then(function(deviceToken) {
                    device = deviceToken[0];

                    payload = {
                        notification: {
                            title: ` New registration request`,
                            body: `${student} request for registration.`
                        }
                    }

                    return admin.messaging().sendToDevice(device, payload);
                }, (error) => console.log("Error"))

            }, (error) => console.log("Error"))
        })

exports.newRegistrationNotificationForGTDHead = functions.database
        .ref('/registration/{registrationID}')
        .onCreate(async(snapshot, context) => {
            const registrationID = context.params.registrationID;

            console.log(`New message ${registrationID}`);
            let payload;

            const registration = snapshot.val();
            console.log("Registration for COUNSELOR values: ", registration);

            const student = registration.rLastName + ", " + registration.rFirstName;
            const counselorID = await fetchGTDHead();

            return Promise.all([counselorID]).then(async function(id) {
                console.log("Fetched ID: ", id);

                let counselor = id[0], device;
                const token = await fetchDevice(counselor);

                return Promise.all([token]).then(function(deviceToken) {
                    device = deviceToken[0];

                    payload = {
                        notification: {
                            title: ` New registration request`,
                            body: `${student} request for registration.`
                        }
                    }

                    return admin.messaging().sendToDevice(device, payload);
                }, (error) => console.log("Error"))

            }, (error) => console.log("Error"))
        })

function fetchCounselorName(id) {
    console.log("Fetched ID: ", id);

    return new Promise (function(resolve) {

        return admin.database()
        .ref(`/counselor`)
        .orderByChild("cID")
        .equalTo(id)
        .once("value", (snapshot) => {
            let counselors;

            snapshot.forEach(counselor => {
                counselors = counselor.val();

                return false;
            })

            const name = counselors.cLastName + ", " + counselors.cFirstName;

            resolve(name);
        }, () => resolve(null));
    });

}

function fetchStudentName(id) {
    console.log("Fetched ID: ", id);

    return new Promise (function(resolve) {

        return admin.database()
        .ref(`/student`)
        .orderByChild("sID")
        .equalTo(id)
        .once("value", (snapshot) => {
            let students;

            snapshot.forEach(student => {
                students = student.val();

                return false;
            })

            const name = students.sLastName + ", " + students.sFirstName;

            resolve(name);
        }, () => resolve(null))
    });
    
}

function fetchAcademicUnitCounselor(id) {
    console.log("Fetched ID: ", id);

    return new Promise (function(resolve) {

        return admin.database()
        .ref(`/academic`)
        .orderByChild("acID")
        .equalTo(id)
        .once("value", (snapshot) => {
            let academics;

            snapshot.forEach(academic => {
                academics = academic.val();

                return false;
            })

            resolve(academics.cID);
        }, () => resolve(null))
    });
}

function fetchGTDHead() {

    return new Promise (function(resolve) {

        return admin.database()
        .ref(`/academic`)
        .orderByChild("acID")
        .equalTo(1)
        .once("value", (snapshot) => {
            let academics;

            snapshot.forEach(academic => {
                academics = academic.val();

                return false;
            })

            resolve(academics.cID);
        }, () => resolve(null))
    });
}

function fetchDevice(id) {
     console.log("Fetched ID: ", id);

    return new Promise (function(resolve) {

        return admin.database()
        .ref(`/device`)
        .orderByChild("dUserID")
        .equalTo(id)
        .once("value", (snapshot) => {
            let devices;

            snapshot.forEach(device => {
                devices = device.val();

                return false;
            })

            resolve(devices.dToken);
        }, () => resolve(null))
    });
}
