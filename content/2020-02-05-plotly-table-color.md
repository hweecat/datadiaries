Title: Conditional Colors in Plotly Tables
Date: 2020-02-05 18:06
Category: Pandas
Status: published

## Problem

Generate a data table in Plotly that has the following features:

1. Alternating cell and line colors for odd/even rows
2. Unique cell color on first column
3. For third column onwards, color cells using two different colors based on two levels of upper-bound/lower-bound conditions

## What I did

### Step 1: Define Pandas DataFrame to transform into Plotly Table

Let's go back to the table that was created in the previous note:

:::python

    >> df_unstack

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

The DataFrame has the following hierarchial indexing properties: 2 levels of column indices and 2 levels of row indices.

For the column indices:

:::python
    >> df_unstack.columns

    MultiIndex([('value', 'BU1'),
            ('value', 'BU2')],
           names=[None, 'Buyer'])

For the row indices:

:::python
    >> df_unstack.index

    MultiIndex([('A',            'Count'),
                ('A', 'Total Amount ($)'),
                ('B',            'Count'),
                ('B', 'Total Amount ($)'),
                ('C',            'Count'),
                ('C', 'Total Amount ($)'),
                ('D',            'Count'),
                ('D', 'Total Amount ($)'),
                ('E',            'Count'),
                ('E', 'Total Amount ($)')],
               names=['Vendor', 'variable'])

### Step 2: Create backend table for metric used in the conditions

For example, I would like to use a ratio of two variables as one of the metrics for the upper-bound/lower-bound conditions. As the ratio is not explicitly displayed on the data table, I create a backend table to store the ratios.

:::python

    def pv_po_ratio_analysis(df_table, column_level1_agg):
    
        po_count_df = df_table[
                        df_table['Item'] == 'Count'
                        ].set_index(
                            [column_level1_agg, 'Item']
                            ).reset_index('Item'
                                        ).drop(columns='Item')
        
        total_pv_df = df_table[
                        df_table['Item'] == 'Total PV ($)'
                        ].set_index(
                            [column_level1_agg, 'Item']
                            ).reset_index('Item'
                                        ).drop(columns='Item')
                            
        pv_po_ratio_df = total_pv_df.div(po_count_df, fill_value=0)
        
        return pv_po_ratio_df

### Step 3: Define conditions for conditional formatting of cell colors

For this example, I would like to color cells using two different colors based on two levels of conditions:

1. PO Count >= T1
2. PV/PO ratio < T2 (pink) or PV/PO ratio > T3 (yellow)

Criteria no. 1 on PO Count needs to be fulfilled before traversing down to criteria 2 on PV/PO ratio. To obtain the boolean DataFrames that represent whether the value in each cell fulfils the less-than or more-than conditions for the metrics (in this case, PO Count and PV/PO ratio), we first define the DataFrames that represent these metrics.

:::python

    # define DataFrame for the metrics PO Count, PV and PV/PO ratio

    po_count_df = df_table[
                    df_table['Item'] == 'Count'
                    ].set_index(
                        [column_level1_agg, 'Item']
                        ).reset_index('Item'
                                      ).drop(columns='Item')

    pv_df = df_table[
                    df_table['Item'] == 'Total PV ($)'
                    ].set_index(
                        [column_level1_agg, 'Item']
                        ).reset_index('Item'
                                      ).drop(columns='Item')
    
    pv_po_ratio_df = pv_po_ratio_analysis(df_table, column_level1_agg)

After the metric DataFrames are initialized, we make use of pandas-defined binary operator functions to apply boolean operations to the value in each cell.

:::python

    # set criterion using binary operators
    
    is_po_count_gt_threshold = po_count_df.ge(30)
    
    is_pv_po_ratio_lt_threshold1 = pv_po_ratio_df.lt(2000)
    
    is_pv_po_ratio_gt_threshold2 = pv_po_ratio_df.gt(5000)

### Step 4: Transform Pandas MultiIndex DataFrame into Plotly-compatible format

Since we would like to color the Count and Total Amount cells for each Buyer-Vendor combination based on the conditions, we use the Index.repeat() function in pandas to repeat each Index associated with the Vendor for the boolean DataFrames and reindex the DataFrames with the repeated Indexes.

:::python
    # Repeat rows
    is_po_count_gt_threshold_repeat = \
        is_po_count_gt_threshold.reindex(
            is_po_count_gt_threshold.index.repeat(2))
    
    is_pv_po_ratio_lt_threshold1_repeat = \
        is_pv_po_ratio_lt_threshold1.reindex(
            is_pv_po_ratio_lt_threshold1.index.repeat(2))
        
    is_pv_po_ratio_gt_threshold2_repeat = \
        is_pv_po_ratio_gt_threshold2.reindex(
            is_pv_po_ratio_gt_threshold2.index.repeat(2))

To transform the resulting boolean DataFrames into Plotly-compatible format, we need to understand how Plotly interprets and outputs table values.

According to the [documentation for Tables in Python with Plotly](https://plot.ly/python/table/), the data are arranged in a grid of rows and columns and the grid is represented as a vector of column vectors (which is known as a column-major order). Due to limitations in displaying MultiIndex DataFrames in Table format with Plotly, the original MultiIndex DataFrame has to be manipulated in a way that allows Plotly to read the header and cell values in the DataFrame.

When cell values for a Table object is defined in the following manner:

:::python

    fig = go.Figure(data=[go.Table(
        header=dict(
            values=['A Scores', 'B Scores']),
        cells=dict(
            values=[[100, 90, 80, 90], [95, 85, 75, 95]]))
        ])
    
    fig.show()

the Table object would be displayed column-wise in the following manner:

    |  A Scores   |  B Scores   |
    |:-----------:|:-----------:|
    |     100     |     95      |
    |     90      |     85      |
    |     80      |     75      |
    |     90      |     95      |

Column-major order also applies for header values, as illustrated by the example below:

:::python

    fig = go.Figure(data=[go.Table(
        header=dict(
            values=[['Scores', 'A'], ['Scores','B']]),
        cells=dict(
            values=[[100, 90, 80, 90], [95, 85, 75, 95]]))
        ])
    
    fig.show()

The Table object generated from the code snippet above would be displayed in the following manner:

    |   Scores    |   Scores    |
    |:-----------:|:-----------:|
    |      A      |      B      |
    |:-----------:|:-----------:|
    |     100     |     95      |
    |     90      |     85      |
    |     80      |     75      |
    |     90      |     95      |

To represent the row levels in the MultiIndex, the row levels in the DataFrame are defined as a list of lists having the same length as the number of row levels in the DataFrame.

Understanding how the header and cell values are defined in column-major order in Tables with Plotly is important, as the same column-major order is also used in specifying the styling for header and individual cells.

In the case of the boolean DataFrames generated from the earlier steps, list of values in DataFrames are typically read in row-major order i.e. **df.loc[row_idx,column_idx] or df.iloc[row_num,column_num]**. Hence, we would have to transform the DataFrames so that the list of values from the DataFrames follow the column-major order that Plotly uses to read table values i.e. **values=[df.column1, df.column2]**. Since column names for Buyer may vary, we transpose the DataFrames from row-major order to column-major order such that Plotly reads the values in column-major order.

:::python

    # Transpose tables so that list of values follow
    # how Plotly outputs table values
    is_po_count_gt_threshold_repeat_T = \
        is_po_count_gt_threshold_repeat.transpose().values.tolist()
    
    is_pv_po_ratio_lt_threshold1_repeat_T = \
        is_pv_po_ratio_lt_threshold1_repeat.transpose().values.tolist()
    
    is_pv_po_ratio_gt_threshold2_repeat_T = \
        is_pv_po_ratio_gt_threshold2_repeat.transpose().values.tolist()

### Step 5: Define conditional coloring of table cells

Finally, we define the conditional coloring of table cells, with alternating colors for odd and even rows if the table cell does not fulfil the conditional coloring conditions. For readability, the 'Total' column has been excluded from the conditional coloring and is instead colored with alternating colors for odd and even rows.

:::python

    def cond_to_color_cells(po_count_bool_array,
                        pv_po_ratio_high_bool_array,
                        pv_po_ratio_low_bool_array,
                        i, j):
    
        rowEvenColor = 'lavender'
        rowOddColor = 'white'
        rowPVPOratioUpperBoundColor = 'hotpink'
        rowPVPOratioLowerBoundColor = 'yellow'
        
        color = None
        
        if i % 2:
            color = rowOddColor
        else:
            color = rowEvenColor
        if po_count_bool_array[j][i] != 0  and j != (len(po_count_bool_array)-1):
            if pv_po_ratio_high_bool_array[j][i] != 0:
                color = rowPVPOratioUpperBoundColor
            elif pv_po_ratio_low_bool_array[j][i] != 0:
                color = rowPVPOratioLowerBoundColor
        
        return color