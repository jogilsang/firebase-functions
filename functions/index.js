/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// TODO(DEVELOPER): Import the Cloud Functions for Firebase and the Firebase Admin modules here.

// TODO(DEVELOPER): Write the addWelcomeMessages Function here.

// TODO(DEVELOPER): Write the blurOffensiveImages Function here.

// TODO(DEVELOPER): Write the sendNotifications Function here.

// [START import]
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp()
const spawn = require('child-process-promise').spawn;
const path = require('path');
const os = require('os');
const fs = require('fs');
// [END import]

// 액셀 불러오기
//var Excel = require('exceljs');
var XLSX = require('xlsx');

// request가 온다면, 스토리지 파일을 불러옴
// 해당 파일을 불러와서 읽은 다음 파이어스토어에 저장



// excelAdd, excelGet 이라는 폴더를 만들자
// 실시간 데이터베이스에 메세지를 저장함
exports.addXlsxToFirestore = functions.storage.object().onFinalize(async (object) => {

    // [START eventAttributes]
    const fileBucket = object.bucket; // The Storage bucket that contains the file.
    const filePath = object.name; // File path in the bucket.
    const contentType = object.contentType; // File content type.
    const metageneration = object.metageneration; // Number of times metadata has been generated. New objects have a value of 1.
    // [END eventAttributes]

    if (!contentType.startsWith('file/')) {
        return console.log('This is not an file.');
    }
    const fileName = path.basename(filePath);
    // [END stopConditions]

    // [START thumbnailGeneration]
    // Download file from bucket.
    const bucket = admin.storage().bucket(fileBucket);
    const tempFilePath = path.join(os.tmpdir(), fileName);
    const metadata = {
        contentType: contentType,
    };

    await bucket.file(filePath).download({ destination: tempFilePath });
    console.log('File downloaded locally to', tempFilePath);

    // TODO : 액셀 파일 
    // 액셀 파일을 읽는다.
    var workbook = XLSX.readFile(fileName);
    var sheetNames = workbook.SheetNames;
    
    var sheetIndex = 1;
    
    var df = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[sheetIndex-1]]);
    console.log(df);

    // json으로 바꾸던지 해서, 파이어스토어에 올린다.
    // Generate a thumbnail using ImageMagick.
    //await spawn('convert', [tempFilePath, '-thumbnail', '200x200>', tempFilePath]);
    //console.log('Thumbnail created at', tempFilePath);
    // We add a 'thumb_' prefix to thumbnails file name. That's where we'll upload the thumbnail.
    
    const newFileName = `new_${fileName}`;
    const newFilePath = path.join(path.dirname(filePath), newFileName);
    
    //const thumbFileName = `thumb_${fileName}`;
    //const thumbFilePath = path.join(path.dirname(filePath), thumbFileName);
    // Uploading the thumbnail.
    await bucket.upload(tempFilePath, {
        destination: newFilePath,
        metadata: metadata,
    });

    // 임시파일 삭제
    // Once the thumbnail has been uploaded delete the local file to free up disk space.
    return fs.unlinkSync(tempFilePath);
    // [END thumbnailGeneration]

//     [ { Id: '1',
//     'Petal.Length': '1.4',
//     'Petal.Width': '0.2',
//     Species: 'setosa' },
//   { Id: '2',
//     'Petal.Length': '1.4',
//     'Petal.Width': '0.2',
//     Species: 'setosa' },
//   { Id: '3',
//     'Petal.Length': '1.3',
//     'Petal.Width': '0.2',
//     Species: 'setosa' },
//   { Id: '4',
//     'Petal.Length': '3.9',
//     'Petal.Width': '1.4',
//     Species: 'versicolor' },
//   { Id: '5',
//     'Petal.Length': '3.5',
//     'Petal.Width': '1',
//     Species: 'versicolor' },
//   { Id: '6',
//     'Petal.Length': '4.2',
//     'Petal.Width': '1.5',
//     Species: 'versicolor' },
//   { Id: '7',
//     'Petal.Length': '5.4',
//     'Petal.Width': '2.3',
//     Species: 'virginica' },
//   { Id: '8',
//     'Petal.Length': '5.1',
//     'Petal.Width': '1.8',
//     Species: 'virginica' } ]

    // require excelJs
    // read from a file
    // var workbook = new Excel.Workbook();
    // workbook.xlsx.readFile(filename)
    //     .then(function () {

    //         var maxCol = worksheet.getColumn(i).length;

    //         for (var i = 1; i < maxCol; i++) {

    //             workbook.eachRow(function(row, rowNumber) {

    //                 var id = row.getCell(1);
    //                 var name = row.getCell(2);
    //                 var birth = row.getCell(3);
    
    //                 console.log('Row ' + rowNumber + ' = ' + JSON.stringify(row.values));
    //             });


    //         }

   


    //         for (var i = 1; i < 4; i++) {
    //             // column 값을 가져온다
              

    //             // iterate over all current cells in this column
    //             col.eachCell(function (cell, rowNumber) {
    //                 // 
    //             });

    //         }

    //         return;
    //         // use workbook
    //     }).catch(function (error) {
    //         console.log("Error getting documents: ", error);
    //     });


});

// exports.getXlsxFromFirestore = functions.https.onRequest((req, res) => {
//     // Grab the text parameter.
//     const original = req.query.text;
//     // Push the new message into the Realtime Database using the Firebase Admin SDK.
//     return admin.database().ref('/messages').push({ original: original }).then((snapshot) => {
//         // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
//         return res.redirect(303, snapshot.ref.toString());
//     });
// });


// 실시간 데이터베이스에 메세지를 저장함
exports.addMessage = functions.https.onRequest((req, res) => {
    // Grab the text parameter.
    const original = req.query.text;
    // Push the new message into the Realtime Database using the Firebase Admin SDK.
    return admin.database().ref('/messages').push({ original: original }).then((snapshot) => {
        // Redirect with 303 SEE OTHER to the URL of the pushed object in the Firebase console.
        return res.redirect(303, snapshot.ref.toString());
    });
});

// 실시간 데이터베이스에서 메세지를 받아서 저장하게되는순간, 해당 부분은 대문자로변경함
// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeUppercase = functions.database.ref('/messages/{pushId}/original')
    .onCreate((snapshot, context) => {
        // Grab the current value of what was written to the Realtime Database.
        const original = snapshot.val();
        console.log('Uppercasing', context.params.pushId, original);
        const uppercase = original.toUpperCase();
        // You must return a Promise when performing asynchronous tasks inside a Functions such as
        // writing to the Firebase Realtime Database.
        // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
        return snapshot.ref.parent.child('uppercase').set(uppercase);
    });


// 새로운 환영자 알림 ( 파이어스토어에 기입 )
// login 을 인식한다
// Adds a message that welcomes new users into the chat.
exports.addWelcomeMessages = functions.auth.user().onCreate(async (user) => {
    console.log('A new user signed in for the first time.');
    const fullName = user.displayName || 'Anonymous';

    // Saves the new welcome message into the database
    // which then displays it in the FriendlyChat clients.
    await admin.firestore().collection('messages').add({
        name: 'Firebase Bot',
        profilePicUrl: '/images/firebase-logo.png', // Firebase logo
        text: `${fullName} signed in for the first time! Welcome!`,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log('Welcome message written to database.');
});


//   토큰 정리
//   마지막으로 우리는 더 이상 유효하지 않은 토큰을 제거하려고합니다. 
//   이것은 우리가 사용자로부터받은 토큰이 더 이상 브라우저 나 장치에 의해 사용되지 않을 때 발생합니다. 
//   예를 들어, 사용자가 브라우저 세션에 대한 알림 권한을 취소 한 경우에 발생합니다. 
//   이렇게하려면 파일에 다음 cleanupTokens함수를 추가 index.js하십시오.
// Cleans up the tokens that are no longer valid.
function cleanupTokens(response, tokens) {
    // For each notification we check if there was an error.
    const tokensDelete = [];
    response.results.forEach((result, index) => {
        const error = result.error;
        if (error) {
            console.error('Failure sending notification to', tokens[index], error);
            // Cleanup the tokens who are not registered anymore.
            if (error.code === 'messaging/invalid-registration-token' ||
                error.code === 'messaging/registration-token-not-registered') {
                const deleteTask = admin.firestore().collection('messages').doc(tokens[index]).delete();
                tokensDelete.push(deleteTask);
            }
        }
    });
    return Promise.all(tokensDelete);
}


//    알림 보내기
//    새로운 메시지가 게시 될 때를 감지하기 
//    functions.firestore.document().onCreate위해 Cloud Firestore의 지정된 경로에 
//    새로운 객체가 생성 될 때 코드를 실행 하는 Cloud Functions 트리거를 사용하게됩니다. 
//    sendNotifications함수를 index.js파일에 추가 하십시오.
// Sends a notifications to all users when a new message is posted.

exports.sendNotifications = functions.firestore.document('messages/{messageId}').onCreate(
    async (snapshot) => {
        // Notification details.
        const text = snapshot.data().text;
        const payload = {
            notification: {
                title: `${snapshot.data().name} posted ${text ? 'a message' : 'an image'}`,
                body: text ? (text.length <= 100 ? text : text.substring(0, 97) + '...') : '',
                icon: snapshot.data().profilePicUrl || '/images/profile_placeholder.png',
                click_action: `https://${process.env.GCLOUD_PROJECT}.firebaseapp.com`,
            }
        };

        // Get the list of device tokens.
        const allTokens = await admin.firestore().collection('fcmTokens').get();
        const tokens = [];
        allTokens.forEach((tokenDoc) => {
            tokens.push(tokenDoc.id);
        });

        if (tokens.length > 0) {
            // Send notifications to all tokens.
            const response = await admin.messaging().sendToDevice(tokens, payload);
            await cleanupTokens(response, tokens);
            console.log('Notifications have been sent and tokens cleaned up.');
        }
    });


// Cloud Firestore 트리거
// Cloud Functions를 사용하면 클라이언트 코드를 업데이트하지 않고도 Cloud Firestore의 이벤트를 처리할 수 있습니다. 
// DocumentSnapshot 인터페이스 또는 Admin SDK를 통해 Cloud Firestore를 변경할 수 있습니다.

// 일반적인 처리 과정에서 Cloud Firestore 함수는 다음을 수행합니다.

// 특정 문서가 변경되기를 기다립니다.
// 이벤트가 발생할 때 트리거되어 작업을 수행합니다. Cloud Functions로 무엇을 할 수 있나요?에서 사용 사례를 참조하세요.
// 지정된 문서에 저장된 데이터의 스냅샷을 포함하는 데이터 객체를 수신합니다. onWrite 또는 onUpdate 이벤트의 경우 데이터 객체에 이벤트 트리거 전후의 데이터 상태를 나타내는 스냅샷 2개가 포함됩니다.
// Firestore 인스턴스의 위치와 함수의 위치 간의 거리로 인해 상당한 네트워크 지연 시간이 발생할 수 있습니다. 해당되는 경우 성능을 최적화기 위해 함수 위치 지정을 고려해보세요.

// Cloud Firestore 함수 트리거
// Firebase용 Cloud 함수 SDK는 특정 이벤트에 연결된 핸들러를 만들 수 있는 functions.firestore 개체를 내보냅니다.

// Cloud Firestore는 create, update, delete, write 이벤트를 지원합니다.



// 참고: 와일드 카드를 사용할 때도 트리거가 항상 문서를 가리켜야 합니다. 
// 예를 들어 {messageCollectionId}는 컬렉션이므로 users/{userId}/{messageCollectionId}는 올바르지 않습니다.
//  그러나 {messageId}는 항상 문서를 가리키므로 users/{userId}/{messageCollectionId}/{messageId}는 문제가 없습니다.
// Listen for changes in all documents in the 'users' collection and all subcollections
exports.useMultipleWildcards = functions.firestore
    .document('users/{userId}/{messageCollectionId}/{messageId}')
    .onWrite((change, context) => {
        // If we set `/users/marie/incoming_messages/134` to {body: "Hello"} then
        // context.params.userId == "marie";
        // context.params.messageCollectionId == "incoming_messages";
        // context.params.messageId == "134";
        // ... and ...
        // change.after.data() == {body: "Hello"}
    });



//     데이터 쓰기
// 각 함수 호출은 Cloud Firestore 데이터베이스의 특정 문서와 연관됩니다. 
// 함수로 반환되는 스냅샷의 ref 속성에 있는 DocumentReference로 이 문서에 액세스할 수 있습니다.

// Listen for updates to any `user` document.
exports.countNameChanges = functions.firestore
    .document('users/{userId}')
    .onUpdate((change, context) => {
        // Retrieve the current and previous value
        const data = change.after.data();
        const previousData = change.before.data();

        // We'll only update if the name has changed.
        // This is crucial to prevent infinite loops.
        if (data.name == previousData.name)
            return null;

        // Retrieve the current count of name changes
        let count = data.name_change_count;
        if (!count) {
            count = 0;
        }

        // Then return a promise of a set operation to update the count
        return change.after.ref.set({
            name_change_count: count + 1
        }, { merge: true });
    });


// 다른 개체와 마찬가지로 속성에 액세스할 수 있습니다. 또는 get 함수를 사용하여 특정 필드에 액세스할 수 있습니다.
exports.updateUser = functions.firestore
    .document('users/{userId}')
    .onUpdate((change, context) => {
        // Get an object representing the current document
        const newValue = change.after.data();

        // ...or the previous value before this update
        const previousValue = change.before.data();

        // Fetch data using standard accessors
        const age = change.data().age;
        const name = change.data()['name'];

        // Fetch data using built in accessor
        const experience = change.get('experience');

    });
