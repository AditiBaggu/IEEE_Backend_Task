<h1>GEMS Web Team Backend Task</h1>

This repository contains the backend implementation for the GEMS Web Team Backend Task. 
The task involves developing APIs using SQL as the underlying database. Below are the instructions and specifications for the APIs along with the SQL table creation code.
<br><br>
<h3>Database Table Creation</h3>
The following SQL code is used to create the user_invitee table:<br><br>
CREATE TABLE user_invitee.user_invitee (<br>
  id INT NOT NULL AUTO_INCREMENT,<br>
  name VARCHAR(45) NOT NULL,<br>
  email VARCHAR(45) NOT NULL,<br>
  phoneNumber VARCHAR(45) NOT NULL,<br>
  alternateEmail VARCHAR(45) NULL,<br>
  orgName VARCHAR(45) NULL,<br>
  orgRole VARCHAR(45) NULL,<br>
  validTill DATETIME NULL,<br>
  uniqueId VARCHAR(45) NOT NULL,<br>
  password VARCHAR(45) NULL,<br>
  PRIMARY KEY (id),<br>
  UNIQUE INDEX uniqueId_UNIQUE (uniqueId ASC) VISIBLE,<br>
  UNIQUE INDEX id_UNIQUE (id ASC) VISIBLE,<br>
  UNIQUE INDEX email_UNIQUE (email ASC) VISIBLE<br>
);<br><br><br>

<h3>Running the Code</h3>

    Clone this repository.
    Navigate to the project directory.
    Run npm install to install dependencies.
    Run npm start to start the server.

Make sure you have Node.js and npm installed on your machine.
