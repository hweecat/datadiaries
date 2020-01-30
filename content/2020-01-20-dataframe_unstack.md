Title: Dataframe manipulation sequence - GroupBy Agg, Melt, Unstack
Date: 2020-01-09 18:06
Category: Pandas
Status: draft

Problem: From a MultiIndex dataframe, determine the total number of elements in the Buyer column for each Vendor.

What I did:


:::python

    >> df = pd.DataFrame(data=
        {'Vendor': ['A', 'A', 'B', 'C', 'C', 'C',
                'D', 'D', 'E', 'E', 'F', 'G', 'G'],      
        'Buyer':['BU1', 'BU3', 'BU2', 'BU1', 'BU3', 'BU4',
                'BU1', 'BU2', 'BU1', 'BU4', 'BU2', 'BU1', 'BU3'],
        'Amount':[1, 5, 20, 103, 234, 13, 15,
            23, 156, 60, 97, 23, 14]}
    )



    >> agg_df = \
        df.groupby(
            [column_level0_agg, column_level1_agg]).agg(**{
                'Transaction Count': pd.NamedAgg(column='Transaction No.', aggfunc='nunique'),
                'Total PV ($)': pd.NamedAgg(column='PO Value in SGD', aggfunc=np.sum)
            })

    agg_df.reset_index(
                inplace=True).sort_values(
                    column_level1_agg, column_level0_agg], inplace=True)

    df_melt = agg_df.melt(
            id_vars=[column_level0_agg, column_level1_agg],
            value_vars=['PO Count', 'Total PV ($)']
            )

    df_melt

    df_multiindex = df_melt.set_index(
                        [column_level0_agg, column_level1_agg, 'variable']
                        )

    df_multiindex

    df_unstack = df_multiindex.unstack(level=-2)

    df_unstack['Total'] = df_unstack.sum(axis=1)

    df_unstack
