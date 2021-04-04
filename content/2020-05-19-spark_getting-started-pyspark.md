Title: Getting Started with PySpark
Date: 2020-05-19 09:30 PM
Category: Big Data
Status: published

## Some Context

I have been using the pandas library for almost 2 years now, but I have always been interested in getting started with using PySpark in a big data project. Since I intend to build a daily habit of taking notes of what I've learnt (which I haven't really been keeping up since I end up feeling pressured to write some perfect long post whenever I start writing), I have decided to start off by writing down some notes on PySpark while I follow through the courses on Datacamp and Dataquest.

## Spark DataFrames

Spark's core data structure is the Resilient Distributed Dataset (RDD), a low-level object which enables Spark to scale on big data by splitting data across multiple nodes in the cluster. RDDs support two types of operations: *transformations*, which create a new dataset from an existing one, and *actions*, which return a value to the driver program after performing a computation on the dataset.

However, RDDs are tricky to work with directly; hence, the Spark DataFrame abstraction built on top of RDDs is designed to make processing of large datasets easier (similar to SQL table) and more optimized for complicated operations compared with RDDs.

## Creating a SparkSession

To start working with Spark DataFrames, we first have to create a SparkSession object from our SparkContext - SparkContext is the connection to the cluster while the SparkSession acts as our interface with that connection.

To create a SparkSession in the cluster environment, it is usually best practice to use the **SparkSession.builder.getOrCreate()** method which returns an existing SparkSession in the environment or create a new SparkSession if necessary.

:::python

    # Import SparkSession from pyspark.sql
    from pyspark.sql import SparkSession

    # Create spark
    spark = SparkSession.builder.getOrCreate()

    # Print spark
    print(spark)

    >> <pyspark.sql.session.SparkSession object at 0x7fa498a13cf8>

## Viewing Tables in a Spark Cluster

A SparkSession object has an attribute called **catalog** which lists all the data inside the cluster. To list the names of all the tables in the cluster, we use the .listTables() method in the **catalog** attribute.

:::python

    # Print the list of tables in the catalog
    print(spark.catalog.listTables())

## Querying Spark DataFrame with SQL

One of the advantages of the DataFrame interface is that we can run SQL queries on the tables in our Spark cluster. To run a query on a table in the Spark cluster, we use the .sql() method on our SparkSession. This method takes a string containing the query as input, and returns a DataFrame with the results.

For example, if I would like to query the first 10 rows from the 'flights' table in our Spark cluster, I perform the .sql() method on my SparkSession object and use .show() to display the query results.

:::python

    # query first 10 rows from flights table
    query = "FROM flights SELECT * LIMIT 10"

    # Get the first 10 rows of flights
    flights10 = spark.sql(query)

    # Show the results
    flights10.show()

## References

[Introduction to PySpark - DataCamp](https://campus.datacamp.com/courses/introduction-to-pyspark/)
[RDD Programming Guide - Spark 2.4.5 Documentation](https://spark.apache.org/docs/latest/rdd-programming-guide.html)
[Spark SQL and DataFrames - Spark 2.4.5 Documentation](https://spark.apache.org/docs/latest/sql-programming-guide.html)
