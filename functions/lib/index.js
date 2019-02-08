"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });
const admin = require("firebase-admin");
admin.initializeApp(functions.config().firebase);
exports.addAppointmentNotificaton = functions.database
    .ref('/appointment/{appointmentID}')
    .onCreate((snapshot, context) => __awaiter(this, void 0, void 0, function* () {
    const appointmentID = context.params.appointmentID;
    console.log(`New message ${appointmentID}`);
    let token, payload;
    const appointment = snapshot.val();
    console.log("Appointment values: ", appointment);
    if (appointment.aStatus === "Pending") {
        const student = yield fetchStudentName(appointment.sID);
        return Promise.all([student]).then(function (studentName) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Retrieved data: ", studentName);
                token = yield fetchDevice(appointment.cID);
                return Promise.all([token]).then(function (deviceToken) {
                    console.log("Fetched device: ", deviceToken);
                    const name = studentName[0];
                    const device = deviceToken[0];
                    payload = {
                        notification: {
                            title: `${name} requested for an appointment`,
                            body: `${appointment.aDescription}`
                        }
                    };
                    console.log(device, " ? ", payload);
                    return admin.messaging().sendToDevice(device, payload);
                }, (error) => console.log("Error"));
            });
        }, (error) => console.log("Error"));
    }
    if (appointment.aStatus === "Added") {
        const counselor = yield fetchCounselorName(appointment.cID);
        return Promise.all([counselor]).then(function (counselorName) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Retrieved data: ", counselorName);
                token = yield fetchDevice(appointment.sID);
                return Promise.all([token]).then(function (deviceToken) {
                    console.log("Fetched device: ", deviceToken);
                    const name = counselorName[0];
                    const device = deviceToken[0];
                    payload = {
                        notification: {
                            title: `${name} made an appointment with you`,
                            body: `${appointment.aDescription}`
                        }
                    };
                    console.log(device, " ? ", payload);
                    return admin.messaging().sendToDevice(device, payload);
                }, (error) => console.log("Error"));
            });
        }, (error) => console.log("Error"));
    }
    //sends notification
    return admin.messaging().sendToDevice(token, payload);
}));
exports.updateAppointmentNotification = functions.database
    .ref('/appointment/{appointmentID}')
    .onUpdate((change, context) => __awaiter(this, void 0, void 0, function* () {
    const before = change.before.val();
    const after = change.after.val();
    let token, payload;
    if (before.aStatus === after.aStatus) {
        console.log("No changes");
        return null;
    }
    if (after.aStatus === "Accepted") {
        const counselor = yield fetchCounselorName(after.cID);
        return Promise.all([counselor]).then(function (counselorName) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Retrieved data: ", counselorName);
                token = yield fetchDevice(after.sID);
                return Promise.all([token]).then(function (deviceToken) {
                    console.log("Fetched device: ", deviceToken);
                    const name = counselorName[0];
                    const device = deviceToken[0];
                    payload = {
                        notification: {
                            title: `${name} accepted your request`,
                            body: `${after.aDescription}`
                        }
                    };
                    console.log(device, " ? ", payload);
                    return admin.messaging().sendToDevice(device, payload);
                }, (error) => console.log("Error"));
            });
        }, (error) => console.log("Error"));
    }
    if (after.aStatus === "Finished") {
        const counselor = yield fetchCounselorName(after.cID);
        console.log("Counselor name: ", counselor);
        token = yield fetchDevice(after.sID);
        return Promise.all([counselor]).then(function (counselorName) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Retrieved data: ", counselorName);
                token = yield fetchDevice(after.sID);
                return Promise.all([token]).then(function (deviceToken) {
                    console.log("Fetched device: ", deviceToken);
                    const name = counselorName[0];
                    const device = deviceToken[0];
                    payload = {
                        notification: {
                            title: `${name} has marked your appointment finished`,
                            body: `${after.aDescription}`
                        }
                    };
                    console.log(device, " ? ", payload);
                    return admin.messaging().sendToDevice(device, payload);
                }, (error) => console.log("Error"));
            });
        }, (error) => console.log("Error"));
    }
    //sends notification
    return admin.messaging().sendToDevice(token, payload);
}));
exports.newMessageNotification = functions.database
    .ref('/message/{messageID}')
    .onCreate((snapshot, context) => __awaiter(this, void 0, void 0, function* () {
    const messageID = context.params.messageID;
    console.log(`New message ${messageID}`);
    let token, payload;
    const message = snapshot.val();
    console.log("Message values: ", message);
    if (message.mType === "Student") {
        const students = yield fetchStudentName(message.sID);
        console.log("Student name: ", students);
        return Promise.all([students]).then(function (studentName) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Fetched student name: ", studentName);
                let name;
                token = yield fetchDevice(message.cID);
                return Promise.all([token]).then(function (deviceToken) {
                    console.log("Fetched device: ", deviceToken);
                    name = studentName[0];
                    const device = deviceToken[0];
                    payload = {
                        notification: {
                            title: `${name}`,
                            body: `${message.mDescription}`
                        }
                    };
                    //sends notification
                    return admin.messaging().sendToDevice(device, payload);
                }, (error) => console.log("Error"));
            });
        }, (error) => console.log("Error"));
    }
    else {
        const counselors = yield fetchCounselorName(message.cID);
        console.log("Counselor name: ", counselors);
        return Promise.all([counselors]).then(function (counselorName) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Fetched student name: ", counselorName);
                let name;
                token = yield fetchDevice(message.sID);
                return Promise.all([token]).then(function (deviceToken) {
                    console.log("Fetched device: ", deviceToken);
                    name = counselorName[0];
                    const device = deviceToken[0];
                    payload = {
                        notification: {
                            title: `${name}`,
                            body: `${message.mDescription}`
                        }
                    };
                    //sends notification
                    return admin.messaging().sendToDevice(device, payload);
                }, (error) => console.log("Error"));
            });
        }, (error) => console.log("Error"));
    }
}));
exports.newRegistrationNotificationForCounselor = functions.database
    .ref('/registration/{registrationID}')
    .onCreate((snapshot, context) => __awaiter(this, void 0, void 0, function* () {
    const registrationID = context.params.registrationID;
    console.log(`New message ${registrationID}`);
    let token, payload;
    const registration = snapshot.val();
    console.log("Registration for COUNSELOR values: ", registration);
    const student = registration.rLastName + ", " + registration.rFirstName;
    const counselorID = yield fetchAcademicUnitCounselor(registration.acID);
    return Promise.all([counselorID]).then(function (id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Fetched ID: ", id);
            const counselor = id[0];
            token = yield fetchDevice(counselor);
            return Promise.all([token]).then(function (deviceToken) {
                const device = deviceToken[0];
                payload = {
                    notification: {
                        title: ` New registration request`,
                        body: `${student} request for registration.`
                    }
                };
                return admin.messaging().sendToDevice(device, payload);
            }, (error) => console.log("Error"));
        });
    }, (error) => console.log("Error"));
}));
exports.newRegistrationNotificationForGTDHead = functions.database
    .ref('/registration/{registrationID}')
    .onCreate((snapshot, context) => __awaiter(this, void 0, void 0, function* () {
    const registrationID = context.params.registrationID;
    console.log(`New message ${registrationID}`);
    let token, payload;
    const registration = snapshot.val();
    console.log("Registration for COUNSELOR values: ", registration);
    const student = registration.rLastName + ", " + registration.rFirstName;
    const counselorID = yield fetchGTDHead();
    return Promise.all([counselorID]).then(function (id) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Fetched ID: ", id);
            const counselor = id[0];
            token = yield fetchDevice(counselor);
            return Promise.all([token]).then(function (deviceToken) {
                const device = deviceToken[0];
                payload = {
                    notification: {
                        title: ` New registration request`,
                        body: `${student} request for registration.`
                    }
                };
                return admin.messaging().sendToDevice(device, payload);
            }, (error) => console.log("Error"));
        });
    }, (error) => console.log("Error"));
}));
function fetchCounselorName(id) {
    console.log("Fetched ID: ", id);
    return new Promise(function (resolve) {
        return admin.database()
            .ref(`/counselor`)
            .orderByChild("cID")
            .equalTo(id)
            .once("value", (snapshot) => {
            let counselors;
            snapshot.forEach(counselor => {
                counselors = counselor.val();
                return false;
            });
            const name = counselors.cLastName + ", " + counselors.cFirstName;
            resolve(name);
        }, () => resolve(null));
    });
}
function fetchStudentName(id) {
    console.log("Fetched ID: ", id);
    return new Promise(function (resolve) {
        return admin.database()
            .ref(`/student`)
            .orderByChild("sID")
            .equalTo(id)
            .once("value", (snapshot) => {
            let students;
            snapshot.forEach(student => {
                students = student.val();
                return false;
            });
            const name = students.sLastName + ", " + students.sFirstName;
            resolve(name);
        }, () => resolve(null));
    });
}
function fetchAcademicUnitCounselor(id) {
    console.log("Fetched ID: ", id);
    return new Promise(function (resolve) {
        return admin.database()
            .ref(`/academic`)
            .orderByChild("acID")
            .equalTo(id)
            .once("value", (snapshot) => {
            let academics;
            snapshot.forEach(academic => {
                academics = academic.val();
                return false;
            });
            resolve(academics.cID);
        }, () => resolve(null));
    });
}
function fetchGTDHead() {
    return new Promise(function (resolve) {
        return admin.database()
            .ref(`/academic`)
            .orderByChild("acID")
            .equalTo(1)
            .once("value", (snapshot) => {
            let academics;
            snapshot.forEach(academic => {
                academics = academic.val();
                return false;
            });
            resolve(academics.cID);
        }, () => resolve(null));
    });
}
function fetchDevice(id) {
    console.log("Fetched ID: ", id);
    return new Promise(function (resolve) {
        return admin.database()
            .ref(`/device`)
            .orderByChild("dUserID")
            .equalTo(id)
            .once("value", (snapshot) => {
            let devices;
            snapshot.forEach(device => {
                devices = device.val();
                return false;
            });
            resolve(devices.dToken);
        }, () => resolve(null));
    });
}
//# sourceMappingURL=index.js.map