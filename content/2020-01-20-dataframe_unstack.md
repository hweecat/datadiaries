Title: Dataframe manipulation sequence - GroupBy Agg, Melt, Unstack
Date: 2020-01-20 18:06
Category: Pandas
Status: published

## Problem

From a Pandas DataFrame, massage the DataFrame into a format where order Count and Total Amount could be determined for each Vendor and each Vendor-Buyer combination.

:::python

    >> df = pd.DataFrame(data=
        {'Vendor': ['A', 'A', 'A', 'B', 'B', 'C', 'C', 'C', 'C',
                'D', 'D', 'E', 'E', 'E', 'E', 'E'],      
        'Buyer':['BU1', 'BU2', 'BU2', 'BU2', 'BU2', 'BU1', 'BU2', 'BU2', 'BU2',
                'BU1', 'BU2', 'BU1', 'BU2', 'BU2', 'BU1', 'BU2'],
        'Amount':[1, 5, 10, 20, 40, 103, 234, 13, 15, 30,
            23, 156, 60, 97, 23, 14]})

    >> df

       Vendor Buyer  Amount
    0       A   BU1       1
    1       A   BU2       5
    2       A   BU2      10
    3       B   BU2      20
    4       B   BU2      40
    5       C   BU1     103
    6       C   BU2     234
    7       C   BU2      13
    8       C   BU2      15
    9       D   BU1      30
    10      D   BU2      23
    11      E   BU1     156
    12      E   BU2      60
    13      E   BU2      97
    14      E   BU1      23
    15      E   BU2      14

## What I did

First, compute the aggregate values (Count, Total Amount ($)) for Vendor-Buyer combinations by using GroupBy aggregation (groupby().agg()):

:::python

    >> agg_df = \
        df.groupby(
            ['Vendor', 'Buyer']).agg(**{
                'Count': pd.NamedAgg(column='Amount', aggfunc='count'),
                'Total Amount ($)': pd.NamedAgg(column='Amount', aggfunc=np.sum)
            })
    
    >> agg_df

                  Count  Total Amount ($)
    Vendor Buyer
    A      BU1        1                 1
           BU2        2                15
    B      BU2        2                60
    C      BU1        1               103
           BU2        3               262
    D      BU1        1                30
           BU2        1                23
    E      BU1        2               179
           BU2        3               171

Reset index of DataFrame in order to sort the data by Buyer and Vendor using **sort_values**.

    >> agg_df_2 = agg_df.reset_index()
    
    >> agg_df_2

        Vendor Buyer  Count  Total Amount ($)
    0      A   BU1      1                 1
    1      A   BU2      2                15
    2      B   BU2      2                60
    3      C   BU1      1               103
    4      C   BU2      3               262
    5      D   BU1      1                30
    6      D   BU2      1                23
    7      E   BU1      2               179
    8      E   BU2      3               171
    
    >> agg_df_3 = agg_df_2.sort_values(['Buyer', 'Vendor'])

    >> agg_df_3

        Vendor Buyer  Count  Total Amount ($)
    0      A   BU1      1                 1
    3      C   BU1      1               103
    5      D   BU1      1                30
    7      E   BU1      2               179
    1      A   BU2      2                15
    2      B   BU2      2                60
    4      C   BU2      3               262
    6      D   BU2      1                23
    8      E   BU2      3               171

**DataFrame.melt** "unpivots" a DataFrame into a format where one or more columns are identifier variables (id_vars), while all other columns, considered measured variables (value_vars), are "unpivoted" to the row axis. This leaves two non-identifier columns, 'variable' and 'value', where 'variable' contains the measured variables and 'value' contains the values corresponding to the measured variables.

    >> df_melt = agg_df_3.melt(
            id_vars=['Vendor', 'Buyer'],
            value_vars=['Count', 'Total Amount ($)']
            )

    >> df_melt

        Vendor Buyer          variable  value
    0       A   BU1             Count      1
    1       C   BU1             Count      1
    2       D   BU1             Count      1
    3       E   BU1             Count      2
    4       A   BU2             Count      2
    5       B   BU2             Count      2
    6       C   BU2             Count      3
    7       D   BU2             Count      1
    8       E   BU2             Count      3
    9       A   BU1  Total Amount ($)      1
    10      C   BU1  Total Amount ($)    103
    11      D   BU1  Total Amount ($)     30
    12      E   BU1  Total Amount ($)    179
    13      A   BU2  Total Amount ($)     15
    14      B   BU2  Total Amount ($)     60
    15      C   BU2  Total Amount ($)    262
    16      D   BU2  Total Amount ($)     23
    17      E   BU2  Total Amount ($)    171

**DataFrame.unstack** "pivots" a level of the hierarchial index labels to the column axis and returns a reshaped DataFrame with a new level of column labels, whose inner-most level consists of the pivoted index labels. This implies that a DataFrame which does not have indexing on the row axis will be "pivoted" to a Series.

    >> df_multiindex = df_melt.set_index(
                        ['Vendor', 'Buyer', 'variable']
                        )

    >> df_multiindex

                                    value
    Vendor Buyer variable
    A      BU1   Count                 1
    C      BU1   Count                 1
    D      BU1   Count                 1
    E      BU1   Count                 2
    A      BU2   Count                 2
    B      BU2   Count                 2
    C      BU2   Count                 3
    D      BU2   Count                 1
    E      BU2   Count                 3
    A      BU1   Total Amount ($)      1
    C      BU1   Total Amount ($)    103
    D      BU1   Total Amount ($)     30
    E      BU1   Total Amount ($)    179
    A      BU2   Total Amount ($)     15
    B      BU2   Total Amount ($)     60
    C      BU2   Total Amount ($)    262
    D      BU2   Total Amount ($)     23
    E      BU2   Total Amount ($)    171

    >> df_multiindex.unstack(level=-2)

                                 value
    Buyer                      BU1    BU2
    Vendor variable
    A      Count               1.0    2.0
           Total Amount ($)    1.0   15.0
    B      Count               NaN    2.0
           Total Amount ($)    NaN   60.0
    C      Count               1.0    3.0
           Total Amount ($)  103.0  262.0
    D      Count               1.0    1.0
           Total Amount ($)   30.0   23.0
    E      Count               2.0    3.0
           Total Amount ($)  179.0  171.0
    
    >>> df_multiindex.unstack(level=-1)

                     value
    variable     Count Total Amount ($)
    Vendor Buyer
    A      BU1       1                1
           BU2       2               15
    B      BU2       2               60
    C      BU1       1              103
           BU2       3              262
    D      BU1       1               30
           BU2       1               23
    E      BU1       2              179
           BU2       3              171

    >>> df_multiindex.unstack(level=0)

                           value
    Vendor                     A     B      C     D      E
    Buyer variable
    BU1   Count              1.0   NaN    1.0   1.0    2.0
          Total Amount ($)   1.0   NaN  103.0  30.0  179.0
    BU2   Count              2.0   2.0    3.0   1.0    3.0
          Total Amount ($)  15.0  60.0  262.0  23.0  171.0

Since I am interested in calculating the overall Count and Total Amount for each Vendor, I pivot the Buyer level to the column axis and retain the Vendor level in the row axis, and calculate the sum along the column axis.

    >> df_unstack = df_multiindex.unstack(level=-2)

    >> df_unstack['Total'] = df_unstack.sum(axis=1)

    >>> df_unstack
                             value         Total
    Buyer                      BU1    BU2
    Vendor variable
    A      Count               1.0    2.0    3.0
           Total Amount ($)    1.0   15.0   16.0
    B      Count               NaN    2.0    2.0
           Total Amount ($)    NaN   60.0   60.0
    C      Count               1.0    3.0    4.0
           Total Amount ($)  103.0  262.0  365.0
    D      Count               1.0    1.0    2.0
           Total Amount ($)   30.0   23.0   53.0
    E      Count               2.0    3.0    5.0
           Total Amount ($)  179.0  171.0  350.0
