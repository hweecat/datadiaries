Title: MultiIndex.set_levels() in pandas
Date: 2020-01-04 10:20
Category: Pandas
Status: published

Problem:
A user filed an issue on the pandas repo regarding MultiIndex.set_levels - and it turns out the user had some confusion between the set_levels method and the set_names method for MultiIndex due to the documentation. Hence, the MultiIndex.set_levels documentation was marked by the maintainers for improvements to clarify that MultiIndex.set_levels() interprets passed values as new components of the .levels attribute.

What I did:
As suggested by @jreback, I updated the docstring of MultiIndex.set_levels directly so that it would be reflected in the API reference. I made the following changes to the docstring:

1. Added an extra value to make the example clearer.
    - From my discussion with Marc Garcia (@datapythonista), my intention of adding an extra value at one of the levels (same for the MultiIndex above) is to further highlight the differences in passing values to the two levels in the MultiIndex, for which the number of values in each level are not equal. Using different number of values in each level is to emphasize that set_levels() passes values to indexes on 'by level' basis (by changing the levels attribute), not on 'by row / integer code' basis.

2. Added an additional example to clarify that MultiIndex.set_levels() interprets passed values as new components of the .levels attribute.
    - The intention of the following example is to illustrate that set_levels() passes values into the levels attribute that is represented by a FrozenList containing list of values for each level in the MultiIndex, even when the number of values passed for a level is more than the number of indexes available in the MultiIndex itself.
        
    :::python

        >> idx.set_levels([['a', 'b', 'c'], [1, 2, 3, 4]], level=[0, 1])

        MultiIndex([('a', 1),
                    ('a', 2),
                    ('b', 1),
                    ('b', 2)],
                names=['foo', 'bar'])

        >> idx.set_levels([['a', 'b', 'c'], [1, 2, 3, 4]], level=[0, 1]).levels

        FrozenList([['a', 'b', 'c'], [1, 2, 3, 4]])

3. Added the clarification that MultiIndex.set_levels() interprets passed values as new components of the .levels attribute and stores the passed values even if any of the levels passed to set_levels() exceeds the existing length.
    - The following clarification was finalized in the docs after feedback from Will Ayd (@WillAyd) and G. Young (@gfyoung):
        "If any of the levels passed to set_levels() exceeds the existing length, all of the values from that argument will be stored in the MultiIndex levels, though the values will be truncated in the MultiIndex output."

Updated docs: [https://dev.pandas.io/docs/reference/api/pandas.MultiIndex.set_levels.html](https://dev.pandas.io/docs/reference/api/pandas.MultiIndex.set_levels.html)
