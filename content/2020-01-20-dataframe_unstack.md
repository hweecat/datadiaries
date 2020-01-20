Title: Dataframe manipulation sequence - GroupBy Agg, 
Date: 2020-01-09 18:06
Category: Pandas
Status: draft

Problem: From a MultiIndex dataframe, determine the total number of elements in the Buyer column for each Vendor.

What I did:


df



agg_df = \
    df.groupby(
        [column_level0_agg, column_level1_agg]).agg(**{
            'min value': pd.NamedAgg(column='PO Value in SGD', aggfunc='min'),
            'max value': pd.NamedAgg(column='PO Value in SGD', aggfunc='max'),
            'mean value': pd.NamedAgg(column='PO Value in SGD', aggfunc=np.mean),
            'PO Count': pd.NamedAgg(column='Purch.doc.', aggfunc='nunique'),
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