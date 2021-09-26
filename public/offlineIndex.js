
//We need to create a database for INDEXDB to store values on your localhost.


const request = indexedDB.open("offlineBudget",1);
const incomingTransaction =  "pending";

request.onupgradedneed = event => {
  const localDB = request.result;
  //set the local to the target
  localDB.creatObjectStore(incomingTransaction, {
    keyPath: "id",
    autoincrement: true
  });
  

  // Check to see if the event is being read
  console.log("onUpgraded");
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
  const localDB = request.result;
  const openTransaction = localDB.transaction([incomingTransaction], 'readwrite');
  const storeTransaction = openTransaction.objectStore(incomingTransaction);
  const retreiveTransaction = storeTransaction.getAll();

    if(localDB) {
      console.log("Local DB has been detected in checkDB");
    }

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
        transaction = localDB.transaction("pending", "readwrite");
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

window.addEventListener('online', checkDB);