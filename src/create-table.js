var AWS = require("aws-sdk");

AWS.config.update({
  region: "us-west-2",
  endpoint: "http://localhost:4566"
});

var dynamodb = new AWS.DynamoDB();

var params = {
    TableName : "candidate-documents",
    KeySchema: [       
        { AttributeName: "document-id", KeyType: "HASH"},  //Partition key
        { AttributeName: "city-upload-date", KeyType: "RANGE" }  //Sort key
    ],
    AttributeDefinitions: [       
        { AttributeName: "document-id", AttributeType: "S" },
        { AttributeName: "city-upload-date", AttributeType: "S" }
    ],
    ProvisionedThroughput: {       
        ReadCapacityUnits: 10, 
        WriteCapacityUnits: 10
    }
};

dynamodb.createTable(params, function(err, data) {
    if (err) {
        console.error("Unable to create table. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("Created table. Table description JSON:", JSON.stringify(data, null, 2));
    }
});