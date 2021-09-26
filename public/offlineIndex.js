
//We need to create a database for INDEXDB to store values on your localhost.

let localDB;
const request = indexedDB.open("offlineBudget",1);
const incomingTransaction =  "pending";

request.onupgradedneed = event => {

  //set the local to the target
  localDB = event.target.result;
  // Check to see if the event is being read
  console.log(event);

}

//This code checks if offline requests are good.
request.onsuccess = event => {
  console.log("Offline Request is a success");
  if (navigator.onLine) {
    checkDB();
  }
}

request.onerror = event => {
  console.log("Offline Request has failed");
  console.log("Offline error code" + event);
}

function checkDB() {
  const openTransaction = localDB.transaction([incomingTransaction], 'readwrite');
  const storeTransaction = openTransaction.objectStore(incomingTransaction);
  const retreiveTransaction = storeTransaction.getAll();

  retreiveTransaction.onsuccess = () => {
    if (getAll.result.length > 0) {
      fetch('/api/transaction/bulk', {
        method: 'POST',
        body: JSON.stringify(retreiveTransaction.result),
        headers: {
            Accept: 'application/json, text/plain, */*', 
            'Content-Type': 'application/json'
        },
      }).then((response) => {
        openTransaction = localDB.transaction("pending", "readwrite");
        storeTransaction = openTransaction.objectStore(incomingTransaction);
        storeTransaction.clear();

      });
    }
  }
}

function saveRecord(record) {
  const openTransaction = localDB.transaction(incomingTransaction, "readwrite");
  const storeTransaction = openTransaction.objectStore("pending");
  storeTransaction.add(record);
  

}