function initializeWidget() {
  /*
   * Subscribe to the EmbeddedApp onPageLoad event before initializing the widget
   */
  ZOHO.embeddedApp.on("PageLoad", function (data) {
    /*
     * Verify if EntityInformation is Passed
     */
    if (data && data.Entity) {
      console.log(data);
      /*
       * Fetch Information of Record passed in PageLoad
       * and insert the response into the dom
       */
      ZOHO.CRM.API.getRecord({
        Entity: data.Entity,
        RecordID: data.EntityId,
      }).then(function (response) {
        console.log(data);
        document.getElementById("recordInfo").innerHTML = JSON.stringify(
          response,
          null,
          2
        );
      });
    }

    // Create an array to store messages and their data which is needed to order to and from in chronological order
    var messages = [];
    // getting sms module data from zoho database
    ZOHO.CRM.API.getAllRecords({ Entity: "test123", sort_order: "desc" })
      .then(function (data) {
        // iterating through the sms object and creating the smsData variable using for of loop
        for (smsData of data.data) {
          // Format the date and time
          var rawDate = new Date(smsData.Date_Time);
          var formattedDate =
            ("0" + (rawDate.getMonth() + 1)).slice(-2) +
            "-" +
            ("0" + rawDate.getDate()).slice(-2) +
            "-" +
            rawDate.getFullYear() +
            " " +
            ("0" + (rawDate.getHours() % 12 || 12)).slice(-2) +
            ":" +
            ("0" + rawDate.getMinutes()).slice(-2) +
            " " +
            (rawDate.getHours() >= 12 ? "pm" : "am");

          // Push message data to the messages array in order chronologically
          messages.push({
            text: smsData.Text_Body_01,
            time: formattedDate,
            from: smsData.From,
            to: smsData.Name,
            contactId: smsData.Contact_ID,
          });
        }
        // Sort the messages by timestamp after collecting all messages
        messages.sort(function (a, b) {
          return new Date(b.time) - new Date(a.time);
        });
        // iterating over the element of the messages array using a forEach loop
        messages.forEach(function (messageData) {
          var newRow = $("<tr>");
          // the to(from safeplan to client) logic
          // using if statement so safeplan does not dynically get link href since it wont be going anywhere
          if (messageData.to !== "SAFEPLAN") {
            var contactLink = $("<a>").text(messageData.to).attr("href", "#");
            // Use a closure to capture the correct contactLink and contactId
            // this is the function that gets the contactId of the specific person
            (function (contactLink) {
              contactLink.click(function (e) {
                e.preventDefault();
                openContactDetails(messageData.contactId); // Open the contact details for this SMS
              });
            })(contactLink);
          } else {
            var contactLink = messageData.to;
          }
          // the from(from client to safeplan) logic
          // same as "to" logic but for "from"
          if (messageData.from !== "SAFEPLAN") {
            var fromContactLink = $("<a>")
              .text(messageData.from)
              .attr("href", "#");
            // Use a closure to capture the correct contactLink and contactId
            (function (fromContactLink) {
              fromContactLink.click(function (e) {
                e.preventDefault();
                openContactDetails(messageData.contactId); // Open the contact details for this SMS
              });
            })(fromContactLink);
          } else {
            var fromContactLink = messageData.from;
          }
          // appending variables to a dynamically set <td> html
          var tdTwo = $("<td class='w-25'>").append(fromContactLink);
          var tdThree = $("<td scope='row' class='w-25'>").append(contactLink);
          var tdFirst = $("<td class='w-25'>").text(messageData.text);
          var tdTime = $("<td class='w-25'>").text(messageData.time);

          // appending the elements to the new row
          newRow.append(tdTwo);
          newRow.append(tdThree);
          newRow.append(tdFirst);
          newRow.append(tdTime);

          // appending the new row to the ID we have in the html file
          $("#sms_singleLine2").append(newRow);
        });
        // using the js sdk for zoho rm to open contact page based off of the specific contact ID
        function openContactDetails(contactId) {
          ZOHO.CRM.UI.Record.open({
            Entity: "Contacts",
            RecordID: `${contactId}`,
          }).then(function (data) {
            console.log(data);
          });
        }
        // }
      })
      .catch(function (error) {
        console.error("An error occurred:", error);
      });
  });
  /*
   * initialize the widget.
   */
  ZOHO.embeddedApp.init();
}
