Title: MultiIndex.to_frame()
Date: 2020-01-09 18:06
Category: Pandas
Status: published

## Problem

From a MultiIndex dataframe, determine the total number of elements in the Buyer column for each Vendor.

## What I did

Let's say we have the following DataFrame:
  
:::python

    >> df = pd.DataFrame(data=
        {'Vendor': ['A', 'A', 'B', 'C', 'C', 'C',
                'D', 'D', 'E', 'E', 'F', 'G', 'G'],      
        'Buyer':['BU1', 'BU3', 'BU2', 'BU1', 'BU3', 'BU4',
                'BU1', 'BU2', 'BU1', 'BU4', 'BU2', 'BU1', 'BU3'],
        'Amount':[1, 5, 20, 103, 234, 13, 15,
            23, 156, 60, 97, 23, 14]}
    )

    >> df
    |     |   Vendor    |    Buyer     |  Amount |
    |:---:|:-----------:|:------------:| -------:|
    | 0   |      A      |     BU1      |      1  |
    | 1   |      A      |     BU3      |      5  |
    | 2   |      B      |     BU2      |     20  |
    | 3   |      C      |     BU1      |    103  |
    | 4   |      C      |     BU3      |    234  |
    | 5   |      C      |     BU4      |     13  |
    | 6   |      D      |     BU1      |     15  |
    | 7   |      D      |     BU2      |     23  |
    | 8   |      E      |     BU1      |    156  |
    | 9   |      E      |     BU4      |     60  |
    | 10  |      F      |     BU2      |     97  |
    | 11  |      G      |     BU1      |     23  |
    | 12  |      G      |     BU3      |     14  |

First, apply GroupBy and Aggregate by Vendor and Buyer:

:::python

    >> df_groupby_agg = df.groupby(
        ['Vendor', 'Buyer']).agg(
            total_value=pd.NamedAgg(column='Amount', aggfunc=np.sum)
        )
    )

    >> df_groupby_agg

    |         |              | total_value  |
    |:-------:|:------------:| ------------:|
    | Vendor  |    Buyer     |              |
    |:-------:|:------------:| ------------:|
    | A       |    BU1       |        1     |
    |         |    BU3       |        5     |
    |:-------:|:------------:| ------------:|
    | B       |    BU2       |       20     |
    |:-------:|:------------:| ------------:|
    | C       |    BU1       |      103     |
    |         |    BU3       |      234     |
    |         |    BU4       |       13     |
    |:-------:|:------------:| ------------:|
    | D       |    BU1       |       15     |
    |         |    BU2       |       23     |
    |:-------:|:------------:| ------------:|
    | E       |    BU1       |      156     |
    |         |    BU4       |       60     |
    |:-------:|:------------:| ------------:|
    | F       |    BU2       |       97     |
    | G       |    BU1       |       23     |
    |         |    BU3       |       14     |

Next, create a DataFrame with the levels of the MultiIndex as columns:
  
:::python

    >> df_multiindex = df_groupby_agg.index.to_frame(index=False)

    >> df_multiindex

    |     |   Vendor  |   Buyer  |
    |:---:|:---------:|:--------:|
    | 0   |       A   |    BU1   |
    | 1   |       A   |    BU3   |
    | 2   |       B   |    BU2   |
    | 3   |       C   |    BU1   |
    | 4   |       C   |    BU3   |
    | 5   |       C   |    BU4   |
    | 6   |       D   |    BU1   |
    | 7   |       D   |    BU2   |
    | 8   |       E   |    BU1   |
    | 9   |       E   |    BU4   |
    | 10  |       F   |    BU2   |
    | 11  |       G   |    BU1   |
    | 12  |       G   |    BU3   |

Lastly, use '.loc[]' and 'count()' to obtain Buyer count for each Vendor:
  
:::python

    >> df_multiindex.set_index('Vendor').loc['E'].count()

    pd.DataFrame(data=...
    Buyer    2
    dtype: int64

    >> df_multiindex.set_index('Vendor').loc['E'].count().sum()

    2
