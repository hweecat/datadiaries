Title: Conditional Colors in Plotly Tables
Date: 2020-01-09 18:06
Category: Pandas
Status: draft

## Problem

Generate a data table in Plotly that has the following features:

1. Alternating cell and line colors for odd/even rows
2. Unique cell color on first column
3. For third column onwards, color cells using two different colors based on two levels of upper-bound/lower-bound conditions

## What I did

### Step 1: Transform Pandas MultiIndex DataFrame to Plotly-compatible Table format

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

Understanding how the header and cell values are defined column-wise in Tables with Plotly is important, as the same column-wise behavior is also used in defining the formatting of the Table header and cells.

Let's go back to the table that 

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

Criteria no. 1 on PO Count needs to be fulfilled before traversing down to criteria 2 on PV/PO ratio.

:::python

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
    
    # set criterion using binary operators
    
    is_po_count_gt_threshold = po_count_df.ge(30)
    
    is_pv_po_ratio_lt_threshold1 = pv_po_ratio_df.lt(2000)
    
    is_pv_po_ratio_gt_threshold2 = pv_po_ratio_df.gt(5000)
