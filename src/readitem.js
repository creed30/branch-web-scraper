var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-1",
  endpoint: "http://localhost:4566"
});

var docClient = new AWS.DynamoDB.DocumentClient();

var table = "candidate-documents";

var documentId = "BA75580A-6192-4C67-B469-B4796786672C";
var title = "atlanta-2021-10-05";

var params = {
    TableName: table,
    Key:{
        "document-id": documentId,
        "city-upload-date": title
    }
};

docClient.get(params, function(err, data) {
    if (err) {
        console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
    }
});