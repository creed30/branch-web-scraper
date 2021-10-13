var request = require('request');
const fs = require("fs");
const AWS = require('aws-sdk');

AWS.config.update({
    region: "us-east-1",
    endpoint: "http://localhost:4566"
});

var docClient = new AWS.DynamoDB.DocumentClient();

const BASE_URL = "https://easycfangularapi.azurewebsites.net/filer/documentsearch/";
const ATLANTA_UUID = "6FEAF788-905D-4455-B36D-BF3F5E96F189";
const CAMPAIGN_CONTRIBUTION_DISCLOSURE = "campaign contribution disclosure report";
const TABLE = "test2";
const DATE_PARAM = "2021-05-12"

const DOCUMENT_URL = "https://easycfangularapi.azurewebsites.net/documents/%s/viewfinalredactedpdf";

// call Atlanta URL and return json of all candidate metadata
// var options = {
//   'method': 'GET',
//   'url': BASE_URL + ATLANTA_UUID,
//   'headers': {
//   }
// };

// request(options, function (error, response) {
//   if (error) throw new Error(error);
//   console.log(response.body);

//  fs.writeFile('file.json', response.body, (error) => {
//     if (error) throw error;
//   });
// });
function runMain() {

    fs.readFile('./test/atlanta-candidate-meta-all.json', 'utf8', (err, data) => {

        if (err) {
            console.log(`Error reading file from disk: ${err}`);
        } else {

            // parse JSON string to JSON object
            const atlantaMetadata = JSON.parse(data);

            //Top level going through all candidates
            atlantaMetadata.forEach(candidate => {

                // second level going through all documents within each candidate
                candidate.documents.forEach(document => {

                    // check to make sure the document type is not null or empty
                    if (document.documenttype != null && document.documenttype != '') {

                        //convert so we can compare to our enumeration
                        var documentTypeLower = document.documenttype.toLowerCase();

                        //set to check includes because there are different variations such as 
                        // a space at the end and words before and after
                        if (documentTypeLower.includes(CAMPAIGN_CONTRIBUTION_DISCLOSURE)) {

                            // compare the input date with the date submitted
                            const dateSubmitted = new Date(formatDate(document.datesubmitted));
                            if (dateSubmitted > new Date(DATE_PARAM)) {

                                //set up object to be stored
                                var documentMetadata = document;

                                // removing extra unneeded fields and appending all other fields to the object
                                delete documentMetadata.documentnameid;
                                for (var prop in candidate) {
                                    if (candidate.hasOwnProperty(prop) && prop != 'documents' && prop != 'imgurl') {
                                        documentMetadata[prop] = candidate[prop];
                                    }
                                }


                                documentMetadata.documentUrl = `https://easycfangularapi.azurewebsites.net/documents/${documentMetadata.documentid}/viewfinalredactedpdf`
                                console.log(JSON.stringify(documentMetadata));
                                storeDocumentMetadata(documentMetadata, "atlanta");
                            } 
                        }
                    }
                });
            });
        }

    });
}

function storeDocumentMetadata(documentMetadata, city) {
    var today = new Date().toISOString().slice(0, 10);

    var cityUploadDate = `${city}-${today}`;
    var params = {
        TableName: TABLE,
        Item: {
            "document-id": documentMetadata.documentid,
            "city-upload-date": cityUploadDate,
            "documentMetadata": documentMetadata
        }
    };

    console.log("Adding a new item...");
    docClient.put(params, function (err, data) {
        if (err) {
            console.error("Unable to add item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("Added item:", JSON.stringify(data, null, 2));
        }
    });
}


function formatDate(input) {
    if (input === null) {
        return "0001-01-01";
    }
    return `20${input.substring(6, 8)}-${input.substring(0, 2)}-${input.substring(3, 5)}`;
}

runMain();