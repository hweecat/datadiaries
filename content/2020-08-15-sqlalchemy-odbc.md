Title: Connecting to Microsoft SQL Server using SQLAlchemy and PyODBC
Date: 2020-08-15 19:47
Category: Databases
Status: published

## Problem

Connect to a remotely-hosted Microsoft SQL Server within a Python script, using SQLAlchemy as a database abstraction toolkit and PyODBC as a connection engine to access the database within the remotely-hosted SQL Server.

## Today I Learnt

When writing programs that involve interacting with a database, we need to use connection modules or client drivers to establish a database connection in order to send commands and receive responses in the form of a result set.

Connecting to Microsoft SQL Server from a Python program requires the use of ODBC driver as a native data access API. Before we can access a database in Microsoft SQL Server, we need to configure a Data Source Name (DSN) for the data source (database/server) with the ODBC driver on the native machine hosting the target SQL Server database.

In the setup I'm using for the data pipeline simulation, the Microsoft SQL Server is hosted remotely on a Windows Server 2019 Virtual Machine (VM).

### Step 1: Create a DSN for the target data source

On the same machine that is hosting the target SQL Server database (in my case, the Windows Server 2019 VM), I created a DSN for the target data source using ODBC Data Source Administrator applet.

#### What is a Data Source Name (DSN)?

A Data Source Name (DSN) is a symbolic name that represents a connection to an ODBC Data Source. It stores the connection details such as the database name, directory, database driver, User ID, password etc. when connecting to the ODBC Data Source.

There are 3 types of DSN that can be created on the ODBC Data Source applet:

1. System DSN
2. User DSN
3. File DSN

**System DSN** is used throughout the system such that anyone with proper rights may log in to access the DSN, and must be created on the machine where the SQL Server database program is located. System DSN is stored in the Windows Registry under HKEY_LOCAL_MACHINE.

**User DSN** is a user-specific DSN that is visible only to the user who created the DSN. Hence, only the user who created the User DSN is able to use and connect to the target data source using the User DSN. User DSN is stored in the Windows Registry under HKEY_CURRENT_USER.

**File DSN** is stored in a text file with a .DSN extension instead of the Windows Registry. A file DSN contains the information required to connect to the target data source, while the ODBC driver must be installed locally in the same machine that is hosting the target data source. File DSNs are stored by default at C:\Program Files\Common Files\Odbc\Data Sources, though they can be stored in a custom directory.

#### What connection details are included in a DSN?

A DSN contains the following connection details:

1. Driver
2. Server
3. Database
4. Is it a Trusted Connection (connection within the same machine using Windows login)?
5. User ID (UID)
6. Password (PWD)

### Step 2: Test DSN access to target data source on native machine

After creating a DSN for the target data source (SQL Server database), I tested whether the DSN is able to access the target data source with the native machine by clicking the 'Test Data Source...' button on the ODBC Data Source administrator applet. 

Note that the DSN needs to be able to access the target data source within the native machine first, before we could configure remote access to the target data source from a Python script via a connection engine such as PyODBC. Once the DSN has been configured correctly and tested successfully, we can proceed to the next step of connecting to the target data source remotely. 

### Step 3: Set up connection string in Python for connecting remotely to SQL Server database

To access a SQL Server database from a Python program, PyODBC is required as a connection engine to set up a connection string that contains information about the database connection.

A connection string for connecting to an SQL Server instance looks something like this:

:::

    # For Trusted Connection
    Driver={ODBC Driver 17 for SQL Server};Server=serverName\instanceName;Database=myDataBase;Trusted_Connection=yes;

:::

    # For Server Connection
    Driver={ODBC Driver 17 for SQL Server};Server=serverName\instanceName;Database=myDataBase;UID=myusername;PWD=mypassword;

### Step 4: Initialize remote connection to SQL Server database

When using PyODBC to create the database connection, the initialization of the connection string looks like this:

:::

    import pyodbc 
    server = 'serverName\instanceName,port' # to specify an alternate port
    database = 'mydb' 
    username = 'myusername' 
    password = 'mypassword' 
    cnxn = pyodbc.connect('DRIVER={ODBC Driver 17 for SQL Server};SERVER='+server+';DATABASE='+database+';UID='+username+';PWD='+ password)
    cursor = cnxn.cursor()

The connection string is passed as input to the ``pyodbc.connect()`` function, which initializes a connection defined based on parameters in the connection string.

### Step 5: Convert connection string to SQLAlchemy format

What if I want to:

1. Change my database connection details
2. Change database server
3. Change database type from SQL Server to some other database, such as MySQL or Postgres
4. Use named parameters in my queries
5. Avoid the use of raw string queries to protect against SQL injection attacks without having to deal with the complexities of changing hard-coded database connection settings and dialect-specific nuances?

A quick note about using query parameters in PyODBC: - PyODBC supports the use of parameter markers using a question mark as placeholder in the SQL query. However, it does not natively support the use of named parameters in SQL queries.

Using a database abstraction layer such as SQLAlchemy would be useful in handling the nuances associated with different SQL dialects, as well as providing some protection against SQL injection through the use of built queries.

In SQLAlchemy, the connection string format to create a database engine is as follows:

::

    {Database Type}+{Database Connector}://{login}:{password}@{host}:{port}/{Database}?driver={Driver with spaces replaced with +}

What if I want to use Trusted Connection to access my SQL Server instance? Here's the hostname connection string format in SQLAlchemy:

::

    {Database Type}+{Database Connector}://{host}:{port}/{Database}?driver={Driver with spaces replaced with +}?TrustedConnection=yes

Hard-coding parameters within a connection string can be the simplest way to set up a database connection, but what if I want to parse parameters into the connection string without writing the connection string in full?

### PyODBC connections

According to SQLAlchemy's documentation, an exact PyODBC connection string can be sent in pyodbc's format directly using the parameter odbc_connect. As the delimiters need to be URL-encoded (especially the Driver), urllib.parse.quote_plus is used to encode the PyODBC connection string.

:::

    import urllib
    from sqlalchemy import create_engine

    server = 'serverName\instanceName,port' # to specify an alternate port
    database = 'mydb' 
    username = 'myusername' 
    password = 'mypassword'

    params = urllib.parse.quote_plus("'DRIVER={ODBC Driver 17 for SQL Server};SERVER='+server+';DATABASE='+database+';UID='+username+';PWD='+ password")

    engine = create_engine("mssql+pyodbc:///?odbc_connect=%s" % params)

### What about hostname connections

If we intend to move across databases (from MySQL to PostgreSQL for example), it might be preferred to pass hostname connections to SQLAlchemy engine instead by using the hostname connection string format.