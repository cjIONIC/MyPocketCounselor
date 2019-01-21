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
    if (appointment.aStatus === "Pending") {
        const student = yield fetchStudentName(appointment.sID);
        console.log("Student name: ", student);
        token = yield fetchDevice(appointment.cID);
        payload = {
            notification: {
                title: ` ${student} requested for an appointment`,
                body: `${appointment.aDescription}`
            }
        };
    }
    if (appointment.aStatus === "Accepted") {
        const counselor = yield fetchCounselorName(appointment.cID);
        console.log("Student name: ", counselor);
        token = yield fetchDevice(appointment.sID);
        payload = {
            notification: {
                title: ` ${counselor} made an appointment with you`,
                body: `${appointment.aDescription}`
            }
        };
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
        console.log("Counselor name: ", counselor);
        token = yield fetchDevice(after.sID);
        payload = {
            notification: {
                title: ` ${counselor} accepted your request`,
                body: `${after.aDescription}`
            }
        };
    }
    if (after.aStatus === "Finished") {
        const counselor = yield fetchCounselorName(after.cID);
        console.log("Counselor name: ", counselor);
        token = yield fetchDevice(after.sID);
        payload = {
            notification: {
                title: ` ${counselor} has marked your appointment finished`,
                body: `${after.aDescription}`
            }
        };
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
    if (message.mType === "Student") {
        const student = yield fetchStudentName(message.sID);
        console.log("Student name: ", student);
        token = yield fetchDevice(message.cID);
        payload = {
            notification: {
                title: `${student}`,
                body: `${message.mDescription}`
            }
        };
    }
    else {
        const counselor = yield fetchCounselorName(message.cID);
        console.log("Student name: ", counselor);
        token = yield fetchDevice(message.sID);
        payload = {
            notification: {
                title: ` ${counselor}`,
                body: `${message.mDescription}`
            }
        };
    }
    //sends notification
    return admin.messaging().sendToDevice(token, payload);
}));
exports.newRegistrationNotificationForCounselor = functions.database
    .ref('/registration/{registrationID}')
    .onCreate((snapshot, context) => __awaiter(this, void 0, void 0, function* () {
    const registrationID = context.params.registrationID;
    console.log(`New message ${registrationID}`);
    let token, payload;
    const registration = snapshot.val();
    const student = registration.rLastName + ", " + registration.rFirstName;
    const counselorID = yield fetchAcademicUnitCounselor(registration.acID);
    token = yield fetchDevice(counselorID);
    payload = {
        notification: {
            title: ` New registration request`,
            body: `${student} request for registration.`
        }
    };
    //sends notification
    return admin.messaging().sendToDevice(token, payload);
}));
exports.newRegistrationNotificationForGTDHead = functions.database
    .ref('/registration/{registrationID}')
    .onCreate((snapshot, context) => __awaiter(this, void 0, void 0, function* () {
    const registrationID = context.params.registrationID;
    console.log(`New message ${registrationID}`);
    let token, payload;
    const registration = snapshot.val();
    const student = registration.rLastName + ", " + registration.rFirstName;
    const counselorID = yield fetchGTDHead();
    token = yield fetchDevice(counselorID);
    payload = {
        notification: {
            title: ` New registration request`,
            body: `${student} request for registration.`
        }
    };
    //sends notification
    return admin.messaging().sendToDevice(token, payload);
}));
function fetchCounselorName(id) {
    return admin.database()
        .ref('/counselor')
        .orderByChild("cID").equalTo(id)
        .once('value').then((snapshot) => __awaiter(this, void 0, void 0, function* () {
        return snapshot.val().cLastName + ", " + snapshot.val().cFirstName;
    }));
}
function fetchStudentName(id) {
    return admin.database()
        .ref('/student')
        .orderByChild("sID").equalTo(id)
        .once('value').then((snapshot) => __awaiter(this, void 0, void 0, function* () {
        return snapshot.val().sLastName + ", " + snapshot.val().sFirstName;
    }));
}
function fetchAcademicUnitCounselor(id) {
    return admin.database()
        .ref('/academic')
        .orderByChild("acID").equalTo(id)
        .once('value').then((snapshot) => __awaiter(this, void 0, void 0, function* () {
        return snapshot.val().cID;
    }));
}
function fetchGTDHead() {
    return admin.database()
        .ref('/academic')
        .orderByChild("acCode").equalTo("Guidance Center")
        .once('value').then((snapshot) => __awaiter(this, void 0, void 0, function* () {
        return snapshot.val().cID;
    }));
}
function fetchDevice(id) {
    return admin.database()
        .ref('/device')
        .orderByChild("dUserID").equalTo(id)
        .once('value').then(function (snapshot) {
        return snapshot.val().dToken;
    });
}
//# sourceMappingURL=index.js.map