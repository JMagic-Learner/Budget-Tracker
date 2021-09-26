"use strict";

const pendingObjectStoreName = `pending`;

// create a new db request for a "budget" database.

// //We need to create a database for INDEXDB to store values on your localhost.


// const request = indexedDB.open("offlineBudget",1);
// const incomingTransaction =  "pending";

const request = indexedDB.open(`budget`, 1);


// request.onupgradedneed = event => {
//   const localDB = request.result;
//   //set the local to the target
//   localDB.creatObjectStore(incomingTransaction, {
//     keyPath: "id",
//     autoincrement: true
//   });
//   // Check to see if the event is being read
//   console.log("onUpgraded");
//   console.log(event);


// }

request.onupgradeneeded = event => {
    const db = request.result;

    // create object store called "pending" and set autoIncrement to true
    // const db = event.target.result;
    console.log(event);

    if (!db.objectStoreNames.contains(pendingObjectStoreName)) {
        db.createObjectStore(pendingObjectStoreName, { autoIncrement: true });
    }
};

request.onsuccess = event => {
    console.log(`Success! ${event.type}`);
    // check if app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = event => console.error(event);

// //This code checks if offline requests are good.
// request.onsuccess = event => {
//   console.log("Offline Request is a success");
//   if (navigator.onLine) {
//     checkDB();
//   }
// }

// request.onerror = event => {
//   console.log("Offline Request has failed");
//   console.log("Offline error code" + event);
// }

function checkDatabase() {
    const db = request.result;

    // open a transaction on your pending db
    let transaction = db.transaction([pendingObjectStoreName], `readwrite`);

    // access your pending object store
    let store = transaction.objectStore(pendingObjectStoreName);

    // get all records from store and set to a variable
    const getAll = store.getAll();

    getAll.onsuccess = () => {
        if (getAll.result.length > 0) {
            fetch(`/api/transaction/bulk`, {
                method: `POST`,
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: `application/json, text/plain, */*`,
                    "Content-Type": `application/json`
                }
            })
                .then(response => response.json())
                .then(() => {
                    // if successful, open a transaction on your pending db
                    transaction = db.transaction([pendingObjectStoreName], `readwrite`);

                    // access your pending object store
                    store = transaction.objectStore(pendingObjectStoreName);

                    // clear all items in your store
                    store.clear();
                });
        }
    };
}

// function checkDB() {
//   const localDB = request.result;
//   const openTransaction = localDB.transaction([incomingTransaction], 'readwrite');
//   const storeTransaction = openTransaction.objectStore(incomingTransaction);
//   const retreiveTransaction = storeTransaction.getAll();

//     if(localDB) {
//       console.log("Local DB has been detected in checkDB");
//     }

//   retreiveTransaction.onsuccess = () => {
//     if (getAll.result.length > 0) {
//       fetch('/api/transaction/bulk', {
//         method: 'POST',
//         body: JSON.stringify(retreiveTransaction.result),
//         headers: {
//             Accept: 'application/json, text/plain, */*', 
//             'Content-Type': 'application/json'
//         },
//       }).then((response) => {
//         transaction = localDB.transaction("pending", "readwrite");
//         storeTransaction = openTransaction.objectStore(incomingTransaction);
//         storeTransaction.clear();

//       });
//     }
//   }
// }

// eslint-disable-next-line no-unused-vars
function saveRecord(record) {
    const db = request.result;

    // create a transaction on the pending db with readwrite access
    const transaction = db.transaction([pendingObjectStoreName], `readwrite`);

    // access your pending object store
    const store = transaction.objectStore(pendingObjectStoreName);

    // add record to your store with add method.
    store.add(record);
}

// listen for app coming back online
window.addEventListener(`online`, checkDatabase);


// function saveRecord(record) {
//   const openTransaction = localDB.transaction(incomingTransaction, "readwrite");
//   const storeTransaction = openTransaction.objectStore("pending");
//   storeTransaction.add(record);
  

// }

// window.addEventListener('online', checkDB);