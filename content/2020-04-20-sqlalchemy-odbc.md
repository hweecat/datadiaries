Title: Connecting to Microsoft SQL Server using SQLAlchemy and PyODBC
Date: 2020-04-20 18:06
Category: Databases
Status: draft

## Problem

Connect to a remotely-hosted Microsoft SQL Server within a Python script, using SQLAlchemy as a database abstraction toolkit and PyODBC as a connection engine to access the database within the remotely-hosted SQL Server.

## Today I Learnt

When writing programs that involve interacting with a database, we need to use connection modules or client drivers to establish a database connection in order to send commands and receive responses in the form of a result set.

Connecting to Microsoft SQL Server from a Python program requires the use of ODBC driver as a native data access API. Before we can access a database in Microsoft SQL Server, we need to configure a Data Source Name that 